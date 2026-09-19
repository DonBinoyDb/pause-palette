"use client";

import { useState, useEffect, useRef, use } from "react";
import { ArrowLeft, Upload, X, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FileErrorModal from "@/components/admin/FileErrorModal";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/categories/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");
        setCoverImage(data.coverImage || "");
      } else {
        toast.error("Category not found");
        router.push("/admin/categories");
      }
    } catch (error) {
      console.error("Failed to fetch category", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Category deleted successfully!");
          router.push("/admin/categories");
          router.refresh();
        } else {
          toast.error("Failed to delete category");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFileError("The selected image exceeds the 2MB size limit. Please choose a smaller image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
      }
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, coverImage }),
      });

      if (res.ok) {
        toast.success("Category updated successfully!");
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading category...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <Link href="/admin/categories" className="w-10 h-10 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Category</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Update category details and cover image.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] min-h-[120px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Cover Image</label>
            <div 
              className="w-full h-64 border-2 border-dashed border-gray-200 rounded-xl bg-[#F8F9FD] flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors relative overflow-hidden"
              onClick={() => !coverImage && fileInputRef.current?.click()}
            >
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverImage(""); }}
                    className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-red-500 shadow-md transition-colors"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-gray-400 mb-3" />
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{uploading ? "Uploading..." : "Upload Cover Image"}</span>
                  <span className="text-[10px] text-gray-400 mt-2">Recommended size: 1920x1080px</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
            <button 
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white rounded-xl font-semibold text-sm px-8 py-3 hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-blue-200 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <FileErrorModal error={fileError} onClose={() => setFileError(null)} />
    </div>
  );
}
