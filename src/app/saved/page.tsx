"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { X, ArrowRight } from "lucide-react";
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
    <main className="flex min-h-screen flex-col bg-[#FBF9F6]">
      <Navbar variant="dark" />
      
      {/* Hero Header */}
      <div className="pt-32 pb-12 px-6 border-b border-gray-100 bg-white">
        <div className="container mx-auto w-full max-w-[1200px] text-center">
          <h1 className="font-serif text-3xl md:text-4xl tracking-wider text-gray-900 uppercase mb-3">
            YOUR SAVED EDIT
          </h1>
          <p className="text-gray-500 text-base">
            {saved.length} {saved.length === 1 ? 'piece carefully selected' : 'pieces carefully selected'}.
          </p>
        </div>
      </div>
      
      <div className="py-16 px-6 md:px-12 container mx-auto w-full max-w-[1000px] flex-1">
        
        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 shadow-sm p-10">
            <h2 className="font-serif text-3xl md:text-4xl tracking-widest text-gray-800 mb-6 uppercase text-center">Your edit is currently empty</h2>
            <p className="text-gray-500 mb-10 text-center max-w-md">
              Discover our latest collections and save your favorite pieces to curate your own personalized edit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/shop/new-in"
                className="border border-[#3A3831] bg-[#3A3831] text-white font-serif tracking-widest text-sm py-4 px-10 hover:bg-[#2A2821] transition-colors flex items-center justify-center gap-2"
              >
                DISCOVER NEW IN <ArrowRight size={14} />
              </Link>
              <Link 
                href="/collections"
                className="border border-[#3A3831] text-[#3A3831] font-serif tracking-widest text-sm py-4 px-10 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                VIEW COLLECTIONS
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {saved.map((item) => (
              <div key={item.productId} className="flex flex-col group relative bg-white border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                
                {/* Remove Button */}
                <button 
                  onClick={() => toggleSaved(item)}
                  className="absolute top-6 right-6 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Remove from wishlist"
                >
                  <X size={14} />
                </button>
                
                {/* Image */}
                <Link href={`/product/${item.productId}`} className="w-full aspect-[3/4] bg-gray-100 overflow-hidden relative block mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </Link>
                
                {/* Details */}
                <div className="flex flex-col flex-1 mt-2">
                  <Link href={`/product/${item.productId}`}>
                    <h3 className="font-sans text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors leading-tight mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="font-sans text-base text-gray-700 mb-2">₹ {item.price.toLocaleString()}</p>
                  
                  <p className="text-xs text-gray-400 italic mb-4">
                    Signature fit
                  </p>
                  
                  {/* Action */}
                  <div className="mt-auto pt-2">
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className={`w-full border font-serif tracking-widest text-xs py-3 transition-colors ${
                        addingId === item.productId 
                          ? 'border-green-600 bg-green-50 text-green-700' 
                          : 'border-[#3A3831] hover:bg-[#3A3831] text-[#3A3831] hover:text-white'
                      }`}
                    >
                      {addingId === item.productId ? 'ADDED TO CART' : 'ADD TO CART'}
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
