"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { Minus, Plus, X, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useShop();

  return (
    <main className="flex min-h-screen flex-col bg-[#F9F8F6]">
      <Navbar variant="dark" />
      
      <div className="pt-40 pb-32 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px] flex-1">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-[#E8E6E1] pb-10">
          <div>
            <h1 className="font-serif text-5xl md:text-7xl text-[#2C2B29] tracking-tight mb-4">
              Your Bag
            </h1>
            <p className="text-[#8B8985] text-sm tracking-[0.2em] uppercase">
              {cart.length} {cart.length === 1 ? 'Piece' : 'Pieces'} carefully selected
            </p>
          </div>
          <Link href="/collections" className="group hidden md:flex items-center gap-3 text-xs tracking-widest uppercase text-[#8B8985] hover:text-[#2C2B29] transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="font-serif text-3xl text-[#5C5A58] mb-8">Your bag is currently empty.</p>
            <p className="text-[#8B8985] text-sm max-w-md mb-12">Discover our latest pieces and timeless essentials to begin curating your wardrobe.</p>
            <Link 
              href="/collections"
              className="bg-[#2C2B29] hover:bg-[#1A1918] text-white px-10 py-5 text-xs tracking-[0.2em] uppercase transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16 xl:gap-32">
            
            {/* Minimalist Cart Items */}
            <div className="flex-1 flex flex-col gap-12">
              {cart.map((item) => (
                <div key={item.id} className="group flex flex-col sm:flex-row gap-8 items-start sm:items-center pb-12 border-b border-[#E8E6E1]/60 relative">
                  
                  {/* Remove Button - Top Right on Mobile, Right side on Desktop */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-0 right-0 sm:top-1/2 sm:-translate-y-1/2 p-2 text-[#C4C2BE] hover:text-[#D14F4F] transition-colors"
                    aria-label="Remove item"
                  >
                    <X size={20} strokeWidth={1} />
                  </button>

                  <div className="w-32 sm:w-40 aspect-[3/4] bg-[#F2F0ED] shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <Link href={`/product/${item.productId}`} className="font-serif text-2xl md:text-3xl text-[#2C2B29] mb-4 hover:opacity-70 transition-opacity">
                      {item.name}
                    </Link>
                    
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] tracking-[0.15em] uppercase text-[#8B8985] mb-8">
                      <p>Size: <span className="text-[#2C2B29]">{item.size}</span></p>
                      <p>Fit: <span className="text-[#2C2B29]">{item.silhouette.replace('-', ' ')}</span></p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pr-8 sm:pr-16">
                      {/* Refined Quantity Selector */}
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-[#8B8985]">Qty</span>
                        <div className="flex items-center border border-[#E8E6E1] rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-[#8B8985] hover:text-[#2C2B29]"><Minus size={12} /></button>
                          <span className="w-8 text-center text-xs text-[#2C2B29]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-[#8B8985] hover:text-[#2C2B29]"><Plus size={12} /></button>
                        </div>
                      </div>
                      
                      <div className="font-serif text-xl md:text-2xl text-[#2C2B29]">
                        ₹ {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* High-End Order Summary */}
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="sticky top-40 bg-[#F2F0ED] p-10 md:p-14">
                <h2 className="text-[11px] tracking-[0.2em] uppercase text-[#8B8985] mb-10">Summary</h2>
                
                <div className="flex flex-col gap-6 text-[#5C5A58] text-sm mb-10 border-b border-[#E8E6E1] pb-10">
                  <div className="flex justify-between items-end">
                    <span>Subtotal</span>
                    <span className="font-serif text-xl text-[#2C2B29]">₹ {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span>Shipping</span>
                    <span className="text-xs italic text-[#8B8985]">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-12">
                  <span className="text-xs tracking-widest uppercase text-[#2C2B29]">Estimated Total</span>
                  <span className="font-serif text-3xl md:text-4xl text-[#2C2B29]">₹ {cartTotal.toLocaleString()}</span>
                </div>
                
                <button className="w-full group relative overflow-hidden bg-[#2C2B29] text-white py-5 px-8 flex items-center justify-between hover:bg-black transition-colors">
                  <span className="text-xs tracking-[0.2em] uppercase">Secure Checkout</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
                
                <p className="mt-8 text-center text-[11px] text-[#8B8985] italic">
                  Taxes and shipping are calculated at checkout.
                </p>
              </div>
            </div>
            
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
