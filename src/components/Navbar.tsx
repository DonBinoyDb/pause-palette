"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Search, ShoppingCart, Bookmark, Menu, X, LayoutDashboard } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar({ variant = "light" }: { variant?: "light" | "dark" | "glass" }) {
  const isGlass = variant === "glass";
  const headerBg = isGlass ? "bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm" : "bg-transparent";
  const borderColor = variant === "light" ? "border-white/20" : "border-gray-200";
  const bgColor = variant === "light" ? "bg-white/10" : "bg-white/95";
  const hoverBg = variant === "light" ? "hover:bg-white/20" : "hover:bg-gray-100";
  const hoverTextColor = variant === "light" ? "hover:text-white" : "hover:text-black";
  const childTextColor = variant === "light" ? "text-white/80" : "text-gray-600";

  // Use the shop context for dynamic badges
  const { cart, saved } = useShop();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const savedItemCount = saved.length;
  
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role?.toLowerCase();
  const isAdmin = status === "authenticated" && userRole === "admin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Force text-gray-900 when mobile menu is open so the close button (and icons) are visible against the white overlay
  const textColor = mobileMenuOpen ? "text-gray-900" : (variant === "light" ? "text-white" : "text-gray-900");
  const isWhiteLogo = variant === "light" && !mobileMenuOpen;

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Position absolute normally, but fixed when mobile menu is open so it doesn't scroll away
  const positionClass = mobileMenuOpen ? "fixed" : "absolute";

  return (
    <header suppressHydrationWarning className={`${positionClass} top-0 left-0 w-full z-50 ${headerBg} ${textColor} pt-6 pb-4 transition-all duration-300`}>
      <div className="relative w-full px-4 md:px-8 lg:px-16 flex items-start justify-between">
        
        {/* Left Section (Desktop Links / Mobile Hamburger) */}
        <div className="flex items-center z-30">
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden mt-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="hover:opacity-70 transition-opacity" aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
            </button>
          </div>

          {/* Left Links (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 xl:gap-10 mt-2 text-xs tracking-[0.16em] uppercase">
            
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

            {/* Curate Your Piece Link */}
            <Link 
              href="/curate-your-piece" 
              className="py-2 hover:opacity-70 transition-opacity whitespace-nowrap text-current"
            >
              Curate Your Piece
            </Link>

          </nav>
        </div>

        {/* Center Logo - Perfectly Centered in Navbar */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none z-20">
          <Link href="/" className="pointer-events-auto flex items-center justify-center hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Pause.png"
              alt="Pause Palette"
              width={140}
              height={97}
              className={`w-auto h-11 sm:h-12 md:h-14 lg:h-16 object-contain transition-all duration-300 ${isWhiteLogo ? "brightness-0 invert" : ""}`}
              style={{ filter: isWhiteLogo ? "brightness(0) invert(1)" : "none" }}
            />
          </Link>
        </div>
        
        {/* Right Icons */}
        <div className="flex items-center gap-4 sm:gap-5 md:gap-6 mt-1 z-30">
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              suppressHydrationWarning
              className="hover:opacity-75 transition-opacity flex items-center gap-1.5"
              aria-label="Admin Dashboard"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 stroke-[1.5]" />
              <span className="hidden sm:inline-block text-[10px] tracking-[0.18em] uppercase font-semibold">
                Dashboard
              </span>
            </Link>
          ) : (
            <Link
              href={status === "authenticated" ? "/profile" : "/login"}
              suppressHydrationWarning
              className="hover:opacity-70 transition-opacity"
              aria-label="Profile"
              title={status === "authenticated" ? "Profile" : "Login"}
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
          )}
          <Link href="/search" suppressHydrationWarning className="hover:opacity-70 transition-opacity" aria-label="Search">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <Link href="/cart" suppressHydrationWarning className="hover:opacity-70 transition-opacity relative" aria-label="Cart">
            <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gray-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-serif">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link href="/saved" suppressHydrationWarning className="hover:opacity-70 transition-opacity relative" aria-label="Saved items">
            <Bookmark className="w-5 h-5 stroke-[1.5]" />
            {savedItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gray-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-serif">
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
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center mb-10 hover:opacity-85 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Pause.png"
              alt="Pause Palette"
              width={140}
              height={97}
              className="w-auto h-13 md:h-16 object-contain"
            />
          </Link>

          <nav className="flex flex-col gap-8 text-sm">
            <div>
              <div className="text-[#79A7D3] mb-4 text-xs font-semibold tracking-[0.2em] uppercase">SHOP</div>
              <div className="flex flex-col gap-3.5 pl-4 border-l border-gray-100 text-[15px] text-gray-700">
                <Link href="/shop/new-in" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">New In</Link>
                <Link href="/shop/all" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">All</Link>
                <Link href="/collections" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Collections</Link>
                <Link href="/categories/men" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Men</Link>
                <Link href="/categories/women" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Women</Link>
                <Link href="/curate-your-piece" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-black transition-colors">Curate Your Piece</Link>
              </div>
            </div>

            <div>
              <div className="text-[#79A7D3] mb-4 text-xs font-semibold tracking-[0.2em] uppercase">DISCOVER</div>
              <div className="flex flex-col gap-3.5 pl-4 border-l border-gray-100 text-[15px] text-gray-700">
                <Link href="/discover/story-ahead" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">The Story Ahead</Link>
                <Link href="/discover/our-story" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Our Story</Link>
                <Link href="/discover/making-journal" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">The Making Journal</Link>
                <Link href="/worn-stories" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Worn Stories</Link>
                <Link href="/discover/lookbook" onClick={() => setMobileMenuOpen(false)} className="hover:text-black transition-colors">Lookbook</Link>
              </div>
            </div>
            
            {status === "authenticated" && (
              <div className="mt-4 pt-6 border-t border-gray-100 text-[15px] text-gray-700">
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 hover:text-black transition-colors font-medium text-gray-900"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#79A7D3]" /> Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 hover:text-black transition-colors"
                  >
                    <User className="w-4 h-4" /> My Account
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
