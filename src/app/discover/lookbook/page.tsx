import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function LookbookPage() {
  const lookbookItems = await prisma.lookbookItem.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-12 w-full">
        
        {/* Header Section */}
        <div className="text-center mb-12 px-6">
          <h1 className="font-serif text-[28px] tracking-[0.15em] text-[#7B92A7] uppercase mb-6">
            LOOKBOOK
          </h1>
          <p className="font-serif italic text-gray-600 text-[15px] mb-2 font-medium">
            A visual study of Pause Palette, captured in its most expressive moments.
          </p>
          <p className="font-serif italic text-gray-500 text-[13px] max-w-2xl mx-auto mb-3">
            A curated collection of our pieces through light, texture, movement and setting — bringing together the frames that best reflect the mood, character and quiet beauty of each design.
          </p>
          <p className="font-serif italic text-gray-500 text-[13px]">
            Discover the piece behind every frame.
          </p>
        </div>

        {/* Dynamic Grid Section */}
        <div className="px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {lookbookItems.length === 0 ? (
            <div className="text-center py-24 text-gray-400 font-serif italic">
              New lookbook coming soon.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {lookbookItems.map((item) => (
                <div key={item.id} className="relative group break-inside-avoid overflow-hidden bg-gray-50">
                  {item.linkUrl ? (
                    <Link href={item.linkUrl} className="block relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.imageUrl} 
                        alt={item.title || "Lookbook Image"} 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                      {item.title && (
                        <div className="absolute bottom-5 right-5 z-10">
                          <span className="text-white/90 font-serif italic text-sm border-b border-white/50 pb-0.5 tracking-wide shadow-black drop-shadow-md">
                            {item.title}
                          </span>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="block relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.imageUrl} 
                        alt={item.title || "Lookbook Image"} 
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      {item.title && (
                        <div className="absolute bottom-5 right-5 z-10">
                          <span className="text-white/90 font-serif italic text-sm border-b border-white/50 pb-0.5 tracking-wide shadow-black drop-shadow-md">
                            {item.title}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
