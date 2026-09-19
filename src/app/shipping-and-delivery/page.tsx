"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShippingAndDeliveryPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-32 max-w-4xl text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-12 tracking-wider uppercase">Shipping & Delivery</h1>
        
        <div className="prose prose-gray max-w-3xl mx-auto text-gray-600 leading-relaxed text-sm md:text-[15px]" style={{ fontFamily: "'EB Garamond', Garamond, serif" }}>
          
          <div className="mb-12">
            <p className="italic">
              Most Pause Palette pieces are thoughtfully made to order, helping us create with greater intention while reducing unnecessary production and fabric waste.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-3 font-semibold">DISPATCH</h2>
            <div className="space-y-4">
              <p>
                Orders are typically dispatched within 12–15 business days from confirmation. Customised pieces or material related delays may require a little additional time, and we will keep you informed where needed.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-3 font-semibold">COMPLIMENTARY SHIPPING</h2>
            <div className="space-y-4">
              <p>
                We offer complimentary shipping across India. Tracking details will be shared once your order has been dispatched.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-3 font-semibold">DELIVERY</h2>
            <div className="space-y-4">
              <p>
                Delivery timelines begin from the date of dispatch and may vary depending on your location and courier service. Please ensure your delivery details are complete and accurate to avoid delays.
              </p>
            </div>
          </section>

          <div className="mt-16">
            <p className="italic">
              Pieces made with intention are worth a little time. Thank you for allowing us the time to make yours thoughtfully
            </p>
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
