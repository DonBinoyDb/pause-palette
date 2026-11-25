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
      },
      categories: {
        select: { id: true, name: true, slug: true }
      }
    }
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-4 md:px-8 lg:px-16 w-full max-w-[1700px] mx-auto">
        
        <header className="mb-10 md:mb-14 flex flex-col items-center text-center">
          <h1 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase">
            All Pieces
          </h1>
        </header>

        <ShopAllClient products={products} />

      </div>
      
      <Footer />
    </main>
  );
}
