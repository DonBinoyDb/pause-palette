"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  title: string;
  items: FAQ[];
};

const faqData: FAQCategory[] = [
  {
    id: "general",
    title: "GENERAL",
    items: [
      {
        question: "Do you have a physical store?",
        answer: "At present, Pause Palette is available online. You can explore our collections through our website and reach out directly for any product or order related assistance."
      },
      {
        question: "What fabrics do you use?",
        answer: "We work primarily with carefully sourced natural fabrics, including linen blends and pure cotton based blends. The exact fabric composition is specified on each product page."
      },
      {
        question: "Will every piece look exactly the same?",
        answer: "As our pieces feature intricate hand embroidery and/or screen print, slight variations in weave or print texture, together with subtle thread details where present, may occur. This is a characteristic element of our craft."
      },
      {
        question: "Are natural variations in the fabric considered defects?",
        answer: "No, slight variations in weave, texture and colour are inherent to natural fabrics and form part of their authentic character. These are not considered defects."
      }
    ]
  },
  {
    id: "orders-shipping",
    title: "ORDERS & SHIPPING",
    items: [
      {
        question: "How long will my order take to dispatch?",
        answer: "Most in-stock pieces are typically dispatched within 12-15 business days from the date of order confirmation. If additional time is required, we will reach out to you directly."
      },
      {
        question: "Do you offer shipping across India?",
        answer: "Yes! We offer complimentary shipping across India on all orders. Tracking details will be shared once your order has been dispatched."
      }
    ]
  },
  {
    id: "sizing-silhouettes",
    title: "SIZING & SILHOUETTES",
    items: [
      {
        question: "Can I choose a different silhouette for a design I like?",
        answer: "Yes. Selected Pause Palette illustrations can be adapted across our available silhouettes. You can explore the options under 'Custom Your Silhouette' on the product page."
      },
      {
        question: "Can I Choose a Women's Silhouette for a Men's Shirt?",
        answer: "Our men's and women's silhouettes are technically tailored specifically to standard men's and women's dimensions. Therefore, a standard may not change to seamlessly fit across both."
      },
      {
        question: "How do I choose my size?",
        answer: "Our garments generally feature a relaxed/fluid fit. If you are uncertain of a specific fit, you can refer to our size guide. If you are in between sizes, please refer to the Size Guide on the product page before ordering."
      }
    ]
  },
  {
    id: "care-returns-exchanges",
    title: "CARE, RETURNS & EXCHANGES",
    items: [
      {
        question: "How should I care for my Pause Palette piece?",
        answer: "Dry clean or hand wash separately in cold water with a mild detergent. Dry in the shade. Do not soak. Iron inside out on low to medium heat, avoiding direct contact with print and embroidery. Do not remove the part of the wash care tag."
      },
      {
        question: "Can I Exchange my piece for a different size?",
        answer: "Size exchanges are subject to availability and must be requested within 48 hours of delivery. The piece must remain unworn, unwashed and unused, with its original tags and packaging intact. Return and re-delivery shipping charges for size exchanges are borne by the customer.\n\nIn the rare event there is a manufacturing defect that may require a return/exchange, the same protocol mentioned above is to be followed."
      },
      {
        question: "What if I receive a damaged or defective piece?",
        answer: "Please contact us within 24 hours of delivery. An unboxing video showing the sealed package and the defect is required for verification. Once reviewed and approved, an appropriate resolution will be provided in accordance with our Return & Exchange policy."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 lg:px-24 pt-48 pb-32 max-w-7xl">
        <h1 className="font-sans text-3xl md:text-4xl text-gray-900 mb-16 text-center tracking-wide">FAQ'S</h1>
        
        <div className="flex flex-col md:flex-row gap-16 md:gap-24 relative">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-1/4 hidden md:block">
            <div className="sticky top-32">
              <ul className="space-y-4 text-[13px] tracking-[0.15em] text-gray-500 uppercase">
                {faqData.map((category) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => scrollToSection(category.id)}
                      className="hover:text-gray-900 transition-colors text-left"
                    >
                      {category.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {faqData.map((category) => (
              <div key={category.id} id={category.id} className="mb-16 scroll-mt-32">
                <h2 className="text-[13px] tracking-[0.15em] text-gray-500 uppercase mb-8">{category.title}</h2>
                
                <div className="flex flex-col">
                  {category.items.map((item, index) => {
                    const uniqueId = `${category.id}-${index}`;
                    const isOpen = openIndex === uniqueId;
                    
                    return (
                      <div key={uniqueId} className="border-b border-gray-200 py-6">
                        <button
                          onClick={() => toggleAccordion(uniqueId)}
                          className="w-full flex items-center justify-between text-left focus:outline-none group"
                        >
                          <h3 className="font-sans italic font-semibold text-lg text-gray-800 pr-8">{item.question}</h3>
                          <div className="text-gray-400 group-hover:text-gray-900 transition-colors shrink-0">
                            {isOpen ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
                          </div>
                        </button>
                        
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="font-sans italic text-[15px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
