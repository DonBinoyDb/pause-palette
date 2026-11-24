import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import CollectionCarousel from "@/components/CollectionCarousel";
import { notFound } from "next/navigation";

export default async function CollectionInnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch the specific collection and its published products from DB
  const collectionData = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          collection: { select: { name: true } }
        }
      }
    }
  });

  if (!collectionData) {
    notFound();
  }

  // Direct 1-to-1: collectionData.images is the single source of truth
  const collectionImages: string[] =
    Array.isArray(collectionData.images) && collectionData.images.length > 0
      ? collectionData.images.filter(
          (img: any) => typeof img === "string" && img.trim().length > 0
        )
      : collectionData.coverImage
      ? [collectionData.coverImage]
      : [];

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-24 md:pt-32 pb-8 md:pb-16 px-4 md:px-8 lg:px-16 w-full max-w-[1700px] mx-auto">
        
        {/* Collection Hero Section */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-20 mb-12 md:mb-24">
          
          {/* Left: Image Carousel */}
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[4/5] relative w-full overflow-hidden bg-gray-100 rounded-xs">
              <CollectionCarousel
                images={collectionImages}
                collectionName={collectionData.name}
                heightClass="w-full h-full"
              />
            </div>
          </div>

          {/* Right: Collection Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center py-0 md:py-4">
            <h1 className="font-garamond text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-1 md:mb-2 text-center md:text-left">{collectionData.name}</h1>
            <p className="text-[11px] md:text-[13px] tracking-[0.15em] text-gray-400 uppercase mb-4 md:mb-8 text-center md:text-left">Collection</p>
            
            <p className="text-[15px] md:text-[17px] text-gray-500 leading-relaxed mb-6 whitespace-pre-wrap text-center md:text-left">
              {collectionData.description || "A beautiful collection of thoughtfully designed pieces."}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8 md:mb-12">
          {collectionData.products.length === 0 ? (
            <div className="py-12 text-gray-500 italic text-center">No pieces found in this collection.</div>
          ) : (
            <ProductGrid products={collectionData.products} />
          )}
        </div>

      </div>
      
      <Footer />
    </main>
  );
}
