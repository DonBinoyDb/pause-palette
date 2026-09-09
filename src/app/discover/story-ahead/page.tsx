import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StoryAheadPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">
        
        <h1 className="font-serif text-[16px] tracking-[0.1em] text-gray-500 uppercase mb-16">
          THE STORY AHEAD
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 gap-x-12 lg:gap-x-24">
          
          {/* --- Section 1: Canvas & Palette --- */}
          <div className="md:col-span-7 flex flex-col justify-center gap-16 lg:gap-24">
            
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
                OUR FAVOURITE CANVAS
              </h2>
              <div className="text-[11.5px] text-gray-500 leading-[1.8] text-justify flex flex-col gap-4">
                <p>
                  Linen sits at the heart of Pause Palette, alongside other thoughtfully chosen natural fabrics.
                </p>
                <p>
                  Breathable, resilient and naturally comfortable against the skin, linen is valued for its enduring beauty, lighter environmental footprint and the way it softens beautifully with time.
                </p>
                <p>
                  We choose materials not only for how they look, but for how they feel, how they age, and how thoughtfully they live with you — creating with care today, for a better tomorrow.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
                OUR PALETTE
              </h2>
              <div className="text-[11.5px] text-gray-500 leading-[1.8] text-justify flex flex-col gap-4">
                <p>
                  Our palette is shaped less by what is familiar, and more by what feels distinctive.
                </p>
                <p>
                  We are drawn to unexpected shades, subtle contrasts and expressive combinations that give each collection a character of its own.
                </p>
                <p>
                  For us, colour is more than a finishing detail — it is part of the story, chosen to make each piece feel considered, memorable and distinctly Pause Palette.
                </p>
              </div>
            </div>

          </div>
          <div className="md:col-span-5">
            <img 
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&h=1200&q=80" 
              alt="Color swatches and fabrics" 
              className="w-full h-auto object-cover opacity-90 transition-opacity hover:opacity-100" 
            />
          </div>

          {/* --- Section 2: Slower Way & Made to Order --- */}
          <div className="md:col-span-7 flex flex-col justify-center gap-16 lg:gap-24">
            
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
                A SLOWER WAY FORWARD
              </h2>
              <div className="text-[11.5px] text-gray-500 leading-[1.8] text-justify flex flex-col gap-4">
                <p>
                  We believe growth is most meaningful when it is considered.
                </p>
                <p>
                  By creating primarily to order, we choose quality over quantity, intention over excess, and progress with purpose — allowing us to grow without losing sight of how and why we make.
                </p>
                <p>
                  For us, moving forward is not about making more, but about making better, with greater thought for what comes next.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
                MADE TO ORDER
              </h2>
              <div className="text-[11.5px] text-gray-500 leading-[1.8] text-justify flex flex-col gap-4">
                <p>
                  We create primarily on a made-to-order basis, allowing each piece to begin with purpose rather than simply becoming part of excess.
                </p>
                <p>
                  This considered approach helps us produce more thoughtfully, minimise unnecessary quantities, and give every garment the time and attention it deserves. Made with someone in mind, not simply made to fill a rack.
                </p>
              </div>
            </div>

          </div>
          <div className="md:col-span-5">
            <img 
              src="https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=800&h=1200&q=80" 
              alt="Shirts hanging on line" 
              className="w-full h-auto object-cover opacity-90 transition-opacity hover:opacity-100" 
            />
          </div>

          {/* --- Section 3: Packaging & Looking Ahead --- */}
          <div className="md:col-span-7 flex flex-col justify-center gap-16 lg:gap-24">
            
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
                THOUGHTFUL PACKAGING
              </h2>
              <div className="text-[11.5px] text-gray-500 leading-[1.8] text-justify flex flex-col gap-4">
                <p>
                  We extend the same sense of care beyond the garment itself, choosing packaging that is simple, purposeful and mindful of waste.
                </p>
                <p>
                  From recyclable mailers and wrapping to thank-you notes printed on seed paper that can be planted and grown, each detail is chosen with greater consideration for what comes after.
                </p>
                <p className="font-serif italic text-[12px] text-gray-600">
                  A thoughtful ending to every order — and a small gesture towards a better tomorrow.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-[11px] tracking-[0.15em] text-gray-500 uppercase font-medium">
                LOOKING AHEAD
              </h2>
              <div className="text-[11.5px] text-gray-500 leading-[1.8] text-justify flex flex-col gap-4">
                <p>
                  As Pause Palette grows, we hope to keep creating with greater thought — exploring new materials, colours and possibilities while staying true to the values that shape how we make.
                </p>
                <p className="font-serif italic text-[12px] text-gray-600">
                  A slower, more considered future — one story at a time.
                </p>
              </div>
            </div>

          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-2">
            <img 
              src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&h=600&q=80" 
              alt="Folded shirts in packaging" 
              className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100 aspect-[2/3]" 
            />
            <img 
              src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=400&h=600&q=80" 
              alt="Packaging material" 
              className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100 aspect-[2/3]" 
            />
            <img 
              src="https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&h=600&q=80" 
              alt="Stacked mailers" 
              className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100 aspect-[2/3]" 
            />
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=600&q=80" 
              alt="Paper bag packaging" 
              className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100 aspect-[2/3]" 
            />
          </div>

        </div>

        {/* Features / Icons Section (Reused from Making Journal) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-32 mt-32 border-t border-gray-100/60 max-w-[1200px] mx-auto">
          
          {/* Icon 1: Drawn by Hand */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                 <path d="m15 5 4 4"></path>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               DRAWN BY HAND
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Original illustrations, thoughtfully imagined.
             </p>
          </div>

          {/* Icon 2: Crafted with Intention */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M14.5 2 4 22"></path>
                 <path d="M14.5 2c0 0 4-1 6 3s-3 6-5 6c-3 0-5 3-4 6s5 6 9 3"></path>
                 <line x1="13.5" y1="4" x2="15.5" y2="4"></line>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               CRAFTED WITH INTENTION
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Every detail, considered with purpose.
             </p>
          </div>

          {/* Icon 3: Naturally Chosen */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                 <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               NATURALLY CHOSEN
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Natural fabrics, selected for feel and longevity.
             </p>
          </div>

          {/* Icon 4: Designed & Made in India */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                 <polyline points="9 22 9 12 15 12 15 22"></polyline>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               DESIGNED & MADE IN INDIA
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Rooted in design, brought to life close to home.
             </p>
          </div>

        </div>

      </div>
      
      <Footer />
    </main>
  );
}
