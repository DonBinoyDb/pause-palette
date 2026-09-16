import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OurStoryPage() {
  return (
    <>
      <Navbar variant="dark" />
      <div className="min-h-screen bg-white pt-24 pb-0">
        {/* 2-Column Grid Layout */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-24">
              
              {/* Logo Illustration */}
              <div className="w-full flex justify-center lg:justify-end pr-12 lg:pr-24 lg:pt-12">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/images/logo1.png"
                    alt="Pause Palette Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* BEYOND THE SKETCHBOOK Text */}
              <div className="space-y-5 text-gray-500 text-[14px] leading-[1.8] lg:pr-12">
                <h2 className="font-serif text-[#8c8c8c] text-[13px] font-semibold uppercase tracking-[0.15em] mb-8">
                  BEYOND THE SKETCHBOOK
                </h2>
                <p>
                  Every Pause Palette collection begins as an original hand-drawn illustration 
                  — inspired by small observations, fleeting feelings, nature, architecture, 
                  travel, and the details we pause to notice.
                </p>
                <p>
                  Through thoughtfully considered print and embroidery, these illustrations 
                  move from paper to fabric, taking on a new form while preserving the 
                  story from which they began.
                </p>
              </div>

              {/* THE ART OF MAKING Text */}
              <div className="space-y-5 text-gray-500 text-[14px] leading-[1.8] lg:pr-12 pt-12">
                <h2 className="font-serif text-[#8c8c8c] text-[13px] font-semibold uppercase tracking-[0.15em] mb-8">
                  THE ART OF MAKING
                </h2>
                <p>We believe beautiful things do not need to be hurried.</p>
                <p>
                  Working primarily with natural linen, we explore texture, colour, stitch and 
                  silhouette with intention, allowing each piece to take shape at its own con
                  sidered pace.
                </p>
                <p>
                  Created primarily on a made-to-order basis, our approach values craftsman
                  ship over speed, quality over quantity, and intention over excess.
                </p>
                <p>
                  The result is clothing made not for a passing moment, but to be worn 
                  often, cherished deeply, and made part of your own story.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-16">
              
              {/* OUR STORY Text */}
              <div className="space-y-5 text-gray-500 text-[14px] leading-[1.8] pt-4">
                <h1 className="font-serif text-[#8c8c8c] text-[16px] font-semibold uppercase tracking-[0.2em] mb-8">
                  OUR STORY
                </h1>
                
                <h2 className="font-serif text-[#8c8c8c] text-[13px] font-semibold uppercase tracking-[0.15em] mb-4">
                  FROM OUR SKETCHBOOK TO YOUR SOUL
                </h2>
                <p>
                  Pause Palette began with two architects, a shared love for illustration, and a thought 
                  that stayed with us:
                </p>
                <p className="italic font-medium text-gray-700 py-1">
                  What if our little illustrations could live beyond our sketchbooks?
                </p>
                <p>
                  That thought opened a new creative world within our design studio, Pause — one 
                  where the things we notice, draw and imagine could leave the page and find a 
                  new canvas in fabric.
                </p>
                <p>
                  What began as a playful idea gradually became Pause Palette, creating thoughtful, 
                  expressive pieces designed to be worn, treasured and made part of your everyday.
                </p>
              </div>

              {/* Reading Image */}
              <div className="w-full aspect-[4/3] relative mt-4">
                <Image 
                  src="/images/coverpic2.jpg" 
                  alt="Person reading" 
                  fill 
                  className="object-cover" 
                />
              </div>

              {/* Embroidered Shirt Image */}
              <div className="w-full aspect-[4/3] relative">
                <Image 
                  src="/images/add.png" 
                  alt="Embroidered shirt details" 
                  fill 
                  className="object-cover" 
                />
              </div>

            </div>
          </div>
        </div>

        {/* AN OPEN CANVAS Section */}
        <div className="max-w-4xl mx-auto text-center space-y-5 text-gray-500 text-[14px] leading-[1.8] py-32 px-6">
          <h2 className="font-serif text-[#8c8c8c] text-[13px] font-semibold uppercase tracking-[0.15em] mb-6">
            AN OPEN CANVAS
          </h2>
          <p>
            Pause Palette may begin with clothing, but its creative world is not limited by it.
          </p>
          <p>
            As the brand evolves, our illustrations may find expression through new colours, forms and objects — each becoming another way to carry the spirit of Pause Palette forward. The canvas may change. <span className="italic font-medium text-gray-700">The stories will continue.</span>
          </p>
        </div>

        {/* Full Width Footer Image */}
        <div className="w-full h-[70vh] min-h-[500px] relative">
          <Image 
            src="/images/Coverpic1.jpeg" 
            alt="Shirts on a clothesline outdoors" 
            fill 
            className="object-cover object-center" 
          />
        </div>

      </div>
      <Footer />
    </>
  );
}
