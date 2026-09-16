"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tag, LogOut, Image as ImageIcon, Star, BookOpen } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Collections", href: "/admin/collections", icon: Tag },
    { name: "Lookbook", href: "/admin/lookbook", icon: ImageIcon },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Journal", href: "/admin/journals", icon: BookOpen },
  ];

  return (
    <aside className="w-[280px] bg-[#1C1B1A] border-r border-[#2C2B29] flex flex-col h-screen sticky top-0 py-10 shadow-2xl z-20">
      <div className="mb-16 px-10">
        <Link href="/" className="flex flex-col items-start hover:opacity-80 transition-opacity">
          <span className="font-serif text-3xl font-medium tracking-tight text-[#FDFCFB]">Pause<br/>Palette</span>
          <div className="w-8 h-[1px] bg-[#4A4844] mt-4 mb-3"></div>
          <p className="text-[9px] text-[#8B8985] uppercase tracking-[0.2em]">Inventory System</p>
        </Link>
      </div>

      <div className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`group flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                isActive 
                  ? "text-[#FDFCFB]" 
                  : "text-[#8B8985] hover:text-[#C4C2BE]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-[#FDFCFB]"></div>
              )}
              <Icon size={16} strokeWidth={isActive ? 1.5 : 1.5} className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-300`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-8 px-4 border-t border-[#2C2B29]">
        <Link 
          href="/api/auth/signout" 
          className="flex items-center gap-4 px-6 py-4 text-[11px] uppercase tracking-[0.15em] text-[#8B8985] hover:text-[#FDFCFB] transition-colors group"
        >
          <LogOut size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
