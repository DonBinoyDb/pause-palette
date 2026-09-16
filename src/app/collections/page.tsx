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
      <div className="pt-32 pb-16 px-12 md:px-24 container mx-auto w-full">
        
        {/* Header Section */}
        <div className="text-center mb-20 mt-10">
          <h1 className="font-serif text-[22px] tracking-[0.1em] text-gray-500 uppercase mb-3">
            Our Collections
          </h1>
          <p className="font-serif italic text-gray-500 text-sm mb-6">
            Two expressions. Many stories.
          </p>
          <p className="text-[13px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Our collections take form through two distinct expressions — print and embroidery. Original hand-drawn illustrations are brought to life through digital print on natural fabric blends or intricate embroidery on 100% linen.
          </p>
        </div>

        {/* Collections List */}
        {collections.length === 0 ? (
          <div className="text-center py-20 text-gray-400 italic">
            No collections found in the archive.
          </div>
        ) : (
          <div className="space-y-24">
            {collections.map((collection: any) => {
              // Try to get a static image if it matches the mock, otherwise use the first product image, or a fallback.
              let imageSrc = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop";
              if (collection.slug === "in-wild-bloom") imageSrc = "/images/in_wild_bloom.png";
              if (collection.slug === "midnight-moss") imageSrc = "/images/midnight_moss.png";
              if (collection.slug === "sage-and-soil") imageSrc = "/images/sage_and_soil.png";
              
              if (imageSrc.startsWith("http") && collection.products[0]?.images[0]) {
                imageSrc = collection.products[0].images[0];
              }

              return (
                <Link key={collection.id} href={`/collections/${collection.slug}`} className="flex flex-col md:flex-row items-end gap-12 md:gap-16 group cursor-pointer">
                  <div className="w-full md:w-7/12 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imageSrc} 
                      alt={collection.name} 
                      className="w-full h-[500px] object-cover bg-gray-100"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                    </div>
                  </div>
                  <div className="w-full md:w-5/12 pb-12">
                    <h2 className="font-serif text-2xl text-gray-600 mb-1">{collection.name}</h2>
                    <p className="text-[11px] tracking-[0.1em] text-gray-400 uppercase mb-4">Collection</p>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
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
