import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import { notFound } from "next/navigation";

export default async function CategoryInnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch the specific category and its published products from DB
  const categoryData = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          collection: { select: { name: true } },
          categories: { select: { name: true } }
        }
      }
    }
  });

  if (!categoryData) {
    notFound();
  }

  // Determine a hero image
  let heroImage = categoryData.coverImage;
  
  if (!heroImage) {
    if (categoryData.slug === "men") heroImage = "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1980&auto=format&fit=crop";
    else if (categoryData.slug === "women") heroImage = "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1980&auto=format&fit=crop";
    else if (categoryData.products.length > 0 && categoryData.products[0].images.length > 0) {
      heroImage = categoryData.products[0].images[0];
    } else {
      heroImage = "https://images.unsplash.com/photo-1588661609156-f56191c0628e?q=80&w=1980&auto=format&fit=crop";
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-24 md:pt-32 pb-8 md:pb-16 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">
        
        {/* Category Hero Section */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-20 mb-12 md:mb-24">
          
          {/* Left: Image Carousel */}
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[4/5] relative w-full overflow-hidden bg-gray-100">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={heroImage} 
                 alt={categoryData.name}
                 className="object-cover w-full h-full"
               />
            </div>
          </div>

          {/* Right: Category Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center py-0 md:py-4">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-1 md:mb-2 text-center md:text-left">{categoryData.name}</h1>
            <p className="text-[11px] md:text-[13px] tracking-[0.15em] text-gray-400 uppercase mb-4 md:mb-8 text-center md:text-left">Category</p>
            
            <p className="text-[15px] md:text-[17px] text-gray-500 leading-relaxed mb-6 whitespace-pre-wrap text-center md:text-left">
              {categoryData.description || `A beautiful collection of thoughtfully designed pieces for ${categoryData.name}.`}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8 md:mb-12">
          <h2 className="font-serif text-xl md:text-2xl text-gray-800 mb-6 md:mb-8 border-b border-gray-200 pb-2 md:pb-4 text-center md:text-left">
            Pieces in {categoryData.name}
          </h2>
          
          {categoryData.products.length === 0 ? (
            <div className="py-12 text-gray-500 italic">No pieces found in this category.</div>
          ) : (
            <ProductGrid products={categoryData.products} />
          )}
        </div>

      </div>
      
      <Footer />
    </main>
  );
}
