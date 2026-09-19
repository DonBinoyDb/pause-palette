"use client";

import { useState, useEffect, useRef } from "react";
import { Tag, Trash2, Edit, Upload, X, Search, Plus } from "lucide-react";
import Link from "next/link";
import FileErrorModal from "@/components/admin/FileErrorModal";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, coverImage }),
      });

      if (res.ok) {
        resetForm();
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (error) {
      console.error("Failed to create category", error);
    } finally {
      setSubmitting(false);
    }
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full font-sans">
      
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and organize your products into categories like Men and Women.</p>
        </div>
        <button 
          suppressHydrationWarning
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Category List (Full Width) */}
      <div className="w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/30">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                suppressHydrationWarning
                type="text" 
                placeholder="Search categories by name or slug..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium hidden sm:block">
              {filteredCategories.length} Categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </div>
          </div>

          {/* List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm text-gray-500">Loading categories...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-16 text-center text-sm text-gray-500 flex flex-col items-center">
                <Tag className="text-gray-300 mb-3" size={40} />
                <p className="text-base font-medium text-gray-900 mb-1">No categories found</p>
                <p>Try adjusting your search or create a new category.</p>
                <button 
                  suppressHydrationWarning
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Create one now
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">Cover</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category Info</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                      
                      {/* Cover Image Thumbnail */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-12 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {cat.coverImage ? (
                            <img src={cat.coverImage} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <Tag size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      
                      {/* Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                          <span className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded-full self-start font-mono">/{cat.slug}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 line-clamp-2 max-w-sm">
                          {cat.description || <span className="italic text-gray-400">No description provided</span>}
                        </p>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/categories/${cat.id}`} 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(cat.id)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* New Category Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add New Category</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form id="new-category-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Category Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g., Men"
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
                    placeholder="e.g., men"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the category..."
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Cover Image</label>
                  <div 
                    className="w-full h-[140px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors relative overflow-hidden group"
                    onClick={() => !coverImage && fileInputRef.current?.click()}
                  >
                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverImage(""); }}
                          className="absolute top-2 right-2 bg-white p-1.5 rounded-md text-gray-500 hover:text-red-600 shadow-sm transition-colors border border-gray-200"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 font-medium">{uploading ? "Uploading..." : "Click to upload"}</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 2MB</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
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
                form="new-category-form"
                disabled={submitting || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? "Creating..." : "Save Category"}
              </button>
            </div>
            
          </div>
        </div>
      )}

      <FileErrorModal error={fileError} onClose={() => setFileError(null)} />
    </div>
  );
}
