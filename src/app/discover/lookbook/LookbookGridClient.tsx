"use client";

import Link from 'next/link';
import { useState } from 'react';

type LookbookItem = {
  id: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

export default function LookbookGridClient({ items }: { items: LookbookItem[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const currentItems = items.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 5-Item Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 w-full">
        {currentItems.map((item, index) => {
          // In a 5-item grid, the 4th item (index 3) spans 2 columns
          const isWide = index === 3;
          
          return (
            <div 
              key={item.id} 
              className={`relative group overflow-hidden bg-gray-50 ${
                isWide ? 'md:col-span-2' : 'md:col-span-1 aspect-[3/4]'
              }`}
            >
              {item.linkUrl ? (
                <Link href={item.linkUrl} className="block w-full h-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || "Lookbook Image"} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  {item.title && (
                    <div className="absolute bottom-5 right-5 z-10">
                      <span className="text-white/90 font-garamond italic text-sm border-b border-white/50 pb-0.5 tracking-wide shadow-black drop-shadow-md">
                        {item.title}
                      </span>
                    </div>
                  )}
                </Link>
              ) : (
                <div className="block w-full h-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || "Lookbook Image"} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {item.title && (
                    <div className="absolute bottom-5 right-5 z-10">
                      <span className="text-white/90 font-garamond italic text-sm border-b border-white/50 pb-0.5 tracking-wide shadow-black drop-shadow-md">
                        {item.title}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls - only visible when next set is added (totalPages > 1) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10 text-gray-500 font-garamond text-xs tracking-widest select-none">
          <button 
            type="button"
            onClick={handlePrev} 
            disabled={currentPage === 0}
            aria-label="Previous lookbook set"
            className="hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1 cursor-pointer"
          >
            {'<'}
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentPage === i ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to lookbook set ${i + 1}`}
              />
            ))}
          </div>

          <button 
            type="button"
            onClick={handleNext} 
            disabled={currentPage === totalPages - 1}
            aria-label="Next lookbook set"
            className="hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1 cursor-pointer"
          >
            {'>'}
          </button>
          
          <Link href="/shop/all" className="ml-3 border-b border-gray-400 pb-0.5 hover:text-gray-900 transition-colors">
            ALL
          </Link>
        </div>
      )}
    </div>
  );
}
