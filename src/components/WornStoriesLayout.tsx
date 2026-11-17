"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Star, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface ReviewItem {
  id: string;
  customerName: string;
  reviewText: string;
  imageUrl?: string | null;
  rating?: number;
  sourceLink?: string | null;
  createdAt?: string | Date;
}

export default function WornStoriesLayout({ reviews }: { reviews: ReviewItem[] }) {
  // Left side: Active review index & auto-rotation state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Right side: Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalReviews = reviews.length;
  const currentReview = totalReviews > 0 ? reviews[currentIndex] : null;

  // Auto-change reviews every 5 seconds when multiple exist
  useEffect(() => {
    if (totalReviews <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < totalReviews - 1 ? prev + 1 : 0));
    }, 5000);

    return () => clearInterval(timer);
  }, [totalReviews, isPaused]);

  const handlePrev = () => {
    if (totalReviews === 0) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalReviews - 1));
  };

  const handleNext = () => {
    if (totalReviews === 0) return;
    setCurrentIndex((prev) => (prev < totalReviews - 1 ? prev + 1 : 0));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      toast.error("Photo exceeds the 2MB size limit. Please choose a photo under 2MB.");
      e.target.value = "";
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const removePhoto = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please share your message or story.");
      return;
    }

    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Photo exceeds the 2MB limit. Please choose a photo under 2MB.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";

      // Upload photo if selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          toast.error(uploadData.message || "Failed to upload photo, proceeding with text.");
        }
      }

      // Submit review / story
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          reviewText: message.trim(),
          imageUrl,
          sourceLink: phone.trim() || (email.trim() ? email.trim() : ""),
          rating: 5,
          isPublished: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit story");
      }

      toast.success("Thank you! Your story has been submitted.");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSubmitted(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN: REVIEWS (Clean, no cartoon image container) */}
        {/* ==================================================== */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase">
              Reviews
            </h2>
            {totalReviews > 1 && (
              <span className="font-garamond text-[12px] text-gray-400 italic">
                {currentIndex + 1} of {totalReviews}
              </span>
            )}
          </div>

          {totalReviews > 0 ? (
            <div 
              className="relative w-full overflow-hidden rounded-sm border border-gray-200 bg-white"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Slides Track for horizontal slideshow animation */}
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="w-full shrink-0 p-6 sm:p-8 flex flex-col justify-between"
                  >
                    <div>
                      {/* Customer Photo or Brand Placeholder */}
                      <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-50 border border-gray-100 rounded-sm mb-5">
                        {review.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={review.imageUrl}
                            alt={`Review by ${review.customerName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#FAF9F6]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/leaf_icon.png" alt="Leaf" className="w-8 h-8 object-contain opacity-40 mb-2" />
                            <span className="font-garamond italic text-[13px] text-gray-400">
                              Pause Palette Reflection
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 text-[#79A7D3] mb-3">
                        {Array.from({ length: review.rating || 5 }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                        ))}
                      </div>

                      {/* Review Quote Text */}
                      <blockquote className="font-garamond italic text-[16px] md:text-[17px] text-gray-700 leading-relaxed mb-6">
                        &ldquo;{review.reviewText}&rdquo;
                      </blockquote>
                    </div>

                    {/* Author & Arrow Controls Row */}
                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="font-garamond text-[13px] font-medium tracking-wider uppercase text-gray-800">
                          — {review.customerName}
                        </p>
                        {review.sourceLink && (
                          <p className="font-garamond italic text-[11px] text-gray-400 mt-0.5">
                            {review.sourceLink}
                          </p>
                        )}
                      </div>

                      {/* Prev / Next Buttons */}
                      {totalReviews > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrev}
                            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-sm text-gray-500 hover:text-[#79A7D3] hover:border-[#79A7D3] transition-colors cursor-pointer text-xs"
                            aria-label="Previous review"
                            title="Previous review"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-sm text-gray-500 hover:text-[#79A7D3] hover:border-[#79A7D3] transition-colors cursor-pointer text-xs"
                            aria-label="Next review"
                            title="Next review"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm p-8 text-center">
              <p className="font-garamond italic text-[14px] text-gray-500">
                No reviews yet. Share your story using the form to be featured.
              </p>
            </div>
          )}

          {/* Dot Indicators below the slideshow */}
          {totalReviews > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? "w-6 h-1.5 bg-[#79A7D3]"
                      : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: SHARE YOUR STORY FORM                  */}
        {/* ==================================================== */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h2 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase">
              Share Your Story
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-8">
            <p className="font-garamond italic text-[13px] text-gray-500 mb-5 leading-relaxed">
              Is a piece of Pause Palette already part of your story? Tell us how you wore it or where it went with you.
            </p>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <p className="font-garamond text-[16px] text-gray-800">
                  Thank you, {name}.
                </p>
                <p className="font-garamond italic text-[13px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Your story has been received and will be reviewed to join our Worn Stories.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="font-garamond text-xs uppercase tracking-widest text-[#79A7D3] hover:underline cursor-pointer"
                  >
                    Share another story
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-sm px-4 py-2.5 font-garamond italic text-[13px] text-gray-800 placeholder:text-gray-400 bg-white focus:outline-none focus:border-gray-400"
                />

                <input
                  suppressHydrationWarning
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-4 py-2.5 font-garamond italic text-[13px] text-gray-800 placeholder:text-gray-400 bg-white focus:outline-none focus:border-gray-400"
                />

                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Phone or Instagram handle (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-4 py-2.5 font-garamond italic text-[13px] text-gray-800 placeholder:text-gray-400 bg-white focus:outline-none focus:border-gray-400"
                />

                {/* File Upload Input */}
                <div className="relative w-full">
                  <input
                    type="file"
                    id="photo-upload-layout"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload-layout"
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 font-garamond text-[13px] text-gray-400 flex justify-between items-center cursor-pointer hover:border-gray-400 italic bg-white"
                  >
                    <span className="truncate max-w-[220px]">
                      {file ? file.name : "Upload Photo (optional)"}
                    </span>
                    <span className="text-gray-500 not-italic text-xs font-garamond">Choose file</span>
                  </label>
                </div>

                {/* Selected File Preview with Remove Option */}
                {previewUrl && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-sm">
                    <div className="w-10 h-10 relative rounded-2xs overflow-hidden shrink-0 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-garamond text-[12px] text-gray-600 truncate flex-1">
                      {file?.name}
                    </span>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <textarea
                  placeholder="Message or Story"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-sm px-4 py-3 font-garamond italic text-[13px] text-gray-800 placeholder:text-gray-400 bg-white focus:outline-none focus:border-gray-400 resize-none"
                ></textarea>

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 border border-[#79A7D3] bg-white hover:bg-[#F4F8FB] text-[#79A7D3] font-garamond uppercase tracking-[0.15em] text-xs py-3 rounded-sm transition-colors cursor-pointer font-medium disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Your Story"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
