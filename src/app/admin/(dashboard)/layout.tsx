import AuthProvider from "@/components/AuthProvider";
import Sidebar from "@/components/admin/Sidebar";
import { Search } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-[#F9F8F6] font-sans text-[#2C2B29]">
        
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#F9F8F6]">
          {/* Top Navbar */}
          <header className="h-[80px] bg-[#F9F8F6]/80 backdrop-blur-md flex items-center justify-end px-12 sticky top-0 z-10 border-b border-[#E8E6E1]">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8985]" />
                <input 
                  type="text" 
                  suppressHydrationWarning
                  placeholder="SEARCH INVENTORY..." 
                  className="pl-12 pr-4 py-3 bg-[#F2F0ED] rounded-full text-[10px] tracking-[0.15em] uppercase w-64 focus:outline-none focus:ring-1 focus:ring-[#2C2B29] transition-all border border-transparent placeholder:text-[#C4C2BE]"
                />
              </div>
              
              <div className="flex items-center gap-3 cursor-pointer group">
                <span className="text-[10px] tracking-[0.15em] uppercase text-[#8B8985] group-hover:text-[#2C2B29] transition-colors">Admin Workspace</span>
                <div className="w-8 h-8 bg-[#2C2B29] rounded-full flex items-center justify-center text-[#FDFCFB] text-[10px] font-serif shadow-sm">
                  PP
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8 lg:p-12">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
