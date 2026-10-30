import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  // Fetch collections from Prisma, including their products to get an image
  const collections = await prisma.collection.findMany({
    include: {
      products: {
        where: { isPublished: true },
        select: { images: true },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Use the dark text variant of the Navbar */}
      <Navbar variant="dark" />
      
      {/* Page Content */}
      <div className="pt-28 md:pt-36 pb-20 px-6 md:px-12 lg:px-20 container mx-auto w-full max-w-[1500px]">
        
        {/* Header Section */}
        <header className="mb-16 md:mb-20 flex flex-col items-center text-center">
          <h1 className="font-garamond text-3xl md:text-4xl text-gray-700 font-normal tracking-wide mb-3">
            Our Collections
          </h1>
          <p className="text-gray-400 text-[12px] md:text-[13px] tracking-widest font-sans uppercase mb-2">
            Two expressions. Many stories.
          </p>
          <p className="text-gray-500 text-[13px] md:text-[14px] font-garamond italic max-w-2xl mx-auto leading-relaxed">
            Our collections take form through print and embroidery. Original hand-drawn illustrations are brought to life through digital print on natural fabric blends or intricate embroidery on 100% linen.
          </p>
        </header>

        {/* Collections List */}
        {collections.length === 0 ? (
          <div className="text-center py-24 text-gray-400 italic font-garamond text-lg">
            No collections found in the archive.
          </div>
        ) : (
          <div className="space-y-20 md:space-y-32">
            {collections.map((collection: any) => {
              // Try to use the collection cover image first.
              let imageSrc = collection.coverImage;
              
              if (!imageSrc) {
                // Fallback 1: Hardcoded mock images
                if (collection.slug === "in-wild-bloom") imageSrc = "/images/in_wild_bloom.png";
                else if (collection.slug === "midnight-moss") imageSrc = "/images/midnight_moss.png";
                else if (collection.slug === "sage-and-soil") imageSrc = "/images/sage_and_soil.png";
                
                // Fallback 2: First product image
                else if (collection.products[0]?.images[0]) {
                  imageSrc = collection.products[0].images[0];
                }
                
                // Fallback 3: Generic Unsplash image
                else {
                  imageSrc = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop";
                }
              }

              return (
                <Link 
                  key={collection.id} 
                  href={`/collections/${collection.slug}`} 
                  className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 group cursor-pointer"
                >
                  {/* Left: Wider, commanding hero image */}
                  <div className="w-full md:w-[64%] lg:w-[68%] xl:w-[70%] relative overflow-hidden bg-gray-100 rounded-xs shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageSrc} 
                      alt={collection.name} 
                      className="w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] xl:h-[620px] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                    </div>
                  </div>

                  {/* Right: Harmoniously centered editorial text */}
                  <div className="w-full md:w-[36%] lg:w-[32%] xl:w-[30%] text-center md:text-left flex flex-col items-center md:items-start py-2 md:py-6">
                    <span className="text-[11px] md:text-[12px] tracking-[0.22em] text-[#4A7DAF] uppercase font-semibold font-sans mb-2">
                      Collection
                    </span>
                    <h2 className="font-garamond text-3xl sm:text-4xl lg:text-5xl text-gray-900 group-hover:text-gray-700 transition-colors mb-3 md:mb-4 leading-tight font-normal">
                      {collection.name}
                    </h2>
                    <p className="font-garamond text-[15px] md:text-[16px] lg:text-[17px] text-gray-500 leading-relaxed font-light mb-6">
                      {collection.description || "Explore this beautifully curated collection of hand-crafted pieces, designed to tell a unique story through fabric and illustration."}
                    </p>
                    <div className="inline-flex items-center gap-2 text-[11px] md:text-xs tracking-[0.2em] uppercase text-gray-900 group-hover:text-[#4A7DAF] transition-colors border-b border-gray-900/60 pb-1 group-hover:border-[#4A7DAF]">
                      <span>Discover Collection</span>
                      <span className="transition-transform group-hover:translate-x-1.5 duration-300">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
