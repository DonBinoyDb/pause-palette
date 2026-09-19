import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-12 lg:px-24 container mx-auto w-full">
        
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-20 mt-6 md:mt-10">
          <h1 className="font-serif text-3xl tracking-[0.1em] text-gray-500 uppercase mb-3">
            Our Collections
          </h1>
          <p className="font-serif italic text-gray-500 text-lg mb-6">
            Two expressions. Many stories.
          </p>
          <p className="text-[17px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Our collections take form through two distinct expressions — print and embroidery. Original hand-drawn illustrations are brought to life through digital print on natural fabric blends or intricate embroidery on 100% linen.
          </p>
        </div>

        {/* Collections List */}
        {collections.length === 0 ? (
          <div className="text-center py-20 text-gray-400 italic">
            No collections found in the archive.
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
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
                <Link key={collection.id} href={`/collections/${collection.slug}`} className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-16 group cursor-pointer">
                  <div className="w-full md:w-7/12 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageSrc} 
                      alt={collection.name} 
                      className="w-full h-[350px] md:h-[500px] object-cover bg-gray-100"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                    </div>
                  </div>
                  <div className="w-full md:w-5/12 pb-0 md:pb-12 text-center md:text-left">
                    <h2 className="font-serif text-3xl md:text-4xl text-gray-600 mb-2">{collection.name}</h2>
                    <p className="text-[13px] tracking-[0.1em] text-gray-400 uppercase mb-4">Collection</p>
                    <p className="text-[15px] md:text-[17px] text-gray-500 leading-relaxed">
                      {collection.description || "Explore this beautifully curated collection of hand-crafted pieces, designed to tell a unique story through fabric and illustration."}
                    </p>
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
