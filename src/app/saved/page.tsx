"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { X, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SavedPage() {
  const { saved, toggleSaved, addToCart } = useShop();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAddToCart = (item: any) => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      size: "S", // Defaulting to S since wishlist doesn't save size currently
      silhouette: "original"
    });

    setAddingId(item.productId);
    setTimeout(() => setAddingId(null), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      {/* Hero Header */}
      <div className="pt-28 md:pt-36 pb-8 md:pb-12 px-6 bg-white border-b border-gray-100">
        <div className="container mx-auto w-full max-w-[1200px] text-center">
          <h1 className="font-garamond text-[16px] md:text-[18px] text-gray-500 font-semibold tracking-[0.2em] uppercase mb-2">
            Your Saved Pieces
          </h1>
          <p className="font-garamond text-[14px] md:text-[15px] italic text-gray-400">
            {saved.length} {saved.length === 1 ? 'piece saved for later' : 'pieces saved for later'}.
          </p>
        </div>
      </div>
      
      <div className="py-12 md:py-16 px-4 md:px-8 lg:px-16 container mx-auto w-full max-w-[1200px] flex-1">
        
        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#F4F8FB] border border-[#79A7D3]/20 flex items-center justify-center text-[#79A7D3] mb-5 shadow-2xs">
              <Heart size={22} strokeWidth={1.5} className="fill-[#79A7D3]/15 text-[#79A7D3]" />
            </div>
            <h2 className="font-garamond text-2xl md:text-3xl text-gray-800 font-normal mb-3">
              Your saved list is empty
            </h2>
            <p className="font-garamond text-[14.5px] md:text-[15.5px] italic text-gray-500 leading-relaxed max-w-md mb-8">
              Explore our latest collections and save pieces you love to revisit or purchase anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link 
                href="/shop/new-in"
                className="w-full sm:w-auto bg-[#79A7D3] hover:bg-[#6895C2] text-white font-garamond uppercase tracking-widest text-[13px] md:text-[13.5px] py-3.5 px-8 rounded-sm shadow-xs transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <span>Discover New In</span>
                <ArrowRight size={14} />
              </Link>
              <Link 
                href="/collections"
                className="w-full sm:w-auto border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 bg-white font-garamond uppercase tracking-widest text-[13px] md:text-[13.5px] py-3.5 px-8 rounded-sm transition-colors flex items-center justify-center font-medium cursor-pointer"
              >
                View Collections
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12">
            {saved.map((item) => (
              <div key={item.productId} className="flex flex-col group relative bg-white border border-gray-100/90 rounded-xs p-3 hover:shadow-sm transition-all duration-300">
                
                {/* Remove Button */}
                <button 
                  onClick={() => toggleSaved(item)}
                  className="absolute top-5 right-5 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors opacity-80 md:opacity-0 md:group-hover:opacity-100 shadow-2xs cursor-pointer"
                  title="Remove from saved"
                >
                  <X size={13} />
                </button>
                
                {/* Image */}
                <Link href={`/product/${item.productId}`} className="w-full aspect-[3/4] bg-[#F7F6F4] overflow-hidden relative block mb-3 rounded-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                </Link>
                
                {/* Details */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <Link href={`/product/${item.productId}`} className="min-w-0 flex-1">
                      <h3 className="font-garamond text-[15px] md:text-[17px] text-gray-900 hover:text-gray-600 transition-colors truncate font-normal leading-tight">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="font-sans font-medium text-[13px] md:text-[15px] text-gray-900 tracking-tight tabular-nums whitespace-nowrap shrink-0">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  
                  <p className="text-[12px] md:text-[13px] text-gray-400 font-garamond italic mb-3.5">
                    Signature fit
                  </p>
                  
                  {/* Action */}
                  <div className="mt-auto pt-1">
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className={`w-full border font-garamond tracking-widest text-[12px] md:text-[12.5px] uppercase py-2.5 transition-all duration-200 cursor-pointer rounded-xs shadow-2xs font-medium ${
                        addingId === item.productId 
                          ? 'border-green-600 bg-green-50 text-green-700' 
                          : 'border-[#79A7D3] bg-[#79A7D3] hover:bg-[#6895C2] text-white'
                      }`}
                    >
                      {addingId === item.productId ? 'Added to Cart ✓' : 'Add to Cart'}
                    </button>
                  </div>
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
