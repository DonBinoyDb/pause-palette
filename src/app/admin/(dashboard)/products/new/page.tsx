"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form Data
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [silhouetteOption, setSilhouetteOption] = useState("Regular");
  const [isPublished, setIsPublished] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/collections")
      .then(res => res.json())
      .then(data => setCollections(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Upload sequentially for simplicity, could use Promise.all
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        if (data.success) {
          setImages(prev => [...prev, data.url]);
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price,
          collectionId: collectionId || null,
          silhouetteOption,
          isPublished,
          images
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        alert("Failed to create product");
      }
    } catch (error) {
      console.error("Failed to submit", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-colors border border-gray-100">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Product</h1>
        </div>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm border border-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-red-400 text-white rounded-full text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 shadow-md shadow-red-200"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* General Details */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <h2 className="text-lg font-bold mb-6 text-gray-900">General Information</h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Product Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. The Oversized Linen Shirt"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the piece, the fabric, the feel..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] min-h-[120px] placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <h2 className="text-lg font-bold mb-6 text-gray-900">Media</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((url, i) => (
                <div key={i} className="aspect-[3/4] relative overflow-hidden rounded-2xl border border-gray-200 group bg-[#F8F9FD]">
                  <img src={url} alt="Product" className="w-full h-full object-cover mix-blend-multiply" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors bg-[#F8F9FD]"
              >
                {uploading ? (
                  <span className="text-xs font-semibold">Uploading...</span>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 text-blue-500">
                      <Upload size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-semibold">Add Image</span>
                  </>
                )}
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              multiple 
              className="hidden" 
            />
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="flex flex-col gap-8">
          
          {/* Status */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <h2 className="text-lg font-bold mb-6 text-gray-900">Status</h2>
            
            <div className="flex items-start gap-4">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="published"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="published" className="font-semibold text-gray-900">
                    Active (Published)
                  </label>
                  <p className="text-gray-500 font-medium">Makes the piece visible on the storefront.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
            <h2 className="text-lg font-bold mb-6 text-gray-900">Details</h2>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Collection</label>
                <select 
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] appearance-none"
                >
                  <option value="">Select a collection</option>
                  {collections.map(col => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Silhouette / Fit</label>
                <select 
                  value={silhouetteOption}
                  onChange={(e) => setSilhouetteOption(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] appearance-none"
                >
                  <option value="Regular">Regular</option>
                  <option value="Oversized">Oversized</option>
                  <option value="Slim">Slim</option>
                  <option value="Relaxed">Relaxed</option>
                  <option value="Boxy">Boxy</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-gray-500 font-semibold tracking-wide">URL Slug</label>
                <input 
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-gray-50"
                  required
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </form>
  );
}
