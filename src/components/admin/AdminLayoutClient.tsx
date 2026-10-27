"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Layers, 
  LogOut, 
  Image as ImageIcon, 
  Star, 
  BookOpen, 
  Sparkles, 
  ShoppingBag, 
  FileText, 
  MessageCircle,
  Menu,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Store
} from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpandedMobile, setIsSearchExpandedMobile] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Hero Banner", href: "/admin/hero", icon: Sparkles },
    { name: "New Arrivals", href: "/admin/new-arrivals", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Collections", href: "/admin/collections", icon: Tag },
    { name: "Lookbook", href: "/admin/lookbook", icon: ImageIcon },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Journal", href: "/admin/journals", icon: BookOpen },
    { name: "Curator Settings", href: "/admin/curator", icon: LayoutDashboard },
    { name: "Policy Pages", href: "/admin/policy-pages", icon: FileText },
    { name: "WhatsApp & Contact", href: "/admin/contact-settings", icon: MessageCircle },
  ];

  // Mobile Bottom Bar primary quick actions
  const bottomBarItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "WhatsApp", href: "/admin/contact-settings", icon: MessageCircle },
    { name: "Categories", href: "/admin/categories", icon: Layers },
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpandedMobile(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchExpandedMobile(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpandedMobile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#F9F8F6] font-sans text-[#2C2B29] overflow-hidden">
      
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR (Visible lg and up)                    */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-[#FDFCFB] border-r border-[#E8E6E1] flex-col h-full py-8 z-20 overflow-y-auto">
        <div className="mb-10 px-8">
          <Link href="/" className="flex flex-col items-start group">
            <span className="font-serif text-[28px] font-medium tracking-tight text-[#2C2B29] group-hover:opacity-80 transition-opacity leading-tight">
              Pause<br/>Palette
            </span>
            <div className="w-6 h-[1px] bg-[#2C2B29]/20 mt-4 mb-3 transition-all group-hover:w-10"></div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#8B8985] uppercase tracking-[0.2em] font-medium">Admin Workspace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-1 px-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`group flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive 
                    ? "text-[#2C2B29] bg-[#F2F0ED] shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]" 
                    : "text-[#8B8985] hover:text-[#2C2B29] hover:bg-[#F2F0ED]/50"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#2C2B29] rounded-r-full"></div>
                )}
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2 : 1.5} 
                  className={`${isActive ? "text-[#2C2B29]" : "text-[#8B8985] group-hover:text-[#2C2B29]"} transition-colors duration-200`} 
                />
                <span className="tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* View Storefront Link */}
        <div className="px-4 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium text-[#8B8985] hover:text-[#2C2B29] hover:bg-[#F2F0ED]/40 transition-colors border border-dashed border-[#E8E6E1]"
          >
            <span className="flex items-center gap-2">
              <Store size={14} />
              <span>Live Storefront</span>
            </span>
            <ExternalLink size={12} className="opacity-60" />
          </Link>
        </div>

        {/* Sign Out */}
        <div className="mt-auto pt-4 px-4 pb-4">
          <div className="w-full h-[1px] bg-[#E8E6E1] mb-4 mx-2 max-w-[calc(100%-16px)]"></div>
          <button 
            type="button"
            suppressHydrationWarning
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium text-[#8B8985] hover:text-[#D94F4F] hover:bg-[#D94F4F]/5 transition-all duration-200 group cursor-pointer"
          >
            <LogOut size={18} strokeWidth={1.5} className="text-[#8B8985] group-hover:text-[#D94F4F] transition-colors" />
            <span className="tracking-wide">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER OVERLAY & SHEET (lg:hidden)              */}
      {/* ======================================================== */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Sheet */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-[290px] max-w-[85vw] bg-[#FDFCFB] shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E8E6E1] flex items-center justify-between">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex flex-col"
            >
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2C2B29] leading-tight">
                Pause Palette
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#8B8985] uppercase tracking-[0.2em] font-medium">Admin Workspace</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="w-9 h-9 rounded-full bg-[#F2F0ED] hover:bg-[#E8E6E1] text-[#2C2B29] flex items-center justify-center transition-colors active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
            <p className="px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-[#8B8985]">
              Navigation
            </p>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-[#2C2B29] bg-[#F2F0ED] font-semibold shadow-xs"
                      : "text-[#8B8985] hover:text-[#2C2B29] hover:bg-[#F2F0ED]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-[#2C2B29] text-white" : "bg-[#F2F0ED] text-[#8B8985]"
                    }`}>
                      <Icon size={16} strokeWidth={isActive ? 2 : 1.75} />
                    </div>
                    <span className="tracking-wide">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className={isActive ? "text-[#2C2B29]" : "text-[#8B8985]/50"} />
                </Link>
              );
            })}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#E8E6E1] bg-[#FAF9F7] flex flex-col gap-2">
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-[#2C2B29] bg-white border border-[#E8E6E1] shadow-2xs hover:bg-[#F2F0ED] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Store size={15} className="text-[#8B8985]" />
                <span>Visit Storefront</span>
              </span>
              <ExternalLink size={13} className="text-[#8B8985]" />
            </Link>

            <button
              type="button"
              suppressHydrationWarning
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#D94F4F] bg-[#D94F4F]/10 hover:bg-[#D94F4F]/15 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out of Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CONTENT AREA & HEADER                            */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col bg-[#F9F8F6] h-full min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-[60px] sm:h-[68px] lg:h-[72px] shrink-0 bg-[#F9F8F6]/95 backdrop-blur-md flex items-center justify-between px-3.5 sm:px-6 lg:px-10 z-20 border-b border-[#E8E6E1]">
          
          {/* Mobile Left: Hamburger + Brand Title */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 -ml-1 text-[#2C2B29] hover:bg-[#F2F0ED] active:scale-95 rounded-lg transition-all"
            >
              <Menu size={22} />
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-[#2C2B29]">
                Pause Palette
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#2C2B29] text-white uppercase tracking-wider font-semibold">
                Admin
              </span>
            </Link>
          </div>

          {/* Desktop Left: Breadcrumb / Section Info */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#8B8985]">
            <span className="font-medium">Admin Workspace</span>
            <span>/</span>
            <span className="font-semibold text-[#2C2B29] capitalize">
              {pathname.replace("/admin/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            
            {/* Search Input (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8985]" />
              <input 
                type="text" 
                suppressHydrationWarning
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH INVENTORY..." 
                className="pl-10 pr-4 py-2 bg-[#F2F0ED] rounded-full text-[10px] tracking-[0.12em] uppercase w-48 lg:w-64 focus:outline-none focus:ring-1 focus:ring-[#2C2B29] transition-all border border-transparent placeholder:text-[#C4C2BE]"
              />
            </form>

            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchExpandedMobile(!isSearchExpandedMobile)}
              aria-label="Search inventory"
              className="sm:hidden p-2 text-[#8B8985] hover:text-[#2C2B29] rounded-full hover:bg-[#F2F0ED] transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Live Storefront Quick Link */}
            <Link
              href="/"
              target="_blank"
              title="Open storefront in new tab"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E6E1] bg-white text-[11px] font-medium text-[#8B8985] hover:text-[#2C2B29] hover:bg-[#F2F0ED] transition-colors shadow-2xs"
            >
              <Store size={13} />
              <span>Store</span>
              <ExternalLink size={10} className="opacity-60" />
            </Link>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2C2B29] rounded-full flex items-center justify-center text-[#FDFCFB] text-xs font-serif shadow-sm group-hover:ring-2 group-hover:ring-[#2C2B29]/20 transition-all">
                PP
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Expandable Bar */}
        {isSearchExpandedMobile && (
          <div className="sm:hidden px-3.5 py-2.5 bg-white border-b border-[#E8E6E1] animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search size={15} className="absolute left-3.5 text-[#8B8985]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or inventory..."
                className="w-full pl-10 pr-10 py-2 bg-[#F2F0ED] rounded-full text-xs text-[#2C2B29] focus:outline-none focus:ring-1 focus:ring-[#2C2B29]"
              />
              <button
                type="button"
                onClick={() => setIsSearchExpandedMobile(false)}
                className="absolute right-3 text-[#8B8985] hover:text-[#2C2B29]"
              >
                <X size={15} />
              </button>
            </form>
          </div>
        )}

        {/* Scrollable Children Body */}
        <div 
          id="admin-main-scroll" 
          className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 relative scroll-smooth pb-28 lg:pb-16"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. MOBILE BOTTOM QUICK NAVIGATION BAR (lg:hidden)        */}
        {/* ======================================================== */}
        <nav 
          aria-label="Mobile admin quick navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FDFCFB]/95 backdrop-blur-md border-t border-[#E8E6E1] z-40 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
        >
          {bottomBarItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#2C2B29] font-bold" : "text-[#8B8985] hover:text-[#2C2B29]"
                }`}
              >
                <div className="relative">
                  <Icon size={19} strokeWidth={isActive ? 2.25 : 1.75} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2C2B29]"></span>
                  )}
                </div>
                <span className="mt-1 tracking-tight leading-none">{item.name}</span>
              </Link>
            );
          })}

          {/* 5th Action: Full Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-[#8B8985] hover:text-[#2C2B29] transition-colors"
          >
            <Menu size={19} strokeWidth={1.75} />
            <span className="mt-1 tracking-tight leading-none">More</span>
          </button>
        </nav>

      </main>
    </div>
  );
}
