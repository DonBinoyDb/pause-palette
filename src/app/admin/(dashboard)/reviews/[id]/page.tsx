"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Trash2, Save, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function EditReviewItem() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (id) {
      fetchReview();
    }
  }, [id]);

  const fetchReview = async () => {
    try {
      const res = await fetch(`/api/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerName(data.customerName || "");
        setReviewText(data.reviewText || "");
        setSourceLink(data.sourceLink || "");
        setImageUrl(data.imageUrl || "");
        setRating(data.rating || 5);
      } else {
        toast.error("Failed to fetch review");
        router.push("/admin/reviews");
      }
    } catch (error) {
      console.error("Failed to fetch review", error);
      toast.error("Failed to fetch review");
      router.push("/admin/reviews");
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
    if (!customerName || !reviewText) {
      toast.error("Name and review text are required.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
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
        toast.success("Review updated successfully!");
        router.push("/admin/reviews");
        router.refresh();
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

  if (fetching) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full text-center text-gray-500 py-12">
        Loading review...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/reviews" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors border border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Worn Story (Review)</h1>
        </div>
        <div className="flex gap-4">
          <button 
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
          >
            {loading ? "Saving..." : "Update Review"}
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
