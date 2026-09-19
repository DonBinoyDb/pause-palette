"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { clearData } = useShop();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'account'>('orders');

  useEffect(() => {
    // If we definitely know they are unauthenticated, kick them to login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-serif text-gray-400 tracking-widest text-sm uppercase">Loading...</p>
      </main>
    );
  }

  const handleSignOut = async () => {
    clearData();
    await signOut({ callbackUrl: '/' });
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-40 pb-32 px-10 md:px-20 container mx-auto w-full max-w-[1400px] flex-1">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-wide mb-3">
            My Account
          </h1>
          <p className="text-gray-500 italic text-sm font-serif">
            Welcome back, {session.user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="sticky top-32 space-y-8">
              <nav className="flex flex-col gap-6">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`text-left text-xs tracking-[0.15em] uppercase transition-colors ${
                    activeTab === 'orders' 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Order History
                </button>
                <Link 
                  href="/saved" 
                  className="text-left text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Saved Items
                </Link>
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`text-left text-xs tracking-[0.15em] uppercase transition-colors ${
                    activeTab === 'account' 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Account Details
                </button>
              </nav>

              <div className="pt-8 border-t border-gray-100">
                <button 
                  onClick={handleSignOut}
                  className="text-left text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 min-h-[500px]">
            {activeTab === 'orders' ? (
              <div className="animate-in fade-in duration-700">
                <h2 className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-12 border-b border-gray-100 pb-4">Order History</h2>
                
                <div className="py-24 text-center">
                  <p className="text-gray-500 font-serif italic text-lg mb-6">You haven't placed any orders yet.</p>
                  <Link href="/shop/all" className="inline-block border-b border-gray-900 text-gray-900 text-xs tracking-[0.15em] uppercase pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                <h2 className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-12 border-b border-gray-100 pb-4">Account Details</h2>
                
                <form className="max-w-2xl">
                  {/* Personal Info Section */}
                  <div className="space-y-10 mb-16">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">First Name</label>
                        <input 
                          type="text" 
                          defaultValue={session.user?.name?.split(' ')[0] || ''}
                          className="w-full border-b border-gray-200 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-transparent rounded-none placeholder-gray-300"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Last Name</label>
                        <input 
                          type="text" 
                          defaultValue={session.user?.name?.split(' ').slice(1).join(' ') || ''}
                          className="w-full border-b border-gray-200 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-transparent rounded-none placeholder-gray-300"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="+91"
                        className="w-full border-b border-gray-200 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-transparent rounded-none placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Account Security Section */}
                  <div className="space-y-10 mb-16">
                    <div className="flex flex-col gap-2 opacity-60">
                      <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Email Address (Non-editable)</label>
                      <input 
                        type="email" 
                        defaultValue={session.user?.email || ''}
                        disabled
                        className="w-full border-b border-gray-200 py-3 text-sm text-gray-500 bg-transparent rounded-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <button type="button" className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-4 text-xs tracking-[0.15em] uppercase transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
