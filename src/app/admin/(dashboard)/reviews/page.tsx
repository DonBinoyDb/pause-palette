"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ReviewsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Worn Stories (Reviews)</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Manage customer reviews and worn stories.</p>
        </div>
        <Link 
          href="/admin/reviews/new"
          className="flex items-center gap-2 bg-red-400 text-white px-5 py-2.5 rounded-full hover:bg-red-500 transition-colors font-medium text-sm shadow-md shadow-red-200"
        >
          <Plus size={16} />
          Add Review
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium">Loading reviews...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">No reviews found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-2xl p-6 relative group bg-[#F8F9FD]">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                
                {item.imageUrl && (
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border border-gray-200">
                    <Image src={item.imageUrl} alt={item.customerName} width={64} height={64} className="object-cover w-full h-full mix-blend-multiply" />
                  </div>
                )}
                
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-4 mb-4">"{item.reviewText}"</p>
                <p className="font-bold text-sm text-gray-900">- {item.customerName}</p>
                
                {item.sourceLink && (
                  <a href={item.sourceLink} target="_blank" rel="noreferrer" className="text-xs text-blue-500 mt-2 inline-block hover:underline">
                    View Source Link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
