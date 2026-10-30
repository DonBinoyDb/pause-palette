"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useShop } from "@/context/ShopContext";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  description?: string | null;
  sizes?: string[];
  collection?: { name: string } | null;
}

interface NewInSectionProps {
  products: Product[];
  tagline?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function NewInSection({
  products,
  tagline = "NEW IN",
  title = "",
  subtitle = "",
  buttonText = "Explore All",
  buttonLink = "/shop/new-in",
}: NewInSectionProps) {
  const { toggleSaved, isSaved } = useShop();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    
    setHasOverflow(maxScroll > 10);
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < maxScroll - 5);

    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
    } else {
      setScrollProgress(100);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, products]);

  // Auto slide interval (pauses on hover or touch)
  useEffect(() => {
    if (isPaused || !hasOverflow || products.length <= 4) return;

    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;

      const card = el.firstElementChild as HTMLElement | null;
      const cardWidth = card?.offsetWidth || 280;
      const gap = window.innerWidth >= 768 ? 24 : 16;
      const step = cardWidth + gap;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        // Loop back to the start smoothly
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, hasOverflow, products.length]);

  const scroll = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 280;
    const gap = window.innerWidth >= 768 ? 24 : 16;
    // On desktop, scroll 2 cards per click for pleasant pacing
    const cardsToAdvance = window.innerWidth >= 1024 ? 2 : 1;
    const scrollAmount = (cardWidth + gap) * cardsToAdvance;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  const targetLink = buttonLink?.trim() ? buttonLink : "/shop/new-in";
  const targetBtnText = buttonText?.trim() ? buttonText : "Explore All";

  return (
    <section className="bg-white pt-8 md:pt-14 pb-16 md:pb-24 border-t border-gray-100 overflow-hidden">
      <div className="w-full px-6 md:px-10 lg:px-20 max-w-[1700px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4">
          <div>
            {tagline?.trim() && (
              <span className="text-[12px] tracking-[0.25em] text-gray-400 uppercase font-semibold block mb-2">
                {tagline}
              </span>
            )}
            {title?.trim() && (
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl text-gray-900 font-normal leading-tight mt-1"
                style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
              >
                {title}
              </h2>
            )}
            {subtitle?.trim() && (
              <p className="text-sm md:text-base text-gray-500 mt-2 max-w-xl font-light">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Header Controls: Slide Arrows & Explore All Link */}
          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Slide Arrows (visible when more items than screen width) */}
            {hasOverflow && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous products"
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-black transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105 active:scale-95 bg-white shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next products"
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-900 hover:text-black transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105 active:scale-95 bg-white shadow-xs"
                >
                  <ChevronRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            )}

            {hasOverflow && <div className="h-4 w-px bg-gray-200 hidden md:block" />}

            <Link 
              href={targetLink}
              className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-500 hover:text-gray-900 transition-colors font-semibold group"
            >
              <span>{targetBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>

        {/* Products Sliding Track: Exactly 4 cards at a time on desktop */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            ref={sliderRef}
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 px-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => {
              const mainImage = product.images?.[0] || "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop";
              const secondaryImage = product.images?.[1];
              const categoryName = product.collection?.name || "Pause Palette";

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="w-[75vw] sm:w-[calc((100%-16px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)] shrink-0 snap-start group flex flex-col cursor-pointer select-none"
                >
                  {/* Image Container with Smooth Slide & Zoom Micro-animations */}
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden rounded-sm mb-3.5">
                    {/* Primary Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainImage}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                        secondaryImage ? "group-hover:opacity-0" : ""
                      }`}
                    />

                    {/* Secondary Image for smooth crossfade/slide hover */}
                    {secondaryImage && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={secondaryImage}
                        alt={`${product.name} alternate view`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSaved({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          image: mainImage,
                        });
                      }}
                      className={`absolute top-3 right-3 z-10 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-all duration-300 shadow-2xs ${
                        isSaved(product.id)
                          ? "text-red-500 opacity-100"
                          : "text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-gray-900 hover:scale-110"
                      }`}
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isSaved(product.id) ? "fill-current text-red-500" : "stroke-[1.5]"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details (Generous, balanced typography) */}
                  <div className="flex flex-col px-0.5">
                    <h3 className="font-garamond text-[15px] md:text-[17px] text-gray-900 group-hover:text-gray-600 transition-colors truncate font-normal leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[12px] md:text-[14px] text-gray-500 truncate font-garamond italic mt-0.5">
                      {categoryName}
                    </p>
                    <p className="font-sans font-medium text-[13px] md:text-[15px] text-gray-900 tracking-tight tabular-nums mt-1">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Slide Progress Indicator (visible when there is overflow to scroll) */}
          {hasOverflow && (
            <div className="flex items-center justify-between mt-6 pt-2">
              <div className="w-28 md:w-44 h-[2px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-800 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${Math.max(20, scrollProgress)}%` }}
                />
              </div>
              
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-sans">
                Slide to explore ({products.length})
              </span>
            </div>
          )}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link 
            href={targetLink}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-700 hover:text-black font-semibold border border-gray-200 px-6 py-3 rounded-full hover:border-gray-900 transition-colors"
          >
            <span>{targetBtnText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
