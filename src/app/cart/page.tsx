"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, X, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useShop();
  const { status } = useSession();
  const router = useRouter();
  const [whatsappNumber, setWhatsappNumber] = useState("917907629021");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/settings/contact")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.whatsappNumber) {
          const digits = data.whatsappNumber.replace(/\D/g, "");
          if (digits) setWhatsappNumber(digits);
        }
      })
      .catch(() => {});
  }, []);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = whatsappNumber || "917907629021"; 
    let message = "Hello, I would like to purchase the following items from my cart:\n\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      if (item.curatedDetails) {
        message += `   Type: Curated Piece (${item.curatedDetails.modeTitle})\n`;
        message += `   Fit: ${item.curatedDetails.audience}\n`;
        if (item.curatedDetails.technique) message += `   Technique: ${item.curatedDetails.technique}\n`;
        if (item.curatedDetails.pieceName) message += `   Piece: ${item.curatedDetails.pieceName}\n`;
        message += `   Silhouette: ${item.curatedDetails.silhouetteName}\n`;
        message += `   Size: ${item.size}\n`;
        if (item.curatedDetails.colorName) message += `   Linen: ${item.curatedDetails.colorName}\n`;
        if (item.curatedDetails.theme) message += `   Theme: "${item.curatedDetails.theme}"\n`;
      } else {
        let specs = `   Size: ${item.size} | Fit: ${item.silhouette.replace(/-/g, ' ')}`;
        if (item.color) {
          specs += ` | Colour: ${item.color}`;
        }
        message += `${specs}\n`;
      }
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₹${(item.price * item.quantity).toLocaleString()}\n\n`;
    });
    
    message += `Estimated Total: ₹${cartTotal.toLocaleString()}\n\n`;
    message += "Please let me know the next steps for payment and shipping.";
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="flex min-h-screen flex-col bg-[#F9F8F6]">
      <Navbar variant="dark" />
      
      <div className="pt-28 md:pt-36 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 container mx-auto w-full max-w-[1300px] flex-1">
        
        {/* Compact Editorial Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 md:mb-8 border-b border-[#E8E6E1] pb-4 md:pb-5 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-garamond text-2xl sm:text-3xl md:text-4xl text-[#2C2B29] tracking-tight">
                Your Bag
              </h1>
              <span className="text-[11px] font-sans font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#5C5A58]">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-[#8B8985] text-[11px] tracking-[0.18em] uppercase mt-1">
              Carefully selected for slow living
            </p>
          </div>
          <Link 
            href="/collections" 
            className="group inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-[#8B8985] hover:text-[#2C2B29] transition-colors"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8B8985] mb-5">
              <ShoppingBag size={22} strokeWidth={1.5} />
            </div>
            <p className="font-garamond text-2xl text-[#2C2B29] mb-3">Your bag is currently empty.</p>
            <p className="text-[#8B8985] text-xs max-w-sm mb-8">
              Discover our latest pieces and timeless essentials to begin curating your wardrobe.
            </p>
            <Link 
              href="/collections"
              className="bg-[#2C2B29] hover:bg-black text-white px-7 py-3 text-[11px] tracking-[0.18em] uppercase font-semibold transition-colors rounded-xs shadow-xs"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-start">
            
            {/* Compact, Tight Cart Items with Sleek Scrollable Container for 20+ items */}
            <div className="flex-1 w-full flex flex-col divide-y divide-[#E8E6E1]/70 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto lg:pr-3 [scrollbar-width:thin] scrollbar-thin">
              {cart.map((item) => {
                const isCurated = Boolean(
                  item.curatedDetails?.isCurated ||
                  item.productId.startsWith('curated-') ||
                  item.name.toLowerCase().includes('curated')
                );
                const itemHref = isCurated ? '/curate-your-piece' : `/product/${item.productId}`;

                return (
                  <div 
                    key={item.id} 
                    className="group flex gap-3.5 sm:gap-4 py-3.5 sm:py-4 items-start relative hover:bg-white/40 transition-colors px-1 sm:px-2 rounded-xs"
                  >
                    {/* Compact Product Thumbnail */}
                    <Link 
                      href={itemHref}
                      className="w-16 sm:w-20 aspect-[3/4] bg-[#F2F0ED] shrink-0 overflow-hidden rounded-xs relative block mt-0.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                    </Link>
                    
                    {/* Product Details - Tight & Compact */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 pr-1 w-full">
                          {isCurated && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9px] uppercase tracking-[0.14em] font-semibold text-[#4E7185] bg-[#EAF0F6] px-1.5 py-0.5 rounded-xs">
                                Curated Piece
                              </span>
                              {item.curatedDetails?.modeTitle && (
                                <span className="text-[9px] uppercase tracking-wider text-[#8B8985] font-sans">
                                  • {item.curatedDetails.modeTitle}
                                </span>
                              )}
                            </div>
                          )}

                          <Link 
                            href={itemHref} 
                            className="font-serif text-sm sm:text-base text-[#2C2B29] hover:text-[#79A7D3] transition-colors block font-normal leading-snug"
                          >
                            {item.name}
                          </Link>
                          
                          {/* Rich Specs for Curated Piece */}
                          {item.curatedDetails ? (
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] text-[#6B6864] bg-[#F7F6F3] px-2.5 py-1.5 rounded-xs border border-[#ECEAE5]">
                              <span>Fit: <strong className="text-[#2C2B29] font-medium">{item.curatedDetails.audience}</strong></span>
                              {item.curatedDetails.technique && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                  <span>Technique: <strong className="text-[#2C2B29] font-medium">{item.curatedDetails.technique}</strong></span>
                                </>
                              )}
                              {item.curatedDetails.pieceName && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                  <span>Piece: <strong className="text-[#2C2B29] font-medium">{item.curatedDetails.pieceName}</strong></span>
                                </>
                              )}
                              <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                              <span>Silhouette: <strong className="text-[#2C2B29] font-medium">{item.curatedDetails.silhouetteName}</strong></span>
                              <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                              <span>Size: <strong className="text-[#2C2B29] font-medium">{item.size}</strong></span>
                              {item.curatedDetails.colorName && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                  <span>Linen: <strong className="text-[#2C2B29] font-medium">{item.curatedDetails.colorName}</strong></span>
                                </>
                              )}
                              {item.curatedDetails.theme && (
                                <div className="w-full mt-1 pt-1 border-t border-[#E8E6E1]/60 text-[10px] italic text-[#4E7185]">
                                  Theme: &ldquo;{item.curatedDetails.theme}&rdquo;
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] tracking-wider uppercase text-[#8B8985] mt-1">
                              <span>Size: <strong className="text-[#2C2B29] font-medium">{item.size}</strong></span>
                              <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                              <span>Fit: <strong className="text-[#2C2B29] font-medium">{item.silhouette.replace(/-/g, ' ')}</strong></span>
                              {item.color && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                  <span>Colour: <strong className="text-[#4E7185] bg-[#EAF0F6] px-1.5 py-0.5 rounded-xs font-semibold">{item.color}</strong></span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#B5B3AE] hover:text-[#D14F4F] p-1 transition-colors shrink-0"
                          aria-label={`Remove ${item.name}`}
                          title="Remove item"
                        >
                          <X size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    
                    {/* Quantity & Price Row */}
                    <div className="flex items-center justify-between mt-2.5 pt-1">
                      {/* Compact Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-wider uppercase text-[#8B8985] font-sans">Qty</span>
                        <div className="flex items-center border border-[#E8E6E1] bg-white rounded-full px-1.5 py-0.5 shadow-2xs">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="p-0.5 text-[#8B8985] hover:text-[#2C2B29] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-5 text-center text-xs font-medium text-[#2C2B29]">
                            {item.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="p-0.5 text-[#8B8985] hover:text-[#2C2B29] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Line Item Total */}
                      <div className="text-right">
                        <div className="font-serif text-sm sm:text-base text-[#2C2B29] font-medium">
                          ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-[#8B8985] font-sans">
                            ₹ {item.price.toLocaleString("en-IN")} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Tight Order Summary */}
            <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 sticky top-28 md:top-36">
              <div className="bg-[#F2F0ED] p-5 sm:p-6 md:p-7 rounded-sm border border-[#E8E6E1]/80">
                <h2 className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8B8985] mb-5">
                  Order Summary
                </h2>
                
                <div className="flex flex-col gap-3 text-xs sm:text-sm text-[#5C5A58] mb-5 border-b border-[#E8E6E1] pb-5">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                    <span className="font-serif text-base text-[#2C2B29] font-medium">
                      ₹ {cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="text-[11px] italic text-[#8B8985]">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-xs tracking-wider uppercase font-semibold text-[#2C2B29]">
                    Estimated Total
                  </span>
                  <span className="font-serif text-2xl md:text-3xl text-[#2C2B29] font-medium">
                    ₹ {cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                
                <Link 
                  href="/checkout"
                  className="w-full group bg-[#2C2B29] text-white py-3.5 px-5 flex items-center justify-between hover:bg-black transition-all duration-300 rounded-xs shadow-xs"
                >
                  <span className="text-xs tracking-[0.16em] uppercase font-medium">
                    Proceed to Checkout
                  </span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
                
                <p className="mt-4 text-center text-[10px] text-[#8B8985] italic font-sans">
                  Orders are personally coordinated and verified via WhatsApp.
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
