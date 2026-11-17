"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Star, Image as ImageIcon, MessageSquare, Sparkles, X, ChevronLeft, ChevronRight, LayoutGrid, Palette } from "lucide-react";
import ReviewIllustration, { ReviewType } from "@/components/ReviewIllustration";

export interface ReviewItem {
  id: string;
  customerName: string;
  reviewText: string;
  imageUrl?: string | null;
  rating?: number;
  sourceLink?: string | null;
  createdAt?: string | Date;
}

export default function WornStoriesCarousel({ reviews }: { reviews: ReviewItem[] }) {
  // View mode: 'editorial' (curated magazine polaroid cards) or 'illustrated' (signature hand-drawn boy/girl art)
  const [viewMode, setViewMode] = useState<"editorial" | "illustrated">("editorial");
  const [filter, setFilter] = useState<"all" | "photos" | "notes">("all");
  const [modalStory, setModalStory] = useState<ReviewItem | null>(null);

  // Pagination for illustrated mode
  const [illustratedPage, setIllustratedPage] = useState(0);
  const [showAllIllustrated, setShowAllIllustrated] = useState(false);
  const REVIEWS_PER_PAGE = 3;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (filter === "photos") return reviews.filter((r) => Boolean(r.imageUrl));
    if (filter === "notes") return reviews.filter((r) => !r.imageUrl);
    return reviews;
  }, [reviews, filter]);

  // Illustrated pagination calculations
  const totalIllustratedPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const visibleIllustrated = showAllIllustrated
    ? reviews
    : reviews.slice(illustratedPage * REVIEWS_PER_PAGE, (illustratedPage + 1) * REVIEWS_PER_PAGE);

  const handlePrevIllustrated = () => {
    if (showAllIllustrated) {
      setShowAllIllustrated(false);
      setIllustratedPage(0);
      return;
    }
    setIllustratedPage((prev) => (prev > 0 ? prev - 1 : totalIllustratedPages - 1));
  };

  const handleNextIllustrated = () => {
    if (showAllIllustrated) {
      setShowAllIllustrated(false);
      setIllustratedPage(0);
      return;
    }
    setIllustratedPage((prev) => (prev < totalIllustratedPages - 1 ? prev + 1 : 0));
  };

  if (reviews.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-[#FAF8F5] border border-[#EAE7E1] rounded-sm mb-20">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-white border border-[#EAE7E1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/leaf_icon.png" alt="Pause Leaf" className="w-6 h-6 object-contain opacity-70" />
        </div>
        <h3 className="font-garamond text-xl text-gray-800 italic mb-2">
          The sketchbook is waiting for your story
        </h3>
        <p className="font-garamond text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
          Be among the first to share how a Pause Palette piece lived in your world — from quiet studio mornings to sunny travels.
        </p>
        <a
          href="#share-story"
          className="inline-block px-6 py-2.5 bg-white border border-[#79A7D3] text-[#79A7D3] hover:bg-[#F4F8FB] text-xs uppercase tracking-widest font-medium transition-all"
        >
          Share the First Story
        </a>
      </div>
    );
  }

  return (
    <div className="w-full mb-20">
      {/* View Switcher & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EAE7E1] pb-4 mb-10">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-colors cursor-pointer rounded-xs ${
              filter === "all"
                ? "text-[#79A7D3] font-semibold border-b-2 border-[#79A7D3] -mb-[18px]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            All Stories ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("photos")}
            className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-colors cursor-pointer rounded-xs flex items-center gap-1.5 ${
              filter === "photos"
                ? "text-[#79A7D3] font-semibold border-b-2 border-[#79A7D3] -mb-[18px]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ImageIcon size={12} />
            With Photographs ({reviews.filter((r) => Boolean(r.imageUrl)).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("notes")}
            className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-colors cursor-pointer rounded-xs flex items-center gap-1.5 ${
              filter === "notes"
                ? "text-[#79A7D3] font-semibold border-b-2 border-[#79A7D3] -mb-[18px]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <MessageSquare size={12} />
            Reflections ({reviews.filter((r) => !r.imageUrl).length})
          </button>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F4F2ED] p-1 rounded-sm text-xs font-garamond">
          <button
            type="button"
            onClick={() => setViewMode("editorial")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xs transition-all cursor-pointer ${
              viewMode === "editorial"
                ? "bg-white text-gray-900 shadow-2xs font-medium"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <LayoutGrid size={13} />
            <span>Editorial Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("illustrated")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xs transition-all cursor-pointer ${
              viewMode === "illustrated"
                ? "bg-white text-gray-900 shadow-2xs font-medium"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Palette size={13} />
            <span>Illustrated Scrapbook</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: EDITORIAL GALLERY */}
      {viewMode === "editorial" && (
        <div>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-garamond italic">
              No stories match this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredReviews.map((review) => {
                const hasImage = Boolean(review.imageUrl);
                const isLongText = review.reviewText.length > 200;

                return (
                  <article
                    key={review.id}
                    className="group bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] border border-[#EAE7E1] rounded-sm p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#DDD8CF]"
                  >
                    <div>
                      {/* Top Header: Star Rating + Story Badge */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE7E1]/70">
                        <div className="flex items-center gap-0.5 text-[#c2a17a]">
                          {Array.from({ length: review.rating || 5 }).map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                          ))}
                        </div>
                        <span className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-sans">
                          {hasImage ? "Photo Moment" : "Reflection"}
                        </span>
                      </div>

                      {/* Photo Polaroid Frame (if image exists) */}
                      {hasImage && (
                        <div
                          onClick={() => setModalStory(review)}
                          className="relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-white p-2 border border-[#E8E4DC] shadow-2xs mb-5 cursor-pointer group-hover:border-[#79A7D3]/40 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={review.imageUrl!}
                            alt={`Shared by ${review.customerName}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs text-[10px] tracking-widest uppercase font-sans px-2.5 py-1 text-gray-700 rounded-2xs shadow-xs">
                              View Story
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Quote Text */}
                      <blockquote className="relative">
                        <span className="text-3xl font-serif text-[#79A7D3]/30 leading-none absolute -top-3 -left-1 select-none">
                          &ldquo;
                        </span>
                        <p className="font-garamond italic text-[15px] sm:text-[16px] text-[#2C2B29] leading-relaxed pl-3 mb-4">
                          {isLongText ? (
                            <>
                              {review.reviewText.slice(0, 190)}...
                              <button
                                type="button"
                                onClick={() => setModalStory(review)}
                                className="ml-1 text-[12px] not-italic text-[#79A7D3] hover:underline cursor-pointer font-sans"
                              >
                                Read full story
                              </button>
                            </>
                          ) : (
                            review.reviewText
                          )}
                        </p>
                      </blockquote>
                    </div>

                    {/* Footer: Customer Name & Source Details */}
                    <div className="pt-4 mt-2 border-t border-[#EAE7E1]/60 flex items-center justify-between">
                      <div>
                        <p className="font-garamond font-medium text-gray-800 text-[14px] tracking-wide">
                          {review.customerName}
                        </p>
                        {review.sourceLink && (
                          <p className="text-[11px] text-gray-400 font-sans tracking-wider">
                            {review.sourceLink.startsWith("@") ? review.sourceLink : review.sourceLink}
                          </p>
                        )}
                      </div>

                      <div className="w-6 h-6 flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/leaf_icon.png" alt="Pause Leaf" className="w-4 h-4 object-contain" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: ILLUSTRATED SCRAPBOOK */}
      {viewMode === "illustrated" && (
        <div>
          <div className="mb-10 relative flex justify-center -mx-6 md:-mx-12 lg:-mx-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-[2000px] w-full mx-auto px-6 lg:px-12 transition-opacity duration-300">
              {visibleIllustrated.map((review, index) => {
                const reviewGlobalIndex = showAllIllustrated
                  ? index
                  : illustratedPage * REVIEWS_PER_PAGE + index;
                const illustrationType = (reviewGlobalIndex % 2 === 0 ? "girl" : "boy") as ReviewType;

                return (
                  <div key={review.id} className="relative group">
                    <ReviewIllustration
                      type={illustrationType}
                      photoUrl={review.imageUrl || ""}
                      text={review.reviewText}
                    />
                    <div className="text-center mt-2">
                      <span className="font-garamond text-xs text-gray-500 uppercase tracking-widest">
                        — {review.customerName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Controls */}
          {reviews.length > REVIEWS_PER_PAGE && (
            <div className="flex items-center justify-center gap-4 text-gray-500 text-xs tracking-widest select-none pt-4">
              <button
                type="button"
                onClick={handlePrevIllustrated}
                aria-label="Previous reviews"
                className="p-1 hover:text-[#79A7D3] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalIllustratedPages }).map((_, pageIdx) => {
                  const isActive = !showAllIllustrated && illustratedPage === pageIdx;
                  return (
                    <button
                      key={pageIdx}
                      type="button"
                      onClick={() => {
                        setShowAllIllustrated(false);
                        setIllustratedPage(pageIdx);
                      }}
                      aria-label={`Go to page ${pageIdx + 1}`}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        isActive ? "bg-[#79A7D3] scale-125" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextIllustrated}
                aria-label="Next reviews"
                className="p-1 hover:text-[#79A7D3] transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowAllIllustrated((prev) => !prev)}
                className={`ml-2 cursor-pointer transition-colors ${
                  showAllIllustrated
                    ? "text-[#79A7D3] font-semibold underline underline-offset-4"
                    : "text-gray-500 hover:text-gray-900 underline underline-offset-4"
                }`}
              >
                {showAllIllustrated ? "PAGINATE" : "SHOW ALL"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FULL STORY LIGHTBOX MODAL */}
      {modalStory && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setModalStory(null)}
        >
          <div
            className="bg-white rounded-sm max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-[#EAE7E1] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalStory(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {modalStory.imageUrl && (
              <div className="w-full aspect-[4/3] relative rounded-xs overflow-hidden mb-6 bg-gray-50 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={modalStory.imageUrl}
                  alt={modalStory.customerName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-1 text-[#c2a17a] mb-3">
              {Array.from({ length: modalStory.rating || 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>

            <blockquote className="font-garamond italic text-lg md:text-xl text-gray-800 leading-relaxed mb-6">
              &ldquo;{modalStory.reviewText}&rdquo;
            </blockquote>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <div>
                <p className="font-garamond font-medium text-base text-gray-900">
                  {modalStory.customerName}
                </p>
                {modalStory.sourceLink && (
                  <p className="text-xs text-gray-400 font-sans tracking-wider">
                    {modalStory.sourceLink}
                  </p>
                )}
              </div>
              <span className="text-[11px] uppercase tracking-widest text-gray-400 font-sans">
                Pause Palette Patron
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
