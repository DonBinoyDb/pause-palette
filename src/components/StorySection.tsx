import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StorySection() {
  return (
    <section className="bg-white py-16 md:py-32">
      <div className="w-full px-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          
          {/* Our Story */}
          <Link href="/discover/our-story" className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-10 group hover:opacity-80 transition-opacity">
            {/* Logo image replacing the coded illustration */}
            <div className="w-48 h-56 relative shrink-0 transition-transform duration-500 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/logo1.png" 
                alt="Pause Palette Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="pt-2 md:pt-8 flex flex-col items-center md:items-start">
              <h2 className="text-[13px] tracking-[0.2em] text-gray-500 uppercase mb-4 group-hover:text-gray-900 transition-colors">OUR STORY</h2>
              <p className="text-[17px] leading-relaxed text-gray-800 text-balance mb-6" style={{ fontFamily: "'EB Garamond', Garamond, serif" }}>
                Pause Palette began with a simple<br/>
                thought between two architects —<br/>
                what if our illustrations could live<br/>
                beyond our sketchbooks?
              </p>
              <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-500 group-hover:text-gray-900 transition-colors font-semibold">
                Explore <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </div>
          </Link>

          {/* The Making Journal */}
          <Link href="/discover/making-journal" className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-10 group hover:opacity-80 transition-opacity">
            {/* SVG Illustration */}
            <div className="w-64 h-64 relative shrink-0 transition-transform duration-500 group-hover:scale-105">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/art1.svg" 
                alt="Making Journal Illustration" 
                className="w-full h-full object-contain scale-[1.35]"
              />
            </div>
            
            <div className="pt-4 md:pt-20 flex flex-col items-center md:items-start">
              <h2 className="text-[13px] tracking-[0.2em] text-gray-500 uppercase mb-4 group-hover:text-gray-900 transition-colors">THE MAKING JOURNAL</h2>
              <p className="text-[17px] leading-relaxed text-gray-800 text-balance mb-6" style={{ fontFamily: "'EB Garamond', Garamond, serif" }}>
                A glimpse into the process behind<br/>
                every piece.
              </p>
              <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-500 group-hover:text-gray-900 transition-colors font-semibold">
                Read Journal <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
