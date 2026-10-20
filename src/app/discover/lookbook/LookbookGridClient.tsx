"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type LookbookItem = {
  id: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

export default function LookbookGridClient({ items }: { items: LookbookItem[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const handlePrev = () => {
    if (totalPages > 1) {
      setCurrentPage(prev => (prev > 0 ? prev - 1 : totalPages - 1));
    }
  };

  const handleNext = () => {
    if (totalPages > 1) {
      setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Ribbon Slider Row with Pure Arrows Outside the Images */}
      <div className="w-full flex items-center justify-between gap-2 md:gap-4 lg:gap-6">
        {/* Navigation Arrows (Outside image, bare arrow, no bubble) */}
        {totalPages > 1 && (
          <button 
            onClick={handlePrev}
            aria-label="Previous set of images"
            className="flex shrink-0 items-center justify-center text-gray-400 hover:text-gray-900 transition-all p-1 hover:scale-110 active:scale-95 cursor-pointer -ml-1 md:-ml-2"
          >
            <ChevronLeft className="w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
          </button>
        )}

        {/* Sliding Ribbon Track (with overflow-hidden) */}
        <div className="overflow-hidden flex-1 py-2">
          <div 
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const pageItems = items.slice(
                pageIdx * itemsPerPage, 
                (pageIdx + 1) * itemsPerPage
              );

              return (
                <div 
                  key={pageIdx} 
                  className="w-full shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-1"
                >
                  {pageItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="aspect-[3/4] relative group overflow-hidden bg-gray-50 rounded-xs shadow-sm"
                    >
                      {item.linkUrl ? (
                        <Link href={item.linkUrl} className="block w-full h-full relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={item.imageUrl} 
                            alt={item.title || "Lookbook Image"} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                          {item.title && (
                            <div className="absolute bottom-5 right-5 z-10">
                              <span className="text-white/90 font-serif italic text-sm border-b border-white/50 pb-0.5 tracking-wide drop-shadow-md">
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
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          {item.title && (
                            <div className="absolute bottom-5 right-5 z-10">
                              <span className="text-white/90 font-serif italic text-sm border-b border-white/50 pb-0.5 tracking-wide drop-shadow-md">
                                {item.title}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Next Arrow (Outside image, bare arrow, no bubble) */}
        {totalPages > 1 && (
          <button 
            onClick={handleNext}
            aria-label="Next set of images"
            className="flex shrink-0 items-center justify-center text-gray-400 hover:text-gray-900 transition-all p-1 hover:scale-110 active:scale-95 cursor-pointer -mr-1 md:-mr-2"
          >
            <ChevronRight className="w-7 h-7 md:w-10 md:h-10" strokeWidth={1} />
          </button>
        )}
      </div>
    </div>
  );
}
