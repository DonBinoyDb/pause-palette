"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, ExternalLink, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

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

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lookbook image?")) return;
    try {
      const res = await fetch(`/api/lookbook/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Image deleted");
        fetchItems();
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete");
    }
  };

  const handleDeleteSet = async (setIndex: number, setItemsList: any[]) => {
    const ids = setItemsList.map((item) => item.id).join(",");
    if (!window.confirm(`Are you sure you want to delete all 5 images in Set ${setIndex + 1}?`)) return;

    try {
      const res = await fetch(`/api/lookbook?ids=${ids}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Set ${setIndex + 1} deleted`);
        fetchItems();
      } else {
        toast.error("Failed to delete set");
      }
    } catch (error) {
      console.error("Failed to delete set", error);
      toast.error("Failed to delete set");
    }
  };

  // Group items into sets of 5
  const sets: any[][] = [];
  for (let i = 0; i < items.length; i += 5) {
    sets.push(items.slice(i, i + 5));
  }

  return (
    <div className="w-full pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lookbook Manager</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Manage lookbook sets. Each set consists of 5 images arranged in the signature editorial collage.
          </p>
        </div>
        <Link 
          href="/admin/lookbook/new"
          className="flex items-center gap-2 bg-red-400 text-white px-5 py-2.5 rounded-full hover:bg-red-500 transition-colors font-medium text-sm shadow-md shadow-red-200 cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          Add Lookbook Set (5 Images)
        </Link>
      </div>

      {/* Guidance Note */}
      <div className="mb-8 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p>
          💡 <strong>Pagination note:</strong> When you have 1 set (5 images), it displays cleanly without dots. When a 2nd set (or more) is added, the dot indicators automatically appear on the lookbook page.
        </p>
        <span className="font-semibold text-blue-700 whitespace-nowrap">
          {sets.length} {sets.length === 1 ? "Set" : "Sets"} ({items.length} Images)
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 font-medium shadow-sm">
          Loading lookbook sets...
        </div>
      ) : sets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 font-medium shadow-sm flex flex-col items-center gap-4">
          <ImageIcon size={40} className="text-gray-300" />
          <p>No lookbook sets added yet.</p>
          <Link
            href="/admin/lookbook/new"
            className="px-5 py-2 rounded-full bg-red-400 text-white text-xs font-semibold hover:bg-red-500 shadow-sm"
          >
            Create Your First Set (5 Images)
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {sets.map((setItemsList, setIdx) => (
            <div
              key={setIdx}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.08)] border border-gray-100"
            >
              {/* Set Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-bold">
                    Set {setIdx + 1}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {setItemsList.length} of 5 slots filled
                  </span>
                  {setItemsList.length === 5 ? (
                    <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                      Complete Set ✓
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Incomplete ({5 - setItemsList.length} missing)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteSet(setIdx, setItemsList)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete Set
                  </button>
                </div>
              </div>

              {/* Set Grid Preview matching frontend 3/2 collage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {setItemsList.map((item, itemIdx) => {
                  const isWide = itemIdx === 3;
                  return (
                    <div
                      key={item.id}
                      className={`relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs ${
                        isWide ? "md:col-span-2 aspect-[16/10] md:aspect-[16/9]" : "md:col-span-1 aspect-[3/4]"
                      }`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title || `Set ${setIdx + 1} Image ${itemIdx + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Badge indicating slot */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          Slot {itemIdx + 1} {isWide ? "(Wide)" : ""}
                        </span>
                      </div>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 z-20">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/admin/lookbook/${item.id}`}
                            className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                            title="Edit Image Details"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="text-white text-left">
                          <p className="font-semibold text-xs truncate">{item.title || "No Title"}</p>
                          {item.linkUrl && (
                            <p className="text-[11px] text-white/80 truncate flex items-center gap-1 mt-0.5">
                              <ExternalLink size={10} /> {item.linkUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
