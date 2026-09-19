"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LookbookManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/lookbook");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch lookbook items", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lookbook image?")) return;
    try {
      await fetch(`/api/lookbook/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lookbook</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage images displayed in the Discover / Lookbook page.</p>
        </div>
        <Link 
          href="/admin/lookbook/new"
          className="flex items-center gap-2 bg-red-400 text-white px-5 py-2.5 rounded-full hover:bg-red-500 transition-colors font-medium text-sm shadow-md shadow-red-200"
        >
          <Plus size={16} />
          Add Image
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">No lookbook items found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="relative group border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[3/4] relative bg-gray-50">
                  <Image src={item.imageUrl} alt={item.title || "Lookbook Image"} fill className="object-cover mix-blend-multiply" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/admin/lookbook/${item.id}`}
                      className="p-2 bg-white text-blue-500 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="font-semibold text-sm text-gray-900 truncate">{item.title || "Untitled"}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{item.linkUrl || "No Link"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
