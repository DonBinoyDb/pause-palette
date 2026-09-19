"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewLookbookItem() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

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
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload an image first");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/lookbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          linkUrl,
          imageUrl,
          isPublished: true
        }),
      });

      if (res.ok) {
        toast.success("Lookbook item created successfully!");
        router.push("/admin/lookbook");
      } else {
        toast.error("Failed to save");
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/lookbook" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors border border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add Lookbook Image</h1>
        </div>
        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={loading || uploading || !imageUrl}
            className="px-6 py-2.5 bg-red-400 text-white rounded-full text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 shadow-md shadow-red-200"
          >
            {loading ? "Saving..." : "Save Image"}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col md:flex-row gap-8">
        {/* Left: Image Upload */}
        <div className="w-full md:w-1/2">
          <h2 className="text-sm font-bold mb-4 text-gray-900">Photo</h2>
          {imageUrl ? (
            <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-gray-200 bg-[#F8F9FD]">
              <Image src={imageUrl} alt="Uploaded" fill className="object-cover mix-blend-multiply" />
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
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[3/4] border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors bg-[#F8F9FD]"
            >
              {uploading ? (
                <span className="text-sm font-semibold">Uploading & Optimizing...</span>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-blue-500">
                    <Upload size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-semibold">Click to upload photo</span>
                  <span className="text-xs text-gray-400 mt-2 font-medium">JPEG or PNG (Max 2MB)</span>
                </>
              )}
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <h2 className="text-sm font-bold text-gray-900">Details</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Caption / Title (Optional)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Collection Vibes"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Product Link (Optional)</label>
            <input 
              type="text" 
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="e.g. /product/linen-shirt"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD]"
            />
            <p className="text-[11px] text-gray-400 mt-1">If provided, users can click the image to view the product.</p>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Or Select a Product to Auto-fill</label>
            <select 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD]"
              onChange={(e) => {
                 if (e.target.value) {
                   setLinkUrl(e.target.value);
                 }
              }}
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={`/product/${p.slug}`}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
