"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ReturnsAndExchangesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-32 max-w-4xl">
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-12 tracking-wider text-center uppercase">Returns & Exchanges</h1>
        
        <div className="prose prose-gray max-w-3xl mx-auto text-gray-600 leading-relaxed text-sm md:text-[15px]" style={{ fontFamily: "'EB Garamond', Garamond, serif" }}>
          
          <div className="mb-10 space-y-4">
            <p>
              At Pause Palette, every piece is thoughtfully made to order. We take great care in crafting and checking every garment before it reaches you. To ensure your chosen piece is exactly as expected, it's checked to perfectly match that which was ordered.
            </p>
            <p>
              We understand, however, that sometimes an exchange may need to take place. Eligible returns are reviewed individually by our team.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-4 font-semibold">RETURNS</h2>
            <div className="space-y-4">
              <p>
                Returns are accepted only if a product arrives damaged, defective, or different from the item confirmed in your order.
              </p>
              <p>
                Please contact us within 48 hours of delivery. An unboxing video clearly showing the sealed package and the issue is required for verification.
              </p>
              <p>
                The item must remain unworn, unwashed and unused, with all original tags, labels, invoices and packaging intact.
              </p>
              <p>
                Once approved, the item must be dispatched back to us within 7 days.
              </p>
              <p>
                We do not offer cash refunds. Depending on the nature of the issue, an appropriate replacement item or a store credit will be offered.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-4 font-semibold">EXCHANGES</h2>
            <div className="space-y-4">
              <p>
                We are happy to assist with a size exchange, subject to availability. Requests must be made within 48 hours of delivery, and the piece must remain unworn, unwashed and unused, with all original tags and packaging intact.
              </p>
              <p>
                As Pause Palette is made to order, your replacement size may need to be crafted especially for you. In such cases, return times are approximately 14-21 business days for a new piece. In all instances it is subject to fabric and material availability.
              </p>
              <p>
                Return and re-delivery shipping charges for size exchanges are borne by the customer.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-4 font-semibold">DELIVERY & TRANSIT</h2>
            <div className="space-y-4">
              <p>
                Please ensure that your shipping information is correct and complete when placing your order. We are unable to offer a refund, replacement or exchange for errors affected by your contact or incomplete address. Once dispatched, tracking updates are emailed to the recipient by the courier.
              </p>
              <p>
                We are not responsible for tracking the package for stolen, damaged or missing items during shipment. If your package arrives unsealed, please record the immediate opening of the unsealed packaging and contact us immediately.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-4 font-semibold">NOTE</h2>
            <div className="space-y-4">
              <p>
                As many Pause Palette pieces are crafted from natural fabrics, subtle variations in weave, texture and colour are part of their inherent character and are not considered defects.
              </p>
              <p>
                All returns and exchange requests are reviewed individually. Pause Palette reserves the right to decline or approve request at its sole discretion based on the circumstances of each request.
              </p>
              <p>
                For assistance, please contact our team at pausepalette@gmail.com
              </p>
            </div>
          </section>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
