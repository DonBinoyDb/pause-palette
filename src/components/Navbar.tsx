"use client";

import Link from "next/link";
import { User, Search, ShoppingCart, Bookmark } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function Navbar({ variant = "light" }: { variant?: "light" | "dark" | "glass" }) {
  const isGlass = variant === "glass";
  const textColor = variant === "light" ? "text-white" : "text-[#79A7D3]";
  const headerBg = isGlass ? "bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm" : "bg-transparent";
  const borderColor = variant === "light" ? "border-white/20" : "border-[#79A7D3]/20";
  const bgColor = variant === "light" ? "bg-white/10" : "bg-white/80";
  const hoverBg = variant === "light" ? "hover:bg-white/20" : "hover:bg-[#79A7D3]/10";
  const hoverTextColor = variant === "light" ? "hover:text-white" : "hover:text-[#79A7D3]";
  const childTextColor = variant === "light" ? "text-white/80" : "text-[#79A7D3]/80";

  // Use the shop context for dynamic badges
  const { cart, saved } = useShop();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const savedItemCount = saved.length;

  return (
    <header suppressHydrationWarning className={`absolute top-0 w-full z-50 ${headerBg} ${textColor} pt-6 pb-4 transition-all duration-300`}>
      <div className="container mx-auto px-12 flex items-start justify-between">
        
        {/* Left Links */}
        <nav className="flex gap-12 mt-2 text-xs tracking-[0.2em] uppercase z-50">
          
          {/* Shop Dropdown */}
          <div className="relative group py-2">
            <span className="hover:opacity-70 transition-opacity cursor-pointer">Shop</span>
            
            <div className="absolute top-[100%] left-0 pt-3 invisible group-hover:visible">
              <div className={`flex flex-col p-2 ${bgColor} backdrop-blur-md rounded-md border ${borderColor} min-w-[200px] shadow-2xl opacity-0 -translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
                
                <Link href="/shop/new-in" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">New In</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>

                <Link href="/shop/all" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">All</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>

                <Link href="/collections" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">Collections</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>
                
                <Link href="/collections/men" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">Men</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>

                <Link href="/collections/women" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">Women</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>

              </div>
            </div>
          </div>
          
          {/* Discover Dropdown */}
          <div className="relative group py-2">
            <span className="hover:opacity-70 transition-opacity cursor-pointer">Discover</span>
            
            {/* Dropdown wrapper with padding to bridge the hover gap */}
            <div className="absolute top-[100%] left-0 pt-3 invisible group-hover:visible">
              <div className={`flex flex-col p-2 ${bgColor} backdrop-blur-md rounded-md border ${borderColor} min-w-[260px] shadow-2xl opacity-0 -translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
                {[
                  { name: "The Story Ahead", href: "/discover/story-ahead" },
                  { name: "Our Story", href: "/discover/our-story" },
                  { name: "The Making Journal", href: "/discover/making-journal" },
                  { name: "Worn Stories", href: "/worn-stories" },
                  { name: "Lookbook", href: "/discover/lookbook" }
                ].map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}
                  >
                    <span className="whitespace-nowrap">{item.name}</span>
                    <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Center Logo */}
        <Link href="/" className="flex flex-col items-center justify-center -mt-2 hover:opacity-80 transition-opacity">
          <span className="font-brand text-5xl leading-none">Pause</span>
          <span className="font-brand text-5xl leading-none -mt-2 translate-x-[-4px] translate-y-[-9px]">
            palette<span className="inline-block w-[6px] h-[6px] rounded-full bg-current ml-[2px]"></span>
          </span>
        </Link>
        
        {/* Right Icons */}
        <div className="flex items-center gap-6 mt-1">
          <Link href="/login" suppressHydrationWarning className="hover:opacity-70 transition-opacity">
            <User className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <Link href="/search" suppressHydrationWarning className="hover:opacity-70 transition-opacity">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <Link href="/cart" suppressHydrationWarning className="hover:opacity-70 transition-opacity relative">
            <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#79A7D3] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-serif">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link href="/saved" suppressHydrationWarning className="hover:opacity-70 transition-opacity relative">
            <Bookmark className="w-5 h-5 stroke-[1.5]" />
            {savedItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#79A7D3] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-serif">
                {savedItemCount}
              </span>
            )}
          </Link>
        </div>
        
      </div>
    </header>
  );
}
