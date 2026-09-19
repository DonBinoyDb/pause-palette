"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Search, ShoppingCart, Bookmark, Menu, X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar({ variant = "light" }: { variant?: "light" | "dark" | "glass" }) {
  const isGlass = variant === "glass";
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
  
  const { status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Force text-gray-900 when mobile menu is open so the close button (and icons) are visible against the white overlay
  const textColor = mobileMenuOpen ? "text-gray-900" : (variant === "light" ? "text-white" : "text-[#79A7D3]");

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Position absolute normally, but fixed when mobile menu is open so it doesn't scroll away
  const positionClass = mobileMenuOpen ? "fixed" : "absolute";

  return (
    <header suppressHydrationWarning className={`${positionClass} top-0 left-0 w-full z-50 ${headerBg} ${textColor} pt-6 pb-4 transition-all duration-300`}>
      <div className="w-full px-4 md:px-10 lg:px-20 flex items-start justify-between">
        
        {/* Mobile Hamburger Menu */}
        <div className="md:hidden mt-2 z-50">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hover:opacity-70 transition-opacity">
            {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
          </button>
        </div>

        {/* Left Links (Desktop Only) */}
        <nav className="hidden md:flex gap-8 lg:gap-12 mt-2 text-xs tracking-[0.2em] uppercase z-50">
          
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
                
                <Link href="/categories/men" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">Men</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>

                <Link href="/categories/women" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">Women</span>
                  <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">→</span>
                </Link>

                <div className={`h-px w-full my-1 ${borderColor}`}></div>

                <Link href="/curate-your-piece" className={`group/item flex items-center justify-between px-4 py-3 ${hoverBg} hover:backdrop-blur-2xl rounded-sm ${childTextColor} ${hoverTextColor} transition-all duration-300`}>
                  <span className="whitespace-nowrap">Curate Your Piece</span>
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

        {/* Center Logo (Desktop Only) */}
        <Link href="/" className="hidden md:flex flex-col items-center justify-center -mt-2 hover:opacity-80 transition-opacity">
          <span className="font-brand text-5xl leading-none">Pause</span>
          <span className="font-brand text-5xl leading-none -mt-2 translate-x-[-4px] translate-y-[-9px]">
            palette<span className="inline-block w-[6px] h-[6px] rounded-full bg-current ml-[2px]"></span>
          </span>
        </Link>
        
        {/* Right Icons */}
        <div className="flex items-center gap-6 mt-1">
          <Link href={status === "authenticated" ? "/profile" : "/login"} suppressHydrationWarning className="hover:opacity-70 transition-opacity">
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-white text-gray-900 z-40 flex flex-col pt-24 px-8 overflow-y-auto">
          
          {/* Logo inside mobile menu */}
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center justify-center mb-12 hover:opacity-80 transition-opacity">
            <span className="font-brand text-5xl leading-none">Pause</span>
            <span className="font-brand text-5xl leading-none -mt-2 translate-x-[-4px] translate-y-[-9px]">
              palette<span className="inline-block w-[6px] h-[6px] rounded-full bg-current ml-[2px]"></span>
            </span>
          </Link>

          <nav className="flex flex-col gap-8 text-sm tracking-[0.2em] uppercase">
            <div>
              <div className="text-gray-400 mb-4 text-xs font-semibold">SHOP</div>
              <div className="flex flex-col gap-4 pl-4 border-l border-gray-100">
                <Link href="/shop/new-in">New In</Link>
                <Link href="/shop/all">All</Link>
                <Link href="/collections">Collections</Link>
                <Link href="/categories/men">Men</Link>
                <Link href="/categories/women">Women</Link>
                <Link href="/curate-your-piece" className="text-blue-600">Curate Your Piece</Link>
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-4 text-xs font-semibold">DISCOVER</div>
              <div className="flex flex-col gap-4 pl-4 border-l border-gray-100">
                <Link href="/discover/story-ahead">The Story Ahead</Link>
                <Link href="/discover/our-story">Our Story</Link>
                <Link href="/discover/making-journal">The Making Journal</Link>
                <Link href="/worn-stories">Worn Stories</Link>
                <Link href="/discover/lookbook">Lookbook</Link>
              </div>
            </div>
            
            {status === "authenticated" && (
              <div className="mt-4 pt-8 border-t border-gray-100">
                <Link href="/profile" className="flex items-center gap-2"><User className="w-4 h-4" /> My Account</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
