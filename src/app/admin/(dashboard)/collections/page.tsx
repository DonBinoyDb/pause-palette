"use client";

import { useState, useEffect, useRef } from "react";
import { Tag, Trash2, Edit, Upload, X, Search, Plus, Images } from "lucide-react";
import Link from "next/link";
import FileErrorModal from "@/components/admin/FileErrorModal";

export default function CollectionsManager() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch collections", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalCover = coverImage || (images.length > 0 ? images[0] : "");

      const res = await fetch("/api/collections", {
        method: "POST",
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
        resetForm();
        setIsModalOpen(false);
        fetchCollections();
      }
    } catch (error) {
      console.error("Failed to create collection", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files: File[] = Array.from(fileList);
    const oversizedFiles = files.filter(f => f.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setFileError(`Some files exceed the 2MB size limit: ${oversizedFiles.map(f => f.name).join(", ")}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      }
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idxToRemove: number) => {
    const removedUrl = images[idxToRemove];
    const newImages = images.filter((_, idx) => idx !== idxToRemove);
    setImages(newImages);
    if (coverImage === removedUrl) {
      setCoverImage(newImages.length > 0 ? newImages[0] : "");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;
    try {
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
      fetchCollections();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    col.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full font-sans">
      
      {/* Dashboard Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Collections</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage and organize your product collections and carousel images.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95"
        >
          <Plus size={18} />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collection List (Full Width) */}
      <div className="w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/30">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search collections by name or slug..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium hidden sm:block">
              {filteredCollections.length} Collection{filteredCollections.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm text-gray-500">Loading collections...</div>
            ) : filteredCollections.length === 0 ? (
              <div className="p-16 text-center text-sm text-gray-500 flex flex-col items-center">
                <Tag className="text-gray-300 mb-3" size={40} />
                <p className="text-base font-medium text-gray-900 mb-1">No collections found</p>
                <p>Try adjusting your search or create a new collection.</p>
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  className="mt-4 text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Create one now
                </button>
              </div>
            ) : (
            <>
              {/* Mobile Card View (Screens < md) */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredCollections.map((col) => {
                  const totalImages = col.images?.length || (col.coverImage ? 1 : 0);
                  return (
                    <div key={col.id} className="p-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="w-14 h-12 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {col.coverImage ? (
                          <img src={col.coverImage} alt={col.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {col.name}
                          </h3>
                          {totalImages > 0 && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium shrink-0">
                              {totalImages} {totalImages === 1 ? "img" : "imgs"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-gray-500 truncate">
                          /{col.slug}
                        </p>
                        {col.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {col.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link 
                          href={`/admin/collections/${col.id}`} 
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(col.id)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (Screens >= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">Cover</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Collection Info</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCollections.map((col) => {
                      const totalImages = col.images?.length || (col.coverImage ? 1 : 0);
                      return (
                        <tr key={col.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-16 h-12 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {col.coverImage ? (
                                <img src={col.coverImage} alt={col.name} className="w-full h-full object-cover" />
                              ) : (
                                <Tag size={18} className="text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{col.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">/{col.slug}</span>
                                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                                  <Images size={11} />
                                  {totalImages} {totalImages === 1 ? "image" : "images"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500 line-clamp-2 max-w-sm">
                              {col.description || <span className="italic text-gray-400">No description provided</span>}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/admin/collections/${col.id}`} 
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(col.id)} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
            )}
          </div>
          
        </div>
      </div>

      {/* New Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Create New Collection</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form id="new-collection-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Collection Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g., Summer Essentials"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">URL Slug</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g., summer-essentials"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the collection..."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[80px] resize-y"
                  />
                </div>

                {/* Multiple Images Upload */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Carousel Images {images.length > 0 && `(${images.length})`}
                    </label>
                    <span className="text-[11px] text-gray-500">Auto-rotates every 7s</span>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5 mb-2">
                      {images.map((src, idx) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white/90 text-gray-700 hover:text-red-600 hover:bg-white p-1 rounded-full shadow transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div 
                    className="w-full h-[100px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors relative overflow-hidden group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600 font-medium">
                      {uploading ? "Uploading images..." : "+ Select Images (Multiple allowed)"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 2MB each</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleMultipleImageUpload} 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="new-collection-form"
                disabled={submitting || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? "Creating..." : "Save Collection"}
              </button>
            </div>
            
          </div>
        </div>
      )}

      <FileErrorModal error={fileError} onClose={() => setFileError(null)} />
    </div>
  );
}
