"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewReviewItem() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState(5);

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
        alert(data.message || "Upload failed");
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
    if (!customerName || !reviewText) {
      alert("Name and review text are required.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          reviewText,
          sourceLink,
          imageUrl,
          rating,
          isPublished: true
        }),
      });

      if (res.ok) {
        router.push("/admin/reviews");
      } else {
        alert("Failed to save");
      }
    } catch (error) {
      console.error("Failed to submit", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/reviews" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors border border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add Worn Story (Review)</h1>
        </div>
        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-red-400 text-white rounded-full text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 shadow-md shadow-red-200"
          >
            {loading ? "Saving..." : "Save Review"}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col md:flex-row gap-8">
        {/* Left: Details */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Customer Name</label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Review Text</label>
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD] min-h-[120px]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Source Link (Optional Google/Product link)</label>
            <input 
              type="text" 
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              placeholder="https://g.page/..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all bg-[#F8F9FD]"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Rating (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className="p-1"
                >
                  <Star size={24} className={num <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Photo */}
        <div className="w-full md:w-1/3">
          <h2 className="text-[12px] text-gray-500 font-semibold tracking-wide mb-1.5">Customer Photo (Optional)</h2>
          {imageUrl ? (
            <div className="aspect-square relative rounded-2xl overflow-hidden border border-gray-200 bg-[#F8F9FD]">
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
              className="w-full aspect-square border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors bg-[#F8F9FD]"
            >
              {uploading ? (
                <span className="text-sm font-semibold">Uploading...</span>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 text-blue-500">
                    <Upload size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-semibold">Upload photo</span>
                </>
              )}
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>
      </div>
    </form>
  );
}
