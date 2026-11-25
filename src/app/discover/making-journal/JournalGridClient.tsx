"use client";

import { useState } from "react";

type Journal = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

export default function JournalGridClient({ journals }: { journals: Journal[] }) {
  const [activeTab, setActiveTab] = useState<"videos" | "photos" | "all">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  const filteredJournals = journals.filter((j) => {
    if (!j.imageUrl) return activeTab === "all";
    const isVideo = /\.(mp4|webm|mov|ogg)$/i.test(j.imageUrl);
    if (activeTab === "videos") return isVideo;
    if (activeTab === "photos") return !isVideo;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredJournals.length / itemsPerPage));

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const currentJournals = filteredJournals.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <>
      {/* Interactive Tabs */}
      <div className="flex gap-12 mb-12 text-[13px] tracking-[0.05em] font-serif uppercase">
        <button
          suppressHydrationWarning
          onClick={() => {
            setActiveTab("videos");
            setCurrentPage(0);
          }}
          className={`pb-0.5 transition-colors border-b ${
            activeTab === "videos"
              ? "text-[#8FB1D0] border-[#8FB1D0]"
              : "text-gray-500 border-gray-400 hover:text-gray-800"
          }`}
        >
          Videos
        </button>
        <button
          suppressHydrationWarning
          onClick={() => {
            setActiveTab("photos");
            setCurrentPage(0);
          }}
          className={`pb-0.5 transition-colors border-b ${
            activeTab === "photos"
              ? "text-[#8FB1D0] border-[#8FB1D0]"
              : "text-gray-500 border-gray-400 hover:text-gray-800"
          }`}
        >
          Photos
        </button>
        <button
          suppressHydrationWarning
          onClick={() => {
            setActiveTab("all");
            setCurrentPage(0);
          }}
          className={`pb-0.5 transition-colors border-b ${
            activeTab === "all"
              ? "text-[#8FB1D0] border-[#8FB1D0]"
              : "text-gray-500 border-gray-400 hover:text-gray-800"
          }`}
        >
          All
        </button>
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12">
        {filteredJournals.length === 0 ? (
          <div className="col-span-full py-24 text-center text-gray-400 text-sm">
            No journal entries found in this category.
          </div>
        ) : (
          currentJournals.map((journal) => (
            <div key={journal.id} className="flex flex-col gap-4">
              {journal.imageUrl && (
                /\.(mp4|webm|mov|ogg)$/i.test(journal.imageUrl) ? (
                  <div className="w-full aspect-[3/4] overflow-hidden rounded-xs bg-black relative">
                    <video
                      src={journal.imageUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                    />
                  </div>
                ) : (
                  <img 
                    src={journal.imageUrl} 
                    alt={journal.title} 
                    className="w-full h-auto aspect-[3/4] object-cover duration-500 rounded-xs" 
                  />
                )
              )}
              <div>
                <h3 className="font-garamond text-sm text-gray-800 mb-2 font-medium tracking-wide uppercase">{journal.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed text-justify whitespace-pre-wrap">
                  {journal.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carousel Controls */}
      {filteredJournals.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-3 mb-24 text-gray-400 text-xs">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 0}
            className="hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {'<'}
          </button>
          
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  currentPage === idx ? 'bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Page ${idx + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages - 1}
            className="hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {'>'}
          </button>
        </div>
      )}
    </>
  );
}
