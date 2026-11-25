"use client";

import { useState, useEffect, useRef, use } from "react";
import { ArrowLeft, Upload, X, Save, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FileErrorModal from "@/components/admin/FileErrorModal";
import StickySaveBar from "@/components/admin/StickySaveBar";

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const multipleFilesInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");
        const fetchedImages: string[] =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.coverImage
            ? [data.coverImage]
            : [];
        setImages(fetchedImages);
        setCoverImage(fetchedImages[0] || "");
      } else {
        toast.error("Collection not found");
        router.push("/admin/collections");
      }
    } catch (error) {
      console.error("Failed to fetch collection", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  // Upload multiple images for the carousel
  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files: File[] = Array.from(fileList);
    const oversizedFiles = files.filter(f => f.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setFileError(`Some files exceed the 2MB limit: ${oversizedFiles.map(f => f.name).join(", ")}`);
      if (multipleFilesInputRef.current) multipleFilesInputRef.current.value = "";
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages(prev => {
          const next = [...prev, ...uploadedUrls];
          if (!coverImage && next.length > 0) {
            setCoverImage(next[0]);
          }
          return next;
        });
        toast.success(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""} successfully!`);
      }
    } catch (error) {
      console.error("Multiple image upload failed", error);
      toast.error("Failed to upload one or more images");
    } finally {
      setUploading(false);
      if (multipleFilesInputRef.current) multipleFilesInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, idx) => idx !== indexToRemove);
    setImages(newImages);
    setCoverImage(newImages.length > 0 ? newImages[0] : "");
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
    setCoverImage(updated.length > 0 ? updated[0] : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const finalCover = images.length > 0 ? images[0] : "";

      const res = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          coverImage: finalCover,
          images,
        }),
      });

      if (res.ok) {
        toast.success("Collection updated successfully!");
        router.push("/admin/collections");
        router.refresh();
      } else {
        toast.error("Failed to update collection");
      }
    } catch (error) {
      console.error("Failed to update collection", error);
      toast.error("Failed to update collection");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading collection...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="pb-6 mb-8 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/collections" className="w-10 h-10 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Collection</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Update collection details and multiple carousel images.</p>
          </div>
        </div>

        <button 
          type="submit"
          form="collection-form"
          disabled={saving || uploading}
          className="bg-[#2C2B29] text-white rounded-xl font-semibold text-xs uppercase tracking-wider px-6 py-2.5 hover:bg-black transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
        >
          <Save size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-8">
        <form id="collection-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={handleNameChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Slug URL</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD]"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] min-h-[100px]"
            />
          </div>

          {/* Multiple Collection Carousel Images Section */}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-600" />
                  Carousel & Gallery Images ({images.length})
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload multiple images to be displayed in the 7-second sliding carousel on the storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() => multipleFilesInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
              >
                <Upload size={14} />
                <span>{uploading ? "Uploading..." : "+ Upload Multiple Images"}</span>
              </button>
            </div>

            {/* Hidden Multiple File Input */}
            <input 
              type="file" 
              ref={multipleFilesInputRef} 
              onChange={handleMultipleUpload} 
              accept="image/*" 
              multiple 
              className="hidden" 
            />

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {images.map((src, idx) => {
                return (
                  <div 
                    key={idx}
                    className="relative group rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 bg-gray-50 transition-all shadow-sm"
                  >
                    <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={src} 
                        alt={`Slide ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Top controls bar */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Slide #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="pointer-events-auto bg-white/95 text-gray-600 hover:text-red-600 hover:bg-white p-1.5 rounded-full shadow-md transition-all active:scale-95"
                        title="Remove image"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Bottom action controls */}
                    <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, "left")}
                          disabled={idx === 0}
                          className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move earlier in carousel sequence"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-[11px] text-gray-400 font-mono">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, "right")}
                          disabled={idx === images.length - 1}
                          className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move later in carousel sequence"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Upload Drop Card */}
              <div
                onClick={() => multipleFilesInputRef.current?.click()}
                className="aspect-[16/10] sm:aspect-auto sm:min-h-[160px] border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl bg-[#F8F9FD] hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors p-4 text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform mb-2">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {uploading ? "Uploading..." : "+ Add More Images"}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  Select multiple files (PNG, JPG, WEBP)
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
            <button 
              type="submit"
              disabled={saving || uploading}
              className="bg-blue-600 text-white rounded-xl font-semibold text-sm px-8 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-200 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <FileErrorModal error={fileError} onClose={() => setFileError(null)} />

      {/* Floating Sticky Save Bar */}
      <StickySaveBar
        formId="collection-form"
        saving={saving}
        label="Save Changes"
        subtext="Collection Settings"
      />
    </div>
  );
}
