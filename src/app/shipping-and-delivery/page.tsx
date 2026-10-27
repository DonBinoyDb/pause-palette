"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEFAULT_SHIPPING_AND_DELIVERY, PolicyPageData } from "@/lib/policyDefaults";

export default function ShippingAndDeliveryPage() {
  const [data, setData] = useState<PolicyPageData>(DEFAULT_SHIPPING_AND_DELIVERY);

  useEffect(() => {
    fetch("/api/policy-pages/shipping-and-delivery")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.title) {
          setData(json);
        }
      })
      .catch((err) => console.error("Error loading shipping policy:", err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-36 md:pt-48 pb-32 max-w-4xl text-center">
        <h1 className="font-garamond text-[16px] md:text-[18px] text-gray-500 font-semibold tracking-[0.2em] uppercase mb-10 md:mb-12">
          {data.title}
        </h1>
        
        <div className="prose prose-gray max-w-3xl mx-auto text-gray-600 leading-relaxed text-sm md:text-[15px]" style={{ fontFamily: "'EB Garamond', Garamond, serif" }}>
          
          {data.introText && (
            <div className="mb-12 space-y-4">
              {data.introText.split("\n\n").map((para, i) => (
                <p key={i} className={data.introItalic ? "italic" : ""}>
                  {para}
                </p>
              ))}
            </div>
          )}

          {data.sections.map((section, idx) => (
            <section key={section.id || idx} className="mb-10">
              <h2 className="font-sans text-xs tracking-[0.2em] text-gray-500 uppercase mb-3 font-semibold">
                {section.title}
              </h2>
              <div className="space-y-4">
                {(section.content || "").split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}

          {data.footerNote && (
            <div className="mt-16">
              <p className={data.footerItalic ? "italic" : ""}>
                {data.footerNote}
              </p>
            </div>
          )}

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
