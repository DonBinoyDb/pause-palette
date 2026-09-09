import AuthProvider from "@/components/AuthProvider";
import Sidebar from "@/components/admin/Sidebar";
import { Search } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex bg-white font-sans text-gray-900">
        
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#F8F9FD]">
          {/* Top Navbar */}
          <header className="h-[72px] bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 border-b border-gray-100/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <span>Admin Workspace</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white transition-all border border-transparent focus:border-red-200"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 pl-2 pr-4 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
                <div className="w-7 h-7 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  A
                </div>
                <span className="text-sm font-semibold text-gray-700">Admin</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
