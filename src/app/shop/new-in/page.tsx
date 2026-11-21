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
      
      <div className="pt-32 pb-24 px-4 md:px-8 lg:px-16 w-full max-w-[1700px] mx-auto">
        
        <header className="mb-14 flex flex-col items-center text-center">
          <h1 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase mb-3">
            New In
          </h1>
          <p className="text-[15px] md:text-[16.5px] font-garamond text-gray-600 text-center max-w-2xl mx-auto leading-relaxed">
            Our latest additions, crafted with intention. Discover the newest stories to join our collection.
          </p>
        </header>

        <NewInClient products={products} />

      </div>
      
      <Footer />
    </main>
  );
}
