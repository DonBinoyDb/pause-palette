import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WornStoriesLayout from "@/components/WornStoriesLayout";
import BackButton from "@/components/BackButton";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WornStoriesPage() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />

      {/* Main Container */}
      <div className="pt-28 md:pt-36 pb-24 px-4 md:px-8 lg:px-16 w-full max-w-[1700px] mx-auto">
        
        <div className="mb-4 md:mb-6">
          <BackButton fallbackHref="/" />
        </div>

        {/* Header Section */}
        <header className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
          <h1 className="font-garamond text-[14px] text-gray-500 font-medium tracking-[0.1em] uppercase mb-3">
            Worn Stories
          </h1>
          <p className="font-garamond italic text-gray-600 text-sm md:text-[15px] mb-2 leading-relaxed">
            Your words, your moments, your Pause Palette.
          </p>
          <p className="font-garamond text-[13px] text-gray-500 leading-relaxed max-w-xl mx-auto">
            A collection of reflections from those who wear our pieces — the moments they carry, the memories they gather, and the ways each piece becomes part of their everyday.
          </p>
        </header>

        {/* 2-Column Layout: Reviews on the Left, Share Story Form on the Right */}
        <WornStoriesLayout reviews={reviews} />

      </div>

      <Footer />
    </main>
  );
}
