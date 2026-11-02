"use client";

import { useState } from "react";
import ReviewIllustration, { ReviewType } from "@/components/ReviewIllustration";

export interface ReviewItem {
  id: string;
  customerName: string;
  reviewText: string;
  imageUrl?: string | null;
  rating?: number;
}

export default function WornStoriesCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const REVIEWS_PER_PAGE = 3;
  const totalReviews = reviews.length;
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

  // If 3 or fewer reviews, no pagination controls are needed
  const hasMultiplePages = totalReviews > REVIEWS_PER_PAGE;

  const visibleReviews = showAll
    ? reviews
    : reviews.slice(currentPage * REVIEWS_PER_PAGE, (currentPage + 1) * REVIEWS_PER_PAGE);

  const handlePrev = () => {
    if (showAll) {
      setShowAll(false);
      setCurrentPage(0);
      return;
    }
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    if (showAll) {
      setShowAll(false);
      setCurrentPage(0);
      return;
    }
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const handleDotClick = (pageIndex: number) => {
    setShowAll(false);
    setCurrentPage(pageIndex);
  };

  const handleToggleAll = () => {
    setShowAll((prev) => !prev);
  };

  if (totalReviews === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Reviews Illustration Section */}
      <div className="mb-12 relative flex justify-center -mx-6 md:-mx-12 lg:-mx-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-[2000px] w-full mx-auto px-6 lg:px-12 transition-opacity duration-300">
          {visibleReviews.map((review, index) => {
            const reviewGlobalIndex = showAll ? index : currentPage * REVIEWS_PER_PAGE + index;
            const illustrationType = (reviewGlobalIndex % 2 === 0 ? "girl" : "boy") as ReviewType;

            return (
              <ReviewIllustration
                key={review.id}
                type={illustrationType}
                photoUrl={review.imageUrl || ""}
                text={review.reviewText}
              />
            );
          })}
        </div>
      </div>

      {/* Carousel Controls - Only rendered if there are more than 3 reviews */}
      {hasMultiplePages && (
        <div className="flex items-center justify-center gap-4 mb-24 text-gray-500 text-xs tracking-widest select-none">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous reviews"
            className="p-1 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {"<"}
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const isActive = !showAll && currentPage === pageIdx;
              return (
                <button
                  key={pageIdx}
                  type="button"
                  onClick={() => handleDotClick(pageIdx)}
                  aria-label={`Go to page ${pageIdx + 1}`}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "bg-gray-800 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next reviews"
            className="p-1 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {">"}
          </button>

          <button
            type="button"
            onClick={handleToggleAll}
            className={`ml-2 cursor-pointer transition-colors ${
              showAll
                ? "text-gray-900 font-medium underline underline-offset-4"
                : "text-gray-500 hover:text-gray-900 underline underline-offset-4"
            }`}
          >
            ALL
          </button>
        </div>
      )}

      {/* Spacing when no pagination controls are shown */}
      {!hasMultiplePages && <div className="mb-20" />}
    </div>
  );
}
