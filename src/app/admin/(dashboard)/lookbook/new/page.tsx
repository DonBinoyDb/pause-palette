"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, CheckCircle2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StickySaveBar from "@/components/admin/StickySaveBar";
import FileErrorModal from "@/components/admin/FileErrorModal";

interface SlotData {
  imageUrl: string;
  title: string;
  linkUrl: string;
}

const INITIAL_SLOTS: SlotData[] = [
  { imageUrl: "", title: "", linkUrl: "" },
  { imageUrl: "", title: "", linkUrl: "" },
  { imageUrl: "", title: "", linkUrl: "" },
  { imageUrl: "", title: "", linkUrl: "" },
  { imageUrl: "", title: "", linkUrl: "" },
];

const SLOT_META = [
  { label: "Slot 1 (Top Left)", tag: "Top Row - Col 1", aspect: "aspect-[3/4]", isWide: false },
  { label: "Slot 2 (Top Center)", tag: "Top Row - Col 2", aspect: "aspect-[3/4]", isWide: false },
  { label: "Slot 3 (Top Right)", tag: "Top Row - Col 3", aspect: "aspect-[3/4]", isWide: false },
  { label: "Slot 4 (Bottom Wide)", tag: "Bottom Row - Spans 2 Columns", aspect: "aspect-[16/10] md:aspect-[16/9]", isWide: true },
  { label: "Slot 5 (Bottom Right)", tag: "Bottom Row - Col 3", aspect: "aspect-[3/4]", isWide: false },
];

export default function NewLookbookSet() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotData[]>(INITIAL_SLOTS);
  const [products, setProducts] = useState<any[]>([]);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIdx: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      setFileError("The selected image exceeds the 2MB size limit. Please choose a smaller image under 2MB.");
      if (fileInputRefs.current[slotIdx]) fileInputRefs.current[slotIdx]!.value = "";
      return;
    }

    setUploadingSlot(slotIdx);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = { ...next[slotIdx], imageUrl: data.url };
          return next;
        });
        toast.success(`Slot ${slotIdx + 1} image uploaded!`);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed");
    } finally {
      setUploadingSlot(null);
      if (fileInputRefs.current[slotIdx]) {
        fileInputRefs.current[slotIdx]!.value = "";
      }
    }
  };

  const updateSlotField = (slotIdx: number, field: "title" | "linkUrl", value: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = { ...next[slotIdx], [field]: value };
      return next;
    });
  };

  const clearSlotImage = (slotIdx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = { ...next[slotIdx], imageUrl: "" };
      return next;
    });
  };

  const filledCount = slots.filter((s) => s.imageUrl).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (filledCount < 5) {
      const missing = slots
        .map((s, idx) => (!s.imageUrl ? idx + 1 : null))
        .filter(Boolean)
        .join(", ");
      if (
        !window.confirm(
          `Only ${filledCount} of 5 images are uploaded (Missing Slot ${missing}). The lookbook grid requires all 5 pictures to display properly. Do you want to proceed anyway?`
        )
      ) {
        return;
      }
    }

    setLoading(true);
    try {
      // Filter only slots that have an image uploaded
      const itemsToSave = slots
        .map((slot, index) => ({
          title: slot.title.trim() || null,
          linkUrl: slot.linkUrl.trim() || null,
          imageUrl: slot.imageUrl,
          isPublished: true,
          slotIndex: index,
        }))
        .filter((s) => s.imageUrl);

      const res = await fetch("/api/lookbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToSave }),
      });

      if (res.ok) {
        toast.success("Lookbook set created successfully!");
        router.push("/admin/lookbook");
      } else {
        toast.error("Failed to save lookbook set");
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save lookbook set");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="lookbook-set-form" onSubmit={handleSubmit} className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-28">
      {/* Header Banner */}
      <div className="pb-6 mb-8 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/lookbook"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors border border-gray-100 shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add Lookbook Set</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Each lookbook set requires 5 images to fill the editorial grid.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1.5 border border-blue-100">
            <CheckCircle2 size={14} className={filledCount === 5 ? "text-green-600" : "text-blue-500"} />
            <span>{filledCount} of 5 Slots Filled</span>
          </div>
          <button
            type="submit"
            disabled={loading || filledCount === 0}
            className="px-6 py-2.5 bg-red-400 text-white rounded-full text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 shadow-md shadow-red-200 cursor-pointer"
          >
            {loading ? "Saving Set..." : "Save Set (5 Images)"}
          </button>
        </div>
      </div>

      {/* Grid Layout Preview Guidance */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p>
          <strong>Lookbook Grid Layout:</strong> Slots 1, 2, and 3 appear on the top row. Slot 4 is the wide featured image spanning 2 columns on the bottom row, alongside Slot 5.
        </p>
      </div>

      {/* 5 Slots Editor arranged matching the visual grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map((slot, idx) => {
          const meta = SLOT_META[idx];
          const isSlotUploading = uploadingSlot === idx;

          return (
            <div
              key={idx}
              className={`bg-white p-5 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border transition-all ${
                meta.isWide ? "md:col-span-2" : "md:col-span-1"
              } ${slot.imageUrl ? "border-green-200" : "border-gray-100"}`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[11px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {meta.label}
                  </h3>
                  <span className="text-[11px] text-gray-400 font-medium">{meta.tag}</span>
                </div>
                {slot.imageUrl && (
                  <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    Ready ✓
                  </span>
                )}
              </div>

              {/* Image Upload Area */}
              <div className="mb-4">
                {slot.imageUrl ? (
                  <div className={`${meta.aspect} relative rounded-2xl overflow-hidden border border-gray-200 bg-[#F8F9FD] group`}>
                    <Image
                      src={slot.imageUrl}
                      alt={slot.title || `Slot ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[idx]?.click()}
                        className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded-full shadow-sm font-semibold hover:bg-gray-100 cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => clearSlotImage(idx)}
                        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full shadow-sm font-semibold hover:bg-red-600 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                    disabled={isSlotUploading}
                    className={`w-full ${meta.aspect} border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50/70 transition-colors bg-[#F8F9FD] cursor-pointer`}
                  >
                    {isSlotUploading ? (
                      <span className="text-xs font-semibold animate-pulse">Uploading...</span>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs mb-2 text-blue-500">
                          <Upload size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-semibold">Upload Photo</span>
                        <span className="text-[10px] text-gray-400 mt-1">JPEG or PNG</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  type="file"
                  ref={(el) => { fileInputRefs.current[idx] = el; }}
                  onChange={(e) => handleImageUpload(e, idx)}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Slot Details (Caption & Link) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-500 font-semibold mb-1">
                    Caption / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={slot.title}
                    onChange={(e) => updateSlotField(idx, "title", e.target.value)}
                    placeholder="e.g. Tropical Dawn"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-[#F8F9FD]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-500 font-semibold mb-1">
                    Link to Product (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={slot.linkUrl}
                      onChange={(e) => updateSlotField(idx, "linkUrl", e.target.value)}
                      placeholder="/product/tropical-dawn"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-[#F8F9FD]"
                    />
                    <select
                      className="border border-gray-200 rounded-xl px-2 py-2 text-xs font-medium text-gray-700 bg-[#F8F9FD] max-w-[110px]"
                      onChange={(e) => {
                        if (e.target.value) {
                          updateSlotField(idx, "linkUrl", e.target.value);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Select...</option>
                      {products.map((p) => (
                        <option key={p.id} value={`/product/${p.slug}`}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Save Bar */}
      <StickySaveBar
        formId="lookbook-set-form"
        saving={loading}
        label="Save Lookbook Set"
        subtext={`${filledCount} of 5 images selected`}
      />

      <FileErrorModal error={fileError} onClose={() => setFileError(null)} />
    </form>
  );
}
