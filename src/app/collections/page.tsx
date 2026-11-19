import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CollectionCarousel from "@/components/CollectionCarousel";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-28 md:pt-36 pb-20 px-4 md:px-8 lg:px-16 w-full">
        <header className="mb-16 md:mb-20 flex flex-col items-center text-center">
          <h1 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase mb-3">
            Collections
          </h1>
          <p className="text-gray-400 text-[12px] md:text-[13px] tracking-widest font-sans uppercase mb-2">
            Two expressions. Many stories.
          </p>
          <p className="text-gray-600 text-[14px] md:text-[15px] font-garamond max-w-2xl mx-auto leading-[1.8]">
            Our collections take form through print and embroidery. Original hand-drawn illustrations are brought to life through digital print on natural fabric blends or intricate embroidery on 100% linen.
          </p>
        </header>

        {collections.length === 0 ? (
          <div className="text-center py-24 text-gray-400 italic font-garamond text-lg">
            No collections found in the archive.
          </div>
        ) : (
          <div className="space-y-20 md:space-y-32">
            {collections.map((collection: any) => {
              // Direct 1-to-1: collection.images is the single source of truth
              const collectionImages: string[] =
                Array.isArray(collection.images) && collection.images.length > 0
                  ? collection.images.filter(
                      (img: any) => typeof img === "string" && img.trim().length > 0
                    )
                  : collection.coverImage
                  ? [collection.coverImage]
                  : [];

              return (
                <div 
                  key={collection.id} 
                  className="flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 xl:gap-20 group"
                >
                  {/* Left: Hero carousel showing exact collection images */}
                  <div className="w-full md:w-[64%] lg:w-[68%] xl:w-[70%] relative overflow-hidden bg-gray-100 rounded-xs shadow-xs">
                    <CollectionCarousel
                      images={collectionImages}
                      collectionName={collection.name}
                      linkHref={`/collections/${collection.slug}`}
                    />
                  </div>

                  {/* Right: Harmoniously centered editorial text */}
                  <Link 
                    href={`/collections/${collection.slug}`} 
                    className="w-full md:w-[36%] lg:w-[32%] xl:w-[30%] text-center md:text-left flex flex-col items-center md:items-start py-2 md:py-6 cursor-pointer"
                  >
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
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
