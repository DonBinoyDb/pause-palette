"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight, Eye, Play, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  // Filter journals based on selected tab
  const filteredJournals = journals.filter((j) => {
    if (activeTab === "all") return true;
    if (activeTab === "photos") return Boolean(j.imageUrl) && !isVideoUrl(j.imageUrl);
    if (activeTab === "videos") return isVideoUrl(j.imageUrl);
    return true;
  });

  // If filtered is empty for videos, fallback gracefully to all journals
  const displayItems = filteredJournals.length > 0 ? filteredJournals : journals;

  // Calculate card width + gap for accurate 1-by-1 sliding
  const getStep = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return 320;
    const card = el.firstElementChild as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 300;
    // Gap: 16px on mobile, 24px on md+
    const gap = window.innerWidth >= 768 ? 24 : 16;
    return cardWidth + gap;
  }, []);

  const handlePrev = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const step = getStep();
    const newScroll = Math.max(0, el.scrollLeft - step);
    el.scrollTo({ left: newScroll, behavior: "smooth" });
  }, [getStep]);

  const handleNext = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const step = getStep();
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScroll - 15) {
      // Loop back to start
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, [getStep]);

  const scrollToIndex = (index: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const step = getStep();
    el.scrollTo({ left: index * step, behavior: "smooth" });
    setActiveIndex(index);
  };

  // Sync active index based on scroll position
  const handleScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const step = getStep();
    if (step <= 0) return;
    const index = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.min(Math.max(0, index), displayItems.length - 1));
  }, [displayItems.length, getStep]);

  // Auto-slide: Advances one by one every 4 seconds, pauses on hover/touch
  useEffect(() => {
    if (isPaused || displayItems.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, displayItems.length, handleNext]);

  // Reset scroll and active index when tab changes
  useEffect(() => {
    setActiveIndex(0);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // Close modal on ESC key and lock body scroll when open
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
      {/* Category Tabs & Header Controls */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-3 border-b border-gray-100">
        <div className="flex gap-6 sm:gap-8 md:gap-12 text-[12px] md:text-[13px] tracking-[0.08em] font-serif uppercase">
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
            onClick={() => setActiveTab("videos")}
            className={`pb-1 transition-colors cursor-pointer ${
              activeTab === "videos"
                ? "text-[#79A7D3] border-b-2 border-[#79A7D3] font-medium"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Top Right Mini Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous story"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all cursor-pointer bg-white shadow-2xs hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next story"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all cursor-pointer bg-white shadow-2xs hover:scale-105 active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Discrete 1-by-1 Slider Container (Clean edges, NO fade blur overlays) */}
      <div
        className="relative w-full mb-8 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {displayItems.length === 0 ? (
          <div className="py-24 text-center text-gray-400 text-sm italic font-garamond">
            No journal entries found in this category.
          </div>
        ) : (
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {displayItems.map((journal) => (
              <div
                key={journal.id}
                onClick={() => setSelectedJournal(journal)}
                className="w-[82vw] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start cursor-pointer group/card flex flex-col transition-all duration-300"
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

      {/* Indicator Dots & Centered Navigation Controls */}
      {displayItems.length > 1 && (
        <div className="flex items-center justify-center gap-4 mb-20">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all cursor-pointer bg-white shadow-2xs hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Indicator Dots */}
          <div className="flex gap-2 items-center px-1">
            {displayItems.map((_, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Go to item ${idx + 1}`}
                  className={`rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? "w-6 h-1.5 bg-[#79A7D3]"
                      : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-all cursor-pointer bg-white shadow-2xs hover:scale-105 active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

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
