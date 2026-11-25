"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CollectionCarouselProps {
  images: string[];
  collectionName: string;
  heightClass?: string;
  linkHref?: string;
}

export default function CollectionCarousel({
  images,
  collectionName,
  heightClass = "h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] xl:h-[620px]",
  linkHref,
}: CollectionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const total = images.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Automatic movement every 7 seconds
  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, 7000);

    return () => clearInterval(timer);
  }, [total, goToNext, currentIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      e.preventDefault();
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  if (total === 0) {
    return (
      <div className={`w-full ${heightClass} bg-gray-100 flex items-center justify-center text-gray-400 font-garamond italic`}>
        No image available
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden bg-gray-100 group/carousel`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sliding Track */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, idx) => {
          const imgElement = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={`${collectionName} - slide ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          );

          return (
            <div key={idx} className="w-full h-full shrink-0 relative">
              {linkHref ? (
                <Link href={linkHref} className="block w-full h-full cursor-pointer">
                  {imgElement}
                </Link>
              ) : (
                imgElement
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (visible on hover on desktop when multiple images exist) */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 shadow-sm cursor-pointer hover:scale-105 active:scale-95 z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-gray-800 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 shadow-sm cursor-pointer hover:scale-105 active:scale-95 z-10"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 items-center bg-black/30 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? "w-4 h-1.5 bg-white shadow-xs"
                  : "w-1.5 h-1.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
