import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import NewInClient from "./NewInClient";

export default async function NewInPage() {
  // Fetch the latest published products from Prisma (e.g., newest 12)
  const products = await prisma.product.findMany({
    where: { isPublished: true, isNew: true },
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
          <h1 className="font-garamond text-2xl md:text-3xl text-gray-500 font-normal tracking-wide mb-3">
            New In
          </h1>
          <p className="text-gray-400 text-[12px] md:text-[13px] tracking-wide font-sans">
            Our latest additions, crafted with intention. Discover the newest stories to join our collection.
          </p>
        </header>

        <NewInClient products={products} />

      </div>
      
      <Footer />
    </main>
  );
}
