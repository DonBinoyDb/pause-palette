"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-40 pb-32">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          
          {/* Header */}
          <h1 className="font-sans text-3xl md:text-4xl text-gray-900 mb-8 tracking-widest uppercase">
            Contact
          </h1>
          
          {/* Subheader */}
          <div className="text-center mb-12 w-full max-w-lg">
            <p className="font-sans italic text-gray-800 text-[15px] leading-relaxed mb-1 font-medium">
              Questions about a piece, an order, customisation, or a collabora-<br className="hidden md:block" />tion — we'd be glad to hear from you.
            </p>
            <p className="font-sans italic text-gray-500 text-[14px] leading-relaxed">
              Reach us through the channel that feels easiest, and we'll get back to<br className="hidden md:block" />you as soon as we can.
            </p>
          </div>

          {/* Form */}
          <form className="w-full max-w-lg flex flex-col gap-4 mb-3">
            <input 
              type="text" 
              placeholder="Name" 
              className="w-full border border-gray-300 rounded-[4px] px-4 py-3 font-sans italic text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full border border-gray-300 rounded-[4px] px-4 py-3 font-sans italic text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <input 
              type="tel" 
              placeholder="Phone" 
              className="w-full border border-gray-300 rounded-[4px] px-4 py-3 font-sans italic text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
            <textarea 
              placeholder="Message" 
              rows={5}
              className="w-full border border-gray-300 rounded-[4px] px-4 py-3 font-sans italic text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 resize-none"
            ></textarea>
            
            <button 
              type="button"
              className="w-full mt-2 border border-[#6b829c] rounded-[4px] py-3 text-[#587391] font-sans italic text-[15px] hover:bg-gray-50 transition-colors"
            >
              Send Message
            </button>
          </form>

          {/* Form Footer Text */}
          <p className="font-sans italic text-gray-500 text-[13px] mb-16">
            We look forward to hearing from you.
          </p>

          {/* Contact Links */}
          <div className="w-full max-w-lg flex flex-col gap-8 self-start ml-0 md:ml-4">
            
            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="mt-1 text-gray-600 shrink-0">
                <MessageCircle strokeWidth={1.5} size={28} />
              </div>
              <div className="flex flex-col">
                <p className="font-sans text-gray-500 text-[13px] mb-1">
                  For orders, product enquiries and quick assistance.
                </p>
                <a href="tel:+917907629021" className="font-sans text-[11px] text-gray-700 tracking-widest uppercase hover:text-black transition-colors">
                  CHAT WITH US
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="mt-1 text-gray-600 shrink-0">
                <Mail strokeWidth={1.5} size={28} />
              </div>
              <div className="flex flex-col">
                <p className="font-sans text-gray-500 text-[13px] mb-1">
                  For general enquiries, collaborations and detailed requests.
                </p>
                <a href="mailto:pausepalette@gmail.com" className="font-sans text-[11px] text-gray-700 tracking-widest uppercase hover:text-black transition-colors">
                  WRITE TO US
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-start gap-4">
              <div className="mt-1 text-gray-600 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </div>
              <div className="flex flex-col">
                <p className="font-sans text-gray-500 text-[13px] mb-1">
                  For new collections, behind-the-scenes moments and updates
                </p>
                <a href="https://www.instagram.com/pause_palette?stkn=c2k1dGNxeGJ4aGtj" target="_blank" rel="noopener noreferrer" className="font-sans text-[11px] text-gray-700 tracking-widest uppercase hover:text-black transition-colors">
                  Follow @pause_palette
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
