"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { X } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  const { saved, toggleSaved } = useShop();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px] flex-1">
        
        <div className="text-center mb-16 mt-4">
          <h1 className="font-serif text-[28px] tracking-[0.1em] text-gray-800 uppercase mb-4">
            SAVED ITEMS
          </h1>
          <p className="font-serif italic text-gray-500 text-sm">
            {saved.length} {saved.length === 1 ? 'piece' : 'pieces'} waiting for you.
          </p>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Link 
              href="/shop/all"
              className="border border-[#8FB1D0] text-[#7A9BB9] font-serif italic py-3 px-8 rounded-sm hover:bg-[#F4F8FB] transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {saved.map((item) => (
              <div key={item.productId} className="flex flex-col group relative">
                <button 
                  onClick={() => toggleSaved(item)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
                
                <Link href={`/product/${item.productId}`} className="aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </Link>
                
                <div className="flex flex-col">
                  <Link href={`/product/${item.productId}`} className="font-serif text-sm text-gray-800 hover:text-gray-500 mb-1">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500">₹ {item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
