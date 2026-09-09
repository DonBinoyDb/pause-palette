"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-32 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 italic mb-16 text-sm">Last updated: September 2026</p>
        
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8 text-sm md:text-base">
          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">1. Information We Collect</h2>
            <p>
              At Pause Palette, we believe in slow, intentional fashion, and that extends to how we handle your data. We only collect the information necessary to provide you with our thoughtfully crafted garments and services. This includes your name, email address, shipping address, and payment information when you place an order.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">2. How We Use Your Information</h2>
            <p>
              The information we collect is used exclusively to fulfill your orders, communicate with you regarding your purchases, and, if you opt-in, share our Making Journal and new collection stories with you. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted and processed through secure gateways.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-gray-800 mb-4 tracking-wide">4. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights or have any questions about our privacy practices, please reach out to our Customer Care team.
            </p>
          </section>
          
          <div className="pt-12 border-t border-gray-200 mt-16">
            <p className="text-xs text-gray-400 italic">
              For any privacy-related inquiries, please contact us at privacy@pausepalette.com.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
