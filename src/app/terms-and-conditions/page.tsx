"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsAndConditionsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-32 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight">Terms & Conditions</h1>
        <p className="text-gray-500 italic mb-16 text-sm">Last updated: September 2026</p>
        
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8 text-sm md:text-base">
          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">1. Introduction</h2>
            <p>
              Welcome to Pause Palette. By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. Our pieces are thoughtfully made to order, and these terms reflect our commitment to craftsmanship and our relationship with you.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">2. Made to Order Process</h2>
            <p>
              Because our garments are created slowly and intentionally, please note that all items are made to order. Dispatches typically occur within 12-15 business days. By placing an order, you acknowledge and agree to this timeline.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">3. Pricing and Payments</h2>
            <p>
              All prices are listed in Indian Rupees (₹) unless otherwise noted. We reserve the right to modify prices at any time. Payment is required in full at the time of purchase before the crafting process begins.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">4. Intellectual Property</h2>
            <p>
              All original hand-drawn illustrations, photographs, and content on this website are the exclusive property of Pause Palette. They may not be reproduced, copied, or used without our explicit written permission.
            </p>
          </section>
          
          <div className="pt-12 border-t border-gray-200 mt-16">
            <p className="text-xs text-gray-400 italic">
              For any legal inquiries regarding these terms, please contact us at legal@pausepalette.com.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
