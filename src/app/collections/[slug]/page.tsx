import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { notFound } from "next/navigation";

export default async function CollectionInnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch the specific collection and its published products
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          collection: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!collection) {
    notFound();
  }

  // Determine a hero image (fallback to first product image if available, else static placeholder)
  let heroImage = "https://images.unsplash.com/photo-1588661609156-f56191c0628e?q=80&w=1980&auto=format&fit=crop";
  if (collection.slug === "in-wild-bloom") heroImage = "https://images.unsplash.com/photo-1588661609156-f56191c0628e?q=80&w=1980&auto=format&fit=crop";
  else if (collection.products.length > 0 && collection.products[0].images.length > 0) {
    heroImage = collection.products[0].images[0];
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-16 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">
        
        {/* Collection Hero Section */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 mb-24">
          
          {/* Left: Image Carousel */}
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[4/5] relative w-full overflow-hidden bg-gray-100">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={heroImage} 
                 alt={collection.name}
                 className="object-cover w-full h-full"
               />
            </div>
          </div>

          {/* Right: Collection Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center py-4">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-800 mb-1">{collection.name}</h1>
            <p className="text-[11px] tracking-[0.1em] text-gray-500 uppercase mb-8">Collection</p>
            
            <p className="text-[13px] text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">
              {collection.description || "A beautiful collection of thoughtfully designed pieces."}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-gray-800 mb-8 border-b border-gray-200 pb-4">
            Pieces in this Collection
          </h2>
          
          {collection.products.length === 0 ? (
            <div className="py-12 text-gray-500 italic">No pieces found in this collection.</div>
          ) : (
            <ProductGrid products={collection.products} />
          )}
        </div>

      </div>
      
      <Footer />
    </main>
  );
}
