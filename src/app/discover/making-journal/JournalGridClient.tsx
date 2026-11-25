"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Eye, Play } from "lucide-react";

type Journal = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
};

const isVideoUrl = (url?: string | null) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg)$/i.test(url) || url.toLowerCase().includes("video");
};

export default function JournalGridClient({ journals }: { journals: Journal[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos">("all");
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  // Filter journals based on selected tab
  const filteredJournals = journals.filter((j) => {
    if (activeTab === "all") return true;
    if (activeTab === "photos") return Boolean(j.imageUrl) && !isVideoUrl(j.imageUrl);
    if (activeTab === "videos") return isVideoUrl(j.imageUrl);
    return true;
  });

  // If filtered is empty for videos, fallback gracefully to all journals
  const displayItems = filteredJournals.length > 0 ? filteredJournals : journals;

  // Duplicate items to ensure seamless infinite ribbon loop with translateX(-50%)
  // Base set repeats enough times to fill screens, then doubled to create 2 identical halves [baseSet, baseSet]
  const baseMultiples = Math.max(1, Math.ceil(6 / (displayItems.length || 1)));
  const baseSet = Array.from({ length: baseMultiples }).flatMap(() => displayItems);
  const ribbonItems = [...baseSet, ...baseSet];

  // Close on ESC key and lock body scroll when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedJournal(null);
      }
    };

    if (selectedJournal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedJournal]);

  return (
    <>
      {/* Category Tabs */}
      <div className="flex items-center justify-between gap-8 mb-10 pb-2 border-b border-gray-100">
        <div className="flex gap-8 md:gap-12 text-[12px] md:text-[13px] tracking-[0.08em] font-serif uppercase">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("videos")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === "videos"
                ? "text-[#79A7D3] border-b-2 border-[#79A7D3] font-medium"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Videos
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("photos")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === "photos"
                ? "text-[#79A7D3] border-b-2 border-[#79A7D3] font-medium"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Photos
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("all")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === "all"
                ? "text-[#79A7D3] border-b-2 border-[#79A7D3] font-medium"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            All
          </button>
        </div>

        {/* Ribbon Movement Hint */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400 tracking-wider font-light italic">
          <span className="w-1.5 h-1.5 rounded-full bg-[#79A7D3] animate-pulse"></span>
          <span>Hover to pause • Click story to open</span>
        </div>
      </div>

      {/* Running Ribbon Container */}
      <div className="relative w-full overflow-hidden mb-24 py-4 select-none group">
        
        {/* Soft edge gradients for editorial aesthetic */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 md:w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 md:w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {displayItems.length === 0 ? (
          <div className="py-24 text-center text-gray-400 text-sm italic font-garamond">
            No journal entries found. Check back soon.
          </div>
        ) : (
          /* Marquee Ribbon Track */
          <div className="animate-ribbon flex gap-6 md:gap-8 items-start py-2">
            {ribbonItems.map((journal, idx) => (
              <div
                key={`${journal.id}-${idx}`}
                onClick={() => setSelectedJournal(journal)}
                className="w-[260px] sm:w-[300px] md:w-[340px] shrink-0 cursor-pointer group/card flex flex-col transition-all duration-300"
              >
                {/* Image / Video Card Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 mb-3.5 rounded-xs border border-gray-100 shadow-2xs group-hover/card:shadow-md transition-all">
                  {journal.imageUrl ? (
                    isVideoUrl(journal.imageUrl) ? (
                      <div className="w-full h-full relative bg-black">
                        <video
                          src={journal.imageUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-xs flex items-center gap-1 font-mono">
                          <Play size={10} fill="currentColor" /> Video
                        </div>
                      </div>
                    ) : (
                      <img
                        src={journal.imageUrl}
                        alt={journal.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-50 text-gray-300 text-xs italic font-serif">
                      Pause Palette Journal
                    </div>
                  )}

                  {/* Hover Overlay Badge */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <span className="px-3 py-1.5 bg-white/95 text-gray-900 text-[11px] font-serif tracking-[0.15em] uppercase shadow-md flex items-center gap-1.5 rounded-xs transform translate-y-2 group-hover/card:translate-y-0 transition-transform">
                      <Eye size={13} className="text-[#79A7D3]" /> View Story
                    </span>
                  </div>
                </div>

                {/* Meta & Title */}
                <div>
                  <h3 className="font-garamond text-sm md:text-[15px] text-gray-900 group-hover/card:text-[#79A7D3] transition-colors mb-1.5 font-medium tracking-wide uppercase line-clamp-1">
                    {journal.title}
                  </h3>
                  <p className="text-[12px] md:text-[12.5px] text-gray-500 line-clamp-2 leading-relaxed whitespace-pre-wrap font-light">
                    {journal.content}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#79A7D3] tracking-widest uppercase mt-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    Read Story <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pop-Up Modal */}
      {selectedJournal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedJournal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xs shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200 border border-gray-100"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedJournal(null)}
              aria-label="Close dialog"
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-black flex items-center justify-center shadow-md transition-all cursor-pointer border border-gray-200 hover:scale-105"
            >
              <X size={16} />
            </button>

            {/* Modal Left: Image or Video */}
            <div className="md:w-1/2 bg-[#FBFBFA] flex items-center justify-center relative min-h-[260px] md:min-h-[480px] p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100">
              {selectedJournal.imageUrl ? (
                isVideoUrl(selectedJournal.imageUrl) ? (
                  <video
                    src={selectedJournal.imageUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[65vh] w-full h-auto object-contain rounded-xs drop-shadow-xs"
                  />
                ) : (
                  <img
                    src={selectedJournal.imageUrl}
                    alt={selectedJournal.title}
                    className="max-h-[65vh] w-full h-auto object-contain rounded-xs drop-shadow-xs"
                  />
                )
              ) : (
                <div className="text-gray-300 text-sm font-serif italic">Pause Palette Journal</div>
              )}
            </div>

            {/* Modal Right: Text Story */}
            <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
              <div>
                {/* Date & Collection Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#79A7D3]">
                    {new Date(selectedJournal.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-serif text-gray-400">
                    The Making Journal
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-garamond text-2xl md:text-3xl text-gray-900 tracking-wide uppercase mb-3 leading-snug font-normal">
                  {selectedJournal.title}
                </h2>

                <div className="w-10 h-0.5 bg-[#79A7D3] mb-6"></div>

                {/* Full Content */}
                <div className="text-[13px] md:text-[14px] text-gray-600 leading-[1.9] whitespace-pre-wrap font-light">
                  {selectedJournal.content}
                </div>
              </div>

              {/* Modal Footer Note */}
              <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-serif italic">
                <span>Pause Palette Studio Notes</span>
                <span className="tracking-widest uppercase not-italic text-[10px] text-gray-500">Vol. 01</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
