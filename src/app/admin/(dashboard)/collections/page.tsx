"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2 } from "lucide-react";

export default function CollectionsManager() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    // Auto-generate slug
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      if (res.ok) {
        setName("");
        setSlug("");
        setDescription("");
        fetchCollections(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to create collection", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8">
      
      {/* Left Column: Create Form */}
      <div className="w-full md:w-1/3">
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] sticky top-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Collection</h2>
              <p className="text-xs text-gray-500 font-medium">Create a new category</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={handleNameChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Slug URL</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-gray-500 font-semibold tracking-wide">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-[#F8F9FD] min-h-[80px]"
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white rounded-full font-semibold text-sm py-3 mt-4 hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
            >
              {submitting ? "Creating..." : "Create Collection"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: List */}
      <div className="w-full md:w-2/3">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Collections</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Organize your products.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">No collections found.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {collections.map((col) => (
                <div key={col.id} className="p-6 flex items-center justify-between hover:bg-[#F8F9FD]/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{col.name}</h3>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">/collections/{col.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
