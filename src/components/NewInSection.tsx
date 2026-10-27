"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import ProductQuickViewModal from "./ProductQuickViewModal";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);

    const maxScroll = scrollWidth - clientWidth;
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

  // Auto slide interval (pauses on hover, touch, or when modal is open)
  useEffect(() => {
    if (isPaused || selectedProduct !== null || products.length <= 1) return;

    const timer = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;

      const card = el.firstElementChild as HTMLElement | null;
      const cardWidth = card?.offsetWidth || 250;
      const step = cardWidth + 24;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        // Loop back to the start smoothly
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [isPaused, selectedProduct, products.length]);

  const scroll = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 250;
    const scrollAmount = (cardWidth + 24) * 2;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  const targetLink = buttonLink?.trim() ? buttonLink : "/shop/new-in";
  const targetBtnText = buttonText?.trim() ? buttonText : "Explore All";

  return (
    <section className="bg-white pt-8 md:pt-12 pb-16 md:pb-24 border-t border-gray-100 overflow-hidden">
      <div className="w-full px-6 md:px-10 lg:px-20">
        
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
            {/* Slide Arrows */}
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

            <div className="h-4 w-px bg-gray-200 hidden md:block" />

            <Link 
              href={targetLink}
              className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-500 hover:text-gray-900 transition-colors font-semibold group"
            >
              <span>{targetBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>

        {/* Products Sliding Track */}
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
                <div
                  key={product.id}
                  className="w-[185px] sm:w-[215px] md:w-[240px] lg:w-[255px] shrink-0 snap-start group flex flex-col cursor-pointer select-none"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Image Container with Smooth Slide & Zoom Micro-animations */}
                  <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden rounded-sm mb-3">
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
                        e.stopPropagation();
                        toggleSaved({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          image: mainImage,
                        });
                      }}
                      className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-all duration-300 ${
                        isSaved(product.id)
                          ? "text-red-500 opacity-100"
                          : "text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-gray-900 hover:scale-110"
                      }`}
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                          isSaved(product.id) ? "fill-current text-red-500" : "stroke-[1.5]"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Details (Reduced, balanced font sizes) */}
                  <div className="flex flex-col px-0.5">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-gray-400 font-sans truncate mb-0.5">
                      {categoryName}
                    </span>
                    <h3 className="font-serif text-[13px] md:text-[15px] text-gray-900 group-hover:text-gray-600 transition-colors truncate font-normal leading-snug">
                      {product.name}
                    </h3>
                    <p className="font-serif text-[12px] md:text-[13px] text-gray-900 font-medium mt-1">
                      ₹ {product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Slide Progress Indicator */}
          <div className="flex items-center justify-between mt-5 pt-2">
            <div className="w-24 md:w-36 h-[2px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-800 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.max(15, scrollProgress)}%` }}
              />
            </div>
            
            <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-sans">
              Slide to explore ({products.length})
            </span>
          </div>
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

      {/* Quick View Pop-up Modal */}
      <ProductQuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
