"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function JournalsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/journals");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch journals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      await fetch(`/api/journals/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Making Journal</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage journal entries and stories.</p>
        </div>
        <Link 
          href="/admin/journals/new"
          className="flex items-center gap-2 bg-red-400 text-white px-5 py-2.5 rounded-full hover:bg-red-500 transition-colors font-medium text-sm shadow-md shadow-red-200"
        >
          <Plus size={16} />
          Add Entry
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Loading journals...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">No journal entries found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-2xl p-6 relative group bg-[#F8F9FD] flex flex-col h-full">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                  <Link
                    href={`/admin/journals/${item.id}`}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <Edit size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {item.imageUrl ? (
                  <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-gray-200 relative shrink-0">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                    <BookOpen size={48} strokeWidth={1} />
                  </div>
                )}
                
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">{item.content}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium pt-4 border-t border-gray-100 shrink-0">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full ${item.isPublished ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
