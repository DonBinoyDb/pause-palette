import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import ReviewIllustration, { ReviewType } from "@/components/ReviewIllustration";
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

      <div className="pt-28 md:pt-36 pb-20 px-6 md:px-12 lg:px-20 container mx-auto w-full max-w-[1500px]">
        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
          {/* Left Side: Writings & Reviews */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
            {/* Header Section (Left-aligned & slightly decreased font size) */}
            <div className="text-left mb-10">
              <h1 className="font-garamond text-[22px] tracking-[0.15em] text-gray-700 uppercase mb-3">
                Worn Stories
              </h1>
              <p className="font-garamond italic text-gray-600 text-[13px] mb-4">
                Your words, your moments, your Pause Palette.
              </p>
              <p className="text-[12px] text-gray-500 max-w-xl leading-relaxed">
                A collection of reflections from those who wear our pieces — the moments they carry, the memories they gather, and the ways each piece becomes part of their everyday.
                <br />
                <span className="italic">
                  Because a piece finds a new meaning once it becomes yours.
                </span>
              </p>
            </div>

            {/* Reviews Illustration Section */}
            <div className="mb-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full">
                {reviews.map((review: any, index: number) => (
                  <ReviewIllustration
                    key={review.id}
                    type={(index % 2 === 0 ? "girl" : "boy") as ReviewType}
                    photoUrl={review.imageUrl || ""}
                    text={review.reviewText}
                  />
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mb-10 text-gray-500 text-xs tracking-widest">
              <button suppressHydrationWarning className="hover:text-gray-800">
                {"<"}
              </button>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              </div>
              <button suppressHydrationWarning className="hover:text-gray-800">
                {">"}
              </button>
              <span className="ml-2 hover:text-gray-800 cursor-pointer underline underline-offset-4">
                ALL
              </span>
            </div>
          </div>

          {/* Right Side: Share Your Story Form */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col lg:pl-4 xl:pl-8 lg:border-l lg:border-gray-100">
            <ShareStoryForm />
          </div>
        </div>

        {/* Bottom Illustration Section */}
        <div className="flex justify-center mt-16 mb-4">
          <Image
            src="/images/add.png"
            alt="People sharing stories"
            width={600}
            height={400}
            className="object-contain w-full max-w-xl"
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
