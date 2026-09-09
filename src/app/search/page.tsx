"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-40 pb-24 px-6 md:px-12 flex-1 flex flex-col items-center">
        
        <div className="w-full max-w-3xl">
          <div className="relative border-b border-gray-300 pb-2 mb-16 group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-gray-800 transition-colors" strokeWidth={1.5} />
            <input 
              suppressHydrationWarning
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pieces, colors, or collections..." 
              className="w-full bg-transparent pl-12 pr-4 py-4 text-xl md:text-2xl font-serif text-gray-800 focus:outline-none placeholder:text-gray-300 placeholder:italic placeholder:font-serif"
              autoFocus
            />
          </div>

          {query.length > 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-500 mb-2">Searching for "{query}"</p>
              <p className="font-serif italic text-gray-400">No results found just yet. Try another term.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-[11px] font-medium tracking-widest text-gray-400 uppercase mb-6 text-center">
                POPULAR SEARCHES
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {["Linen Shirts", "Tropical Dawn", "Dresses", "New Arrivals", "Midnight Moss"].map(term => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="border border-gray-200 text-gray-500 text-xs py-2 px-6 hover:border-gray-800 hover:text-gray-800 transition-colors rounded-full"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      
      <Footer />
    </main>
  );
}
