import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import WornStoriesCarousel from "@/components/WornStoriesCarousel";
import ShareStoryForm from "@/components/ShareStoryForm";
import { prisma } from "@/lib/prisma";

export default async function WornStoriesPage() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />

      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1600px]">
        {/* Header Section */}
        <div className="text-center mb-16 mt-4">
          <h1 className="font-garamond text-2xl tracking-[0.15em] text-gray-700 uppercase mb-4">
            Worn Stories
          </h1>
          <p className="font-garamond italic text-gray-600 text-sm mb-6">
            Your words, your moments, your Pause Palette.
          </p>
          <p className="text-[13px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A collection of reflections from those who wear our pieces — the moments they carry, the memories they gather, and the ways each piece becomes part of their everyday.
            <br />
            <span className="italic">
              Because a piece finds a new meaning once it becomes yours.
            </span>
          </p>
        </div>

        {/* Dynamic Reviews Carousel with 3-at-a-time pagination */}
        <WornStoriesCarousel reviews={reviews} />

        {/* Share Your Story Section */}
        <ShareStoryForm />

        {/* Bottom Illustration Section */}
        <div className="flex justify-center mt-12 mb-8">
          <Image
            src="/images/add.png"
            alt="People sharing stories"
            width={600}
            height={400}
            className="object-contain w-full max-w-2xl"
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
