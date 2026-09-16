import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import LookbookGridClient from "./LookbookGridClient";

export default async function LookbookPage() {
  const lookbookItems = await prisma.lookbookItem.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-12 w-full">
        
        {/* Header Section */}
        <div className="text-center mb-12 px-6">
          <h1 className="font-serif text-[28px] tracking-[0.15em] text-gray-500 uppercase mb-6">
            LOOKBOOK
          </h1>
          <p className="italic font-bold text-gray-600 text-[16px] md:text-[17px] mb-2 leading-[1.6]">
            A visual study of Pause Palette, captured in its most expressive moments.
          </p>
          <p className="text-[15px] text-gray-500 leading-[1.8] max-w-3xl mx-auto mb-2">
            A curated collection of our pieces through light, texture, movement and setting — bringing together the frames that best reflect the mood, character and quiet beauty of each design.
          </p>
          <p className="text-[15px] text-gray-500 leading-[1.8]">
            Discover the piece behind every frame.
          </p>
        </div>

        {/* Dynamic Grid Section */}
        <div className="px-4 md:px-8 lg:px-16 max-w-[1400px] mx-auto">
          {lookbookItems.length === 0 ? (
            <div className="text-center py-24 text-gray-400 font-serif italic">
              New lookbook coming soon.
            </div>
          ) : (
            <LookbookGridClient items={lookbookItems} />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
