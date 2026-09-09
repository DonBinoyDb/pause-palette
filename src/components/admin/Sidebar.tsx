"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tag, LogOut, Image as ImageIcon, Star } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Collections", href: "/admin/collections", icon: Tag },
    { name: "Lookbook", href: "/admin/lookbook", icon: ImageIcon },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
  ];

  return (
    <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 py-6 px-4 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="mb-10 px-4">
        <Link href="/" className="flex flex-col items-start -mt-2 hover:opacity-80 transition-opacity">
          <span className="font-serif text-3xl font-medium tracking-tight text-gray-900">Pause Palette</span>
          <p className="text-[12px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name}
              href={item.href} 
              className={`flex items-center gap-4 px-4 py-3.5 text-[14px] font-semibold rounded-2xl transition-all duration-200 ${
                isActive 
                  ? "text-red-500 bg-red-50 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <Link 
          href="/api/auth/signout" 
          className="flex items-center gap-4 px-4 py-3.5 text-[14px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:text-red-500 transition-colors" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
