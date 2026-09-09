"use client";

import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { useState } from "react";

// Matches Prisma Product model roughly, specifically what we need for the grid
type Product = {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  collection?: { name: string } | null;
};

export default function ProductGrid({ products }: { products: Product[] }) {
  const { toggleSaved, isSaved } = useShop();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {products.map((product) => {
        // Map Prisma product format to the format expected by useShop if needed
        const shopProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : "",
          category: product.collection?.name || "Uncategorized"
        };

        return (
          <div 
            key={product.id}
            className="group flex flex-col"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
              <Link href={`/product/${product.slug}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={shopProduct.image || "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop"} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              
              {/* Wishlist Button */}
              <button 
                onClick={() => toggleSaved(shopProduct)}
                className={`absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 ${isSaved(product.id) ? 'text-red-500 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-900 hover:scale-110'}`}
              >
                {isSaved(product.id) ? '♥' : '♡'}
              </button>
              
              {/* Quick Add (Visible on Hover) */}
              <div className={`absolute bottom-0 left-0 w-full p-4 transform transition-transform duration-300 ${hoveredProduct === product.id ? 'translate-y-0' : 'translate-y-full'}`}>
                <Link href={`/product/${product.slug}`} className="w-full bg-white/90 backdrop-blur-md text-gray-900 text-[10px] tracking-widest uppercase py-3 flex justify-center hover:bg-black hover:text-white transition-colors">
                  View Details
                </Link>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex justify-between items-start px-1">
              <div>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-title text-lg text-gray-900 hover:text-gray-600 transition-colors mb-1">{product.name}</h3>
                </Link>
                <p className="text-[11px] text-gray-500 italic">{shopProduct.category}</p>
              </div>
              <p className="font-title text-sm text-gray-900">₹ {product.price}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
