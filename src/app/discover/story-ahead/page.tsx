import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StoryAheadPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 gap-x-12 lg:gap-x-24 items-start">
          
          {/* --- Section 1: Canvas & Palette --- */}
          <div className="md:col-span-7 flex flex-col gap-12 lg:gap-16">
            
            <h1 className="font-garamond text-[18px] tracking-[0.15em] text-gray-500 uppercase font-medium">
              THE STORY AHEAD
            </h1>

            <div className="flex flex-col gap-4">
              <h2 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium">
                OUR FAVOURITE CANVAS
              </h2>
              <div className="text-[15px] text-gray-600 leading-[1.8] text-justify flex flex-col gap-5">
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
              <h2 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium">
                OUR PALETTE
              </h2>
              <div className="text-[15px] text-gray-600 leading-[1.8] text-justify flex flex-col gap-5">
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
          <div className="md:col-span-5 w-full aspect-[2/3] md:aspect-auto overflow-hidden bg-gray-50">
            <img 
              src="/images/stry_ahead1.png" 
              alt="The Story Ahead - Pause Palette" 
              className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" 
            />
          </div>

          {/* --- Section 2: Slower Way & Made to Order --- */}
          <div className="md:col-span-7 flex flex-col justify-center gap-16 lg:gap-24">
            
            <div className="flex flex-col gap-4">
              <h2 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium">
                A SLOWER WAY FORWARD
              </h2>
              <div className="text-[15px] text-gray-600 leading-[1.8] text-justify flex flex-col gap-5">
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
              <h2 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium">
                MADE TO ORDER
              </h2>
              <div className="text-[15px] text-gray-600 leading-[1.8] text-justify flex flex-col gap-5">
                <p>
                  We create primarily on a made-to-order basis, allowing each piece to begin with purpose rather than simply becoming part of excess.
                </p>
                <p>
                  This considered approach helps us produce more thoughtfully, minimise unnecessary quantities, and give every garment the time and attention it deserves. Made with someone in mind, not simply made to fill a rack.
                </p>
              </div>
            </div>

          </div>
          <div className="md:col-span-5 w-full aspect-[2/3] md:aspect-auto overflow-hidden bg-gray-50">
            <img 
              src="/images/stry_ahead2.png" 
              alt="A Slower Way Forward" 
              className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" 
            />
          </div>

          {/* --- Section 3: Packaging & Looking Ahead --- */}
          <div className="md:col-span-7 flex flex-col justify-center gap-16 lg:gap-24">
            
            <div className="flex flex-col gap-4">
              <h2 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium">
                THOUGHTFUL PACKAGING
              </h2>
              <div className="text-[15px] text-gray-600 leading-[1.8] text-justify flex flex-col gap-5">
                <p>
                  We extend the same sense of care beyond the garment itself, choosing packaging that is simple, purposeful and mindful of waste.
                </p>
                <p>
                  From recyclable mailers and wrapping to thank-you notes printed on seed paper that can be planted and grown, each detail is chosen with greater consideration for what comes after.
                </p>
                <p className="font-garamond italic text-[12px] text-gray-600">
                  A thoughtful ending to every order — and a small gesture towards a better tomorrow.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium">
                LOOKING AHEAD
              </h2>
              <div className="text-[15px] text-gray-600 leading-[1.8] text-justify flex flex-col gap-5">
                <p>
                  As Pause Palette grows, we hope to keep creating with greater thought — exploring new materials, colours and possibilities while staying true to the values that shape how we make.
                </p>
                <p className="font-garamond italic text-[12px] text-gray-600">
                  A slower, more considered future — one story at a time.
                </p>
              </div>
            </div>

          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-2 w-full">
            <div className="aspect-[2/3] w-full overflow-hidden bg-gray-50">
              <img 
                src="/images/stry_ahead3.png" 
                alt="Story Ahead Detail 1" 
                className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" 
              />
            </div>
            <div className="aspect-[2/3] w-full overflow-hidden bg-gray-50">
              <img 
                src="/images/stry_ahead4.png" 
                alt="Story Ahead Detail 2" 
                className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" 
              />
            </div>
            <div className="aspect-[2/3] w-full overflow-hidden bg-gray-50">
              <img 
                src="/images/stry_ahead5.png" 
                alt="Story Ahead Detail 3" 
                className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" 
              />
            </div>
            <div className="aspect-[2/3] w-full overflow-hidden bg-gray-50">
              <img 
                src="/images/stry_ahead6.png" 
                alt="Story Ahead Detail 4" 
                className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" 
              />
            </div>
          </div>

        </div>

        {/* Features / Icons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-16 md:pt-32 mt-16 md:mt-32 border-t border-gray-100 max-w-[1200px] mx-auto w-full">
          
          {/* Icon 1: Drawn by Hand */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
               <Image
                 src="/images/pencil_icon.png"
                 alt="Drawn by Hand"
                 width={96}
                 height={96}
                 className="w-16 h-16 md:w-20 md:h-20 object-contain"
               />
             </div>
             <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
               DRAWN BY HAND
             </h3>
             <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
               Original illustrations, thoughtfully imagined.
             </p>
          </div>

          {/* Icon 2: Crafted with Intention */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
               <Image
                 src="/images/needle.png"
                 alt="Crafted with Intention"
                 width={80}
                 height={80}
                 className="w-14 h-14 md:w-16 md:h-16 object-contain"
               />
             </div>
             <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
               CRAFTED WITH INTENTION
             </h3>
             <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
               Every detail, considered with purpose.
             </p>
          </div>

          {/* Icon 3: Naturally Chosen */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
               <Image
                 src="/images/leaf_icon.png"
                 alt="Naturally Chosen"
                 width={120}
                 height={120}
                 className="w-20 h-20 md:w-26 md:h-26 object-contain scale-125"
               />
             </div>
             <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
               NATURALLY CHOSEN
             </h3>
             <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
               Natural fabrics, selected for feel and longevity.
             </p>
          </div>

          {/* Icon 4: Designed & Made in India */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
               <Image
                 src="/images/home_icon.png"
                 alt="Designed & Made in India"
                 width={96}
                 height={96}
                 className="w-16 h-16 md:w-20 md:h-20 object-contain"
               />
             </div>
             <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
               DESIGNED & MADE IN INDIA
             </h3>
             <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
               Rooted in design, brought to life close to home.
             </p>
          </div>

        </div>

      </div>
      
      <Footer />
    </main>
  );
}
