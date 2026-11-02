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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      toast.error("Photo exceeds the 2MB size limit. Please choose a photo under 2MB.");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(selected);
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
    <div className="max-w-xl mx-auto text-center mb-16 w-full">
      <h2 className="font-garamond text-base tracking-[0.12em] text-gray-700 uppercase mb-3">
        Share Your Story
      </h2>
      <p className="font-garamond italic text-gray-600 text-base md:text-lg mb-4">
        Is a piece of Pause Palette already part of your story?
      </p>
      <p className="font-garamond text-[14px] text-gray-500 leading-relaxed mb-8">
        Tell us how you wore it, where it went with you, or simply what you loved about it — and, if you wish, share a photograph from the moment.
        <br />
        <br />
        Your story could become part of Worn Stories.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 bg-white"
        />
        <input
          suppressHydrationWarning
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 bg-white"
        />
        <input
          suppressHydrationWarning
          type="text"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 bg-white"
        />

        {/* File Upload Input */}
        <div className="relative w-full">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-400 flex justify-between items-center cursor-pointer hover:border-gray-400 italic bg-white"
          >
            <span className="truncate max-w-[280px]">
              {file ? file.name : "Upload Photo (optional)"}
            </span>
            <span className="text-gray-500 font-sans not-italic">Choose file</span>
          </label>
        </div>

        <textarea
          placeholder="Message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-sm px-4 py-3 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 resize-none mb-2 bg-white"
        ></textarea>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={loading}
          className="w-full border border-[#8FB1D0] text-[#7A9BB9] font-garamond italic py-2.5 rounded-sm hover:bg-[#F4F8FB] transition-colors text-sm cursor-pointer disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send your Story"}
        </button>
      </form>
    </div>
  );
}
