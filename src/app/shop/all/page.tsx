import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ShopAllClient from "./ShopAllClient";

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
        
        <header className="mb-14 flex flex-col items-center text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-gray-500 font-normal tracking-wide mb-3">
            All Pieces
          </h1>
          <p className="text-gray-400 text-[12px] md:text-[13px] tracking-wide font-sans">
            Thoughtfully designed, slowly crafted. Explore our complete archive of illustrated stories.
          </p>
        </header>

        <ShopAllClient products={products} />

      </div>
      
      <Footer />
    </main>
  );
}
