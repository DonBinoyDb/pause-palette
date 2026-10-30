"use client";

import Link from "next/link";
import { useShop } from "@/context/ShopContext";

// Matches Prisma Product model roughly, specifically what we need for the grid
type Product = {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  description?: string | null;
  sizes?: string[];
  collection?: { name: string } | null;
};

export default function ProductGrid({ 
  products, 
  showWishlist = false 
}: { 
  products: Product[]; 
  showWishlist?: boolean;
}) {
  const { toggleSaved, isSaved } = useShop();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-8 gap-y-8 md:gap-y-16">
      {products.map((product) => {
        const shopProduct = {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : "",
          category: product.collection?.name || "Uncategorized"
        };

        return (
          <Link 
            key={product.id}
            href={`/product/${product.slug}`}
            className="group flex flex-col cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={shopProduct.image || "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop"} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Wishlist Button (if enabled) */}
              {showWishlist && (
                <button 
                  type="button"
                  suppressHydrationWarning
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSaved(shopProduct);
                  }}
                  className={`absolute top-2 md:top-4 right-2 md:right-4 z-10 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 ${isSaved(product.id) ? 'text-red-500 opacity-100' : 'text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-gray-900 hover:scale-110'}`}
                >
                  {isSaved(product.id) ? '♥' : '♡'}
                </button>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col md:flex-row justify-between items-start px-1 mt-1 md:mt-2">
              <div className="w-full pr-2">
                <h3 className="font-garamond text-[14px] md:text-lg text-gray-900 group-hover:text-gray-600 transition-colors mb-0.5 md:mb-1 truncate font-normal">
                  {product.name}
                </h3>
                <p className="text-[12px] md:text-[14px] text-gray-500 truncate font-garamond italic">
                  {shopProduct.category}
                </p>
              </div>
              <p className="font-sans font-medium text-[13px] md:text-sm text-gray-900 tracking-tight tabular-nums mt-1 md:mt-0 whitespace-nowrap">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
