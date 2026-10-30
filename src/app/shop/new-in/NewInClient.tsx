"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  gender?: string[];
  collection?: { name: string } | null;
}

export default function NewInClient({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | "men" | "women">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [sortOpen, setSortOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    const genders = (p.gender || []).map((g) => g.toLowerCase());
    return genders.includes(filter);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <>
      {/* Filter / Sort Bar */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-12">
        <div className="flex gap-8 text-sm tracking-widest uppercase">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setFilter("all")}
            className={`transition-colors relative pb-1 ${
              filter === "all"
                ? "text-[#79A7D3] font-medium border-b-2 border-[#79A7D3] -mb-[5px]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setFilter("men")}
            className={`transition-colors relative pb-1 ${
              filter === "men"
                ? "text-[#79A7D3] font-medium border-b-2 border-[#79A7D3] -mb-[5px]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Men
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setFilter("women")}
            className={`transition-colors relative pb-1 ${
              filter === "women"
                ? "text-[#79A7D3] font-medium border-b-2 border-[#79A7D3] -mb-[5px]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Women
          </button>
        </div>

        {/* Sort Menu */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSortOpen(!sortOpen)}
            className="text-sm tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            Sort By {sortOpen ? "−" : "+"}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[160px] z-30 text-xs tracking-wider uppercase">
              <button
                type="button"
                onClick={() => { setSortBy("featured"); setSortOpen(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${sortBy === "featured" ? "text-[#79A7D3] font-semibold" : "text-gray-600"}`}
              >
                Featured
              </button>
              <button
                type="button"
                onClick={() => { setSortBy("price-asc"); setSortOpen(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${sortBy === "price-asc" ? "text-[#79A7D3] font-semibold" : "text-gray-600"}`}
              >
                Price: Low to High
              </button>
              <button
                type="button"
                onClick={() => { setSortBy("price-desc"); setSortOpen(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${sortBy === "price-desc" ? "text-[#79A7D3] font-semibold" : "text-gray-600"}`}
              >
                Price: High to Low
              </button>
            </div>
          )}
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500 italic font-garamond">No pieces found in this category.</p>
        </div>
      ) : (
        <ProductGrid products={sortedProducts} />
      )}
    </>
  );
}
