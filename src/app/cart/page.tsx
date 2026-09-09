"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useShop();

  return (
    <main className="flex min-h-screen flex-col bg-[#FBF9F6]">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1200px] flex-1">
        <h1 className="font-serif text-[28px] tracking-[0.1em] text-gray-800 uppercase mb-12 text-center">
          YOUR CART
        </h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="font-serif italic text-gray-500 text-lg mb-8">Your cart is currently empty.</p>
            <Link 
              href="/"
              className="border border-[#8FB1D0] text-[#7A9BB9] font-serif italic py-3 px-8 rounded-sm hover:bg-[#F4F8FB] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Cart Items */}
            <div className="flex-1">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-[11px] font-medium tracking-widest text-gray-500 uppercase">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              
              <div className="flex flex-col gap-8 py-8">
                {cart.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-6 items-center">
                      <div className="w-24 h-32 bg-gray-100 shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/product/${item.productId}`} className="font-serif text-lg text-gray-800 hover:text-gray-500 mb-1">
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 mb-1">Size: {item.size}</p>
                        <p className="text-[11px] text-gray-400 capitalize mb-3">{item.silhouette.replace('-', ' ')} Silhouette</p>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-red-500 w-fit flex items-center gap-1 transition-colors"
                        >
                          <X size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-1 md:col-span-3 flex md:justify-center mt-4 md:mt-0">
                      <div className="flex items-center border border-gray-200 w-fit">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-gray-500 hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-1 md:col-span-3 text-left md:text-right font-serif text-lg text-gray-800">
                      ₹ {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="bg-white p-8 border border-gray-100 shadow-sm">
                <h2 className="font-serif text-lg text-gray-800 mb-6 border-b border-gray-100 pb-4">ORDER SUMMARY</h2>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Subtotal</span>
                  <span>₹ {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-6">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between text-lg font-serif text-gray-800 border-t border-gray-100 pt-6 mb-8">
                  <span>Total</span>
                  <span>₹ {cartTotal.toLocaleString()}</span>
                </div>
                
                <button className="w-full bg-[#3A3831] hover:bg-[#2A2821] text-white py-4 font-serif tracking-widest text-sm transition-colors mb-4">
                  CHECKOUT
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  Shipping & taxes calculated at checkout.
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
