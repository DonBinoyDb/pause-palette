"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { UploadCloud, CheckCircle2, Star, X, Sparkles, Feather } from "lucide-react";

export default function ShareStoryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      toast.error("Please share your name.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write your story or reflection.");
      return;
    }

    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Photo exceeds the 2MB size limit. Please choose a photo under 2MB.");
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
          toast.error(uploadData.message || "Could not upload photo; proceeding with story.");
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
          sourceLink: location.trim() || (email.trim() ? email.trim() : ""),
          rating,
          isPublished: false, // goes to admin approval queue
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit story");
      }

      toast.success("Thank you! Your story has been received.");
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
    setLocation("");
    setMessage("");
    setRating(5);
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSubmitted(false);
  };

  return (
    <div id="share-story" className="max-w-5xl mx-auto w-full pt-10 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Atmospheric Editorial Invitation */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 pt-2">
          <div>
            <span className="font-garamond text-[13px] text-gray-500 font-medium tracking-[0.15em] uppercase block mb-3">
              AN INVITATION
            </span>
            <h2 className="font-garamond text-2xl sm:text-3xl text-gray-800 leading-snug mb-4">
              Is a piece of Pause Palette part of your journey?
            </h2>
            <p className="font-garamond text-[15px] text-gray-600 leading-relaxed mb-6">
              Every garment begins in our sketchbook as an idea between architects, but its true life begins the moment it becomes yours.
            </p>
            <p className="font-garamond text-[14px] text-gray-500 leading-relaxed mb-8">
              Tell us how you wore it, where it accompanied you, or simply the memory you carry in it. If you wish, share a photograph from that day.
            </p>

            {/* Inspiration Prompt Pills */}
            <div className="space-y-3 pt-2 border-t border-[#EAE7E1]">
              <p className="text-[11px] tracking-[0.18em] uppercase text-gray-400 font-sans">
                Moments we cherish hearing about:
              </p>
              <ul className="space-y-2 text-xs font-garamond italic text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#79A7D3]">•</span>
                  <span>Travels across seaside towns, mountains, or weekend escapes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#79A7D3]">•</span>
                  <span>Quiet studio mornings, afternoon books, and coffee rituals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#79A7D3]">•</span>
                  <span>How your natural linen softened and evolved over time</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Artistic illustration accent */}
          <div className="pt-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE7E1] flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/needle.png" alt="Needle & Thread" className="w-6 h-6 object-contain opacity-75" />
            </div>
            <p className="text-xs text-gray-400 font-garamond italic leading-tight">
              Thoughtfully curated for our living archive. Every story is reviewed before publication.
            </p>
          </div>
        </div>

        {/* Right Column: Refined Story Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#FAF8F5] border border-[#EAE7E1] rounded-xs p-7 sm:p-9 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 px-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-garamond text-2xl text-gray-800">
                  Thank you, {name}
                </h3>
                <p className="font-garamond italic text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your story has been woven into our sketchbook. Our studio will review it with care, and it may soon appear among our Worn Stories.
                </p>
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-garamond uppercase tracking-widest text-[#79A7D3] hover:text-[#5f8cb8] border-b border-[#79A7D3]/40 hover:border-[#79A7D3] pb-0.5 transition-colors cursor-pointer"
                  >
                    Share another reflection
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E1]">
                  <span className="text-xs tracking-[0.18em] uppercase text-gray-500 font-sans font-medium">
                    Submit Your Story
                  </span>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400 font-garamond mr-1">Experience:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-[#c2a17a] hover:scale-110 transition-transform cursor-pointer p-0.5"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          size={14}
                          fill={star <= rating ? "currentColor" : "none"}
                          strokeWidth={star <= rating ? 0 : 1.5}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-sans mb-1">
                      Your Name *
                    </label>
                    <input
                      suppressHydrationWarning
                      type="text"
                      placeholder="e.g. Maya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white border border-[#DDD8CF] focus:border-[#79A7D3] rounded-xs px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-sans mb-1">
                      City / Handle (optional)
                    </label>
                    <input
                      suppressHydrationWarning
                      type="text"
                      placeholder="e.g. Bengaluru or @instagram"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white border border-[#DDD8CF] focus:border-[#79A7D3] rounded-xs px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email (Private) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-sans">
                      Email Address (optional)
                    </label>
                    <span className="text-[10px] text-gray-400 italic font-garamond">
                      Private, never published
                    </span>
                  </div>
                  <input
                    suppressHydrationWarning
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#DDD8CF] focus:border-[#79A7D3] rounded-xs px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Story Reflection */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-sans mb-1">
                    Your Story or Reflection *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about the day, the setting, or the memory you made in this piece..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full bg-white border border-[#DDD8CF] focus:border-[#79A7D3] rounded-xs p-3.5 text-sm text-gray-800 font-garamond text-[15px] leading-relaxed placeholder:text-gray-400 focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                {/* Photo Upload with Live Visual Preview */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-sans mb-1">
                    Photograph (optional, max 2MB)
                  </label>

                  {previewUrl ? (
                    <div className="flex items-center gap-4 bg-white border border-[#DDD8CF] rounded-xs p-3">
                      <div className="w-14 h-14 relative rounded-xs overflow-hidden shrink-0 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{file?.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-gray-400 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-5 border border-dashed border-[#DDD8CF] hover:border-[#79A7D3] rounded-xs bg-white cursor-pointer transition-colors group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud size={20} className="text-gray-400 group-hover:text-[#79A7D3] transition-colors mb-1.5" />
                      <span className="text-xs font-garamond text-gray-600 group-hover:text-gray-900 transition-colors">
                        Click to upload a photograph from your day
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans mt-0.5">
                        JPG, PNG, or WEBP up to 2MB
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-[#F4F8FB] text-[#79A7D3] border border-[#79A7D3] text-xs uppercase tracking-[0.2em] font-medium py-3.5 rounded-xs transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Sending your story...</span>
                    ) : (
                      <>
                        <Feather size={14} />
                        <span>Send Your Story</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
