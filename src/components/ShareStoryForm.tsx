"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ShareStoryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
          toast.error(uploadData.message || "Failed to upload photo, proceeding with story.");
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
          sourceLink: email || phone ? `${email} ${phone}`.trim() : "",
          rating: 5,
          isPublished: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit story");
      }

      toast.success("Thank you! Your story has been submitted.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-6">
        <h2 className="font-serif text-[15px] tracking-[0.14em] text-gray-700 uppercase mb-2">
          Share Your Story
        </h2>
        <p className="font-serif italic text-gray-600 text-[13px] mb-3 leading-snug">
          Is a piece of Pause Palette already part of your story?
        </p>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-1.5">
          Tell us how you wore it, where it went with you, or simply what you loved about it — and, if you wish, share a photograph from the moment.
        </p>
        <p className="text-[12px] text-gray-500 italic">
          Your story could become part of Worn Stories.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 bg-white transition-colors"
        />
        <input
          suppressHydrationWarning
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 bg-white transition-colors"
        />
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 bg-white transition-colors"
        />

        {/* File Upload Input */}
        <div className="relative w-full">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[12px] text-gray-400 flex justify-between items-center cursor-pointer hover:border-gray-400 italic bg-white transition-colors"
          >
            <span className="truncate max-w-[220px]">
              {file ? file.name : "Upload Photo (optional)"}
            </span>
            <span className="text-gray-500 text-[11px] font-sans not-italic shrink-0 ml-2">
              Choose file
            </span>
          </label>
        </div>

        <textarea
          placeholder="Message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[12px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 resize-none bg-white transition-colors"
        ></textarea>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={loading}
          className="w-full border border-[#8FB1D0] text-[#7A9BB9] font-serif italic py-2.5 rounded-sm hover:bg-[#F4F8FB] transition-colors text-[13px] mt-1 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Sending..." : "Send your Story"}
        </button>
      </form>
    </div>
  );
}
