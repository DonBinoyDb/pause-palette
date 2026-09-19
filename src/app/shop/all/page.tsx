import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";

export default async function ShopAllPage() {
  // Fetch all published products from Prisma
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      collection: {
        select: { name: true }
      }
    }
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto">
        
        <header className="mb-16 flex flex-col items-center text-center">
          <h1 className="font-title text-4xl md:text-5xl text-gray-900 mb-4">All Pieces</h1>
          <p className="text-gray-500 italic max-w-md text-sm leading-relaxed">
            Thoughtfully designed, slowly crafted. Explore our complete archive of illustrated stories.
          </p>
        </header>

        {/* Filter / Sort Bar */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-12">
          <div className="flex gap-8 text-sm tracking-widest uppercase text-gray-500">
            <button suppressHydrationWarning className="text-gray-900 font-medium">All</button>
            <button suppressHydrationWarning className="hover:text-gray-900 transition-colors">Men</button>
            <button suppressHydrationWarning className="hover:text-gray-900 transition-colors">Women</button>
          </div>
          <button suppressHydrationWarning className="text-sm tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">
            Sort By +
          </button>
        </div>
        
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 italic">No pieces found in the archive yet.</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}

      </div>
      
      <Footer />
    </main>
  );
}
