"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Video, 
  Eye, 
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import StickySaveBar from "@/components/admin/StickySaveBar";

interface MediaItem {
  id: string;
  type: "image" | "video";
  src: string;
}

interface HeroData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  mediaItems: MediaItem[];
}

export default function HeroBannerManager() {
  const [data, setData] = useState<HeroData>({
    title: "illustrated stories\nfor slow living.",
    subtitle: "Thoughtfully designed pieces that carry\nart, colour and character.",
    buttonText: "EXPLORE COLLECTIONS",
    buttonLink: "/collections",
    mediaItems: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // New slide via URL state
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customType, setCustomType] = useState<"image" | "video">("image");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hero");
      if (res.ok) {
        const json = await res.json();
        setData({
          title: json.title || "",
          subtitle: json.subtitle || "",
          buttonText: json.buttonText || "EXPLORE COLLECTIONS",
          buttonLink: json.buttonLink || "/collections",
          mediaItems: Array.isArray(json.mediaItems) ? json.mediaItems : [],
        });
      }
    } catch (err) {
      console.error("Failed to load hero banner settings", err);
      toast.error("Failed to load hero settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (data.mediaItems.length === 0) {
      toast.error("Please include at least one slide image or video.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success("Hero banner updated successfully!");
      } else {
        toast.error(resData.message || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      toast.loading("Uploading media file...", { id: "uploading" });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        const newSlide: MediaItem = {
          id: `slide-${Date.now()}`,
          type: isVideo ? "video" : "image",
          src: json.url,
        };

        setData((prev) => ({
          ...prev,
          mediaItems: [...prev.mediaItems, newSlide],
        }));

        toast.success("Media uploaded and added to slides!", { id: "uploading" });
      } else {
        toast.error(json.message || "Upload failed", { id: "uploading" });
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Failed to upload media file", { id: "uploading" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddViaUrl = () => {
    if (!customUrl.trim()) {
      toast.error("Please enter a valid image or video URL");
      return;
    }

    const newSlide: MediaItem = {
      id: `slide-${Date.now()}`,
      type: customType,
      src: customUrl.trim(),
    };

    setData((prev) => ({
      ...prev,
      mediaItems: [...prev.mediaItems, newSlide],
    }));

    setCustomUrl("");
    setIsUrlModalOpen(false);
    toast.success("Slide added via URL!");
  };

  const handleRemoveSlide = (index: number) => {
    setData((prev) => {
      const updated = prev.mediaItems.filter((_, i) => i !== index);
      return { ...prev, mediaItems: updated };
    });
    if (activePreviewIndex >= data.mediaItems.length - 1) {
      setActivePreviewIndex(Math.max(0, data.mediaItems.length - 2));
    }
  };

  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.mediaItems.length) return;

    setData((prev) => {
      const items = [...prev.mediaItems];
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, mediaItems: items };
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        <RefreshCw size={24} className="animate-spin text-gray-400 mr-3" />
        <span className="font-medium text-sm">Loading Hero settings...</span>
      </div>
    );
  }

  const currentPreviewSlide = data.mediaItems[activePreviewIndex] || data.mediaItems[0];

  return (
    <div className="w-full pb-24">
      {/* Header Banner (Normal flow, not sticky) */}
      <div className="pb-6 mb-8 border-b border-[#E8E6E1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#8B8985] font-semibold">Storefront</span>
            <span className="text-[#8B8985]">/</span>
            <span className="text-xs uppercase tracking-widest text-[#2C2B29] font-semibold">Landing Page</span>
          </div>
          <h1 className="text-2xl font-serif text-[#2C2B29] font-bold mt-1">Hero Banner & Headings</h1>
          <p className="text-xs text-[#8B8985] mt-1">
            Customize the photos, videos, main title, and description displayed on the homepage hero.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2C2B29] text-white hover:bg-black transition-colors font-medium text-xs uppercase tracking-widest disabled:opacity-50 shadow-sm"
        >
          {saving ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={15} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Card 1: Texts Configuration */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-sm">
            <h2 className="text-base font-serif font-bold text-[#2C2B29] mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-[#C2A17A]" />
              Landing Page Texts
            </h2>
            <p className="text-xs text-[#8B8985] mb-6">
              These texts are positioned over the hero background media on the homepage.
            </p>

            <div className="space-y-5">
              {/* Main Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2C2B29] mb-1.5">
                  Hero Title (Main Heading)
                </label>
                <textarea
                  rows={3}
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="illustrated stories&#10;for slow living."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29] transition-colors leading-relaxed font-sans resize-none"
                />
                <span className="text-[11px] text-[#8B8985] mt-1 block">
                  Tip: Press Enter to create a line break like &quot;illustrated stories&quot; / &quot;for slow living.&quot;
                </span>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2C2B29] mb-1.5">
                  Hero Subtitle (Description)
                </label>
                <textarea
                  rows={3}
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  placeholder="Thoughtfully designed pieces that carry&#10;art, colour and character."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29] transition-colors leading-relaxed font-sans resize-none"
                />
                <span className="text-[11px] text-[#8B8985] mt-1 block">
                  Short secondary statement displayed underneath the main heading.
                </span>
              </div>

              {/* Button text & Link Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2C2B29] mb-1.5">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={data.buttonText}
                    onChange={(e) => setData({ ...data, buttonText: e.target.value })}
                    placeholder="EXPLORE COLLECTIONS"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs uppercase tracking-wider text-[#2C2B29] focus:outline-none focus:border-[#2C2B29] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2C2B29] mb-1.5">
                    Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={data.buttonLink}
                    onChange={(e) => setData({ ...data, buttonLink: e.target.value })}
                    placeholder="/collections"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-[#2C2B29] focus:outline-none focus:border-[#2C2B29] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Background Media Slides */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-serif font-bold text-[#2C2B29] mb-1 flex items-center gap-2">
                  <ImageIcon size={16} className="text-[#C2A17A]" />
                  Hero Carousel Slides ({data.mediaItems.length})
                </h2>
                <p className="text-xs text-[#8B8985]">
                  Images and video loops that cycle automatically in the background.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF9F7] border border-[#E8E6E1] text-[#2C2B29] hover:bg-[#F2F0ED] transition-colors text-xs font-medium"
                >
                  <Upload size={13} />
                  <span>Upload Media</span>
                </button>

                {/* Add Via URL Button */}
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FAF9F7] border border-[#E8E6E1] text-[#2C2B29] hover:bg-[#F2F0ED] transition-colors text-xs font-medium"
                >
                  <LinkIcon size={13} />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {/* Slides List */}
            {data.mediaItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-medium text-gray-500">No slides added yet</p>
                <p className="text-[11px] text-gray-400 mt-1">Upload images or videos to display in the hero banner.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.mediaItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                      activePreviewIndex === index
                        ? "border-[#2C2B29] bg-[#FAF9F7]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div 
                      onClick={() => setActivePreviewIndex(index)}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200 cursor-pointer group"
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white text-[10px]">
                          <Video size={18} className="text-white/80 mb-1" />
                          <span>Video</span>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.src}
                          alt="Slide preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActivePreviewIndex(index)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#2C2B29]">Slide #{index + 1}</span>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                            item.type === "video"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.type}
                        </span>
                        {activePreviewIndex === index && (
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 size={11} className="text-emerald-500" /> Active Preview
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate font-mono max-w-md">{item.src}</p>
                    </div>

                    {/* Actions: Reorder & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(index, "down")}
                        disabled={index === data.mediaItems.length - 1}
                        title="Move Down"
                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(index)}
                        title="Remove Slide"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2C2B29] flex items-center gap-2">
                  <Eye size={14} className="text-[#8B8985]" />
                  Live Hero Preview
                </span>
                <span className="text-[11px] text-[#8B8985]">
                  Slide {activePreviewIndex + 1} of {data.mediaItems.length || 1}
                </span>
              </div>

              {/* Preview Window */}
              <div className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-inner bg-black flex flex-col justify-end p-6 text-white border border-gray-800">
                {/* Background media */}
                {currentPreviewSlide ? (
                  currentPreviewSlide.type === "video" ? (
                    <video
                      src={currentPreviewSlide.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={currentPreviewSlide.src}
                      alt="Hero Live Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500 text-xs">
                    No Slide Selected
                  </div>
                )}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                {/* Navbar mockup */}
                <div className="absolute top-4 inset-x-4 flex justify-between items-center text-white/80 pointer-events-none">
                  <span className="text-[10px] tracking-widest uppercase">SHOP</span>
                  <Image src="/images/logo1.png" alt="logo" width={22} height={24} className="h-6 w-auto object-contain" />
                  <span className="text-[10px] tracking-widest uppercase">DISCOVER</span>
                </div>

                {/* Foreground Texts */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-sans leading-tight mb-2 whitespace-pre-line font-normal">
                    {data.title || "illustrated stories\nfor slow living."}
                  </h3>
                  <p className="text-xs font-sans font-light text-white/90 mb-4 whitespace-pre-line leading-relaxed max-w-xs">
                    {data.subtitle || "Thoughtfully designed pieces that carry\nart, colour and character."}
                  </p>
                  <span className="text-[11px] font-sans tracking-widest uppercase text-white/90 underline underline-offset-4 block">
                    {data.buttonText || "EXPLORE COLLECTIONS"}
                  </span>

                  {/* Dots */}
                  <div className="flex gap-1.5 mt-5">
                    {data.mediaItems.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i === activePreviewIndex ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-[#FAF9F7] border border-[#E8E6E1] text-[11px] text-gray-500 leading-relaxed">
                Click any slide on the left list to inspect it in this preview window. Click &quot;Save Changes&quot; when you are ready to publish.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add via URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-base font-serif font-bold text-gray-900 mb-1">Add Slide via URL</h3>
            <p className="text-xs text-gray-500 mb-5">
              Enter a direct image or video URL (e.g. from Supabase, Cloudinary, or your public folder).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Media Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomType("image")}
                    className={`py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                      customType === "image"
                        ? "border-[#2C2B29] bg-[#2C2B29] text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ImageIcon size={14} /> Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomType("video")}
                    className={`py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                      customType === "video"
                        ? "border-[#2C2B29] bg-[#2C2B29] text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Video size={14} /> Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Media URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={customType === "video" ? "https://.../video.mp4" : "https://.../photo.jpg"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddViaUrl}
                  className="px-5 py-2 text-xs font-semibold bg-[#2C2B29] text-white rounded-lg hover:bg-black transition-colors"
                >
                  Add Slide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Save Bar */}
      <StickySaveBar
        onSave={handleSave}
        saving={saving}
        label="Save Changes"
        subtext={`${data.mediaItems.length} slides ready`}
      />
    </div>
  );
}
