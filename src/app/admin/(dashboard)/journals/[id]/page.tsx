"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Trash2, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function EditJournalItem() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJournal();
    }
  }, [id]);

  const fetchJournal = async () => {
    try {
      const res = await fetch(`/api/journals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || "");
        setContent(data.content || "");
        setImageUrl(data.imageUrl || "");
        setIsPublished(data.isPublished ?? true);
      } else {
        toast.error("Failed to fetch journal entry");
        router.push("/admin/journals");
      }
    } catch (error) {
      console.error("Failed to fetch journal entry", error);
      toast.error("Failed to fetch journal entry");
      router.push("/admin/journals");
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      } else {
        console.error("Upload error:", data);
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/journals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
          isPublished,
        }),
      });

      if (res.ok) {
        toast.success("Journal entry updated successfully!");
        router.push("/admin/journals");
        router.refresh();
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full text-center text-gray-500 py-12">
        Loading journal entry...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/journals" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors border border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Journal Entry</h1>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 mr-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select 
              value={isPublished ? "true" : "false"} 
              suppressHydrationWarning
              onChange={(e) => setIsPublished(e.target.value === "true")}
              className="bg-transparent text-sm font-bold focus:outline-none"
            >
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <button 
            type="submit"
            suppressHydrationWarning
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
          >
            {loading ? "Updating..." : "Update Entry"}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col md:flex-row gap-8">
        {/* Left: Details */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Title</label>
            <input 
              type="text" 
              value={title}
              suppressHydrationWarning
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. The story of our new collection"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Content</label>
            <textarea 
              value={content}
              suppressHydrationWarning
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the journal entry here..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD] min-h-[300px]"
              required
            />
          </div>
        </div>

        {/* Right: Photo */}
        <div className="w-full md:w-1/3">
          <h2 className="text-[12px] text-gray-500 font-semibold tracking-wide mb-1.5">Cover Image (Optional)</h2>
          {imageUrl ? (
            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-gray-200 bg-[#F8F9FD]">
              <Image src={imageUrl} alt="Uploaded" fill className="object-cover" />
              <button 
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-4 right-4 bg-white/90 text-red-500 text-xs px-3 py-1.5 rounded-full shadow-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <button 
              type="button"
              suppressHydrationWarning
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/4] border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors bg-[#F8F9FD]"
            >
              {uploading ? (
                <span className="text-sm font-semibold">Uploading...</span>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-blue-500">
                    <Upload size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-semibold text-center px-4">Upload cover photo</span>
                </>
              )}
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen size={14} />
              About Making Journal
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Making Journals let you share the stories behind your creations. These will be visible on the public journal page.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
