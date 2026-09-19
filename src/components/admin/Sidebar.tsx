"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tag, Layers, LogOut, Image as ImageIcon, Star, BookOpen } from "lucide-react";

import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Collections", href: "/admin/collections", icon: Tag },
    { name: "Lookbook", href: "/admin/lookbook", icon: ImageIcon },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Journal", href: "/admin/journals", icon: BookOpen },
    { name: "Curator Settings", href: "/admin/curator", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-[260px] bg-[#FDFCFB] border-r border-[#E8E6E1] flex flex-col h-screen sticky top-0 py-8 z-20">
      <div className="mb-12 px-8">
        <Link href="/" className="flex flex-col items-start group">
          <span className="font-serif text-[28px] font-medium tracking-tight text-[#2C2B29] group-hover:opacity-80 transition-opacity">
            Pause<br/>Palette
          </span>
          <div className="w-6 h-[1px] bg-[#2C2B29]/20 mt-4 mb-3 transition-all group-hover:w-10"></div>
          <p className="text-[9px] text-[#8B8985] uppercase tracking-[0.2em] font-medium">Admin Workspace</p>
        </Link>
      </div>

      <div className="flex flex-col gap-1.5 px-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`group flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${
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
                className={`${isActive ? 'text-[#2C2B29]' : 'text-[#8B8985] group-hover:text-[#2C2B29]'} transition-colors duration-300`} 
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 px-4 pb-4">
        <div className="w-full h-[1px] bg-[#E8E6E1] mb-6 mx-2 max-w-[calc(100%-16px)]"></div>
        <button 
          suppressHydrationWarning
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-[#8B8985] hover:text-[#D94F4F] hover:bg-[#D94F4F]/5 transition-all duration-300 group"
        >
          <LogOut size={18} strokeWidth={1.5} className="text-[#8B8985] group-hover:text-[#D94F4F] transition-colors" />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
