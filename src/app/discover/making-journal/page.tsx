import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import JournalGridClient from "./JournalGridClient";

export default async function MakingJournalPage() {
  const journals = await prisma.journal.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />

      <div className="pt-24 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between mb-8 relative">

          {/* Text Left */}
          <div className="md:w-[42%] pt-32 md:pt-56 flex flex-col z-10">
            <h1 className="font-garamond text-[18px] tracking-[0.1em] text-gray-500 uppercase mb-1">
              THE MAKING JOURNAL
            </h1>
            <p className="italic font-bold text-gray-600 text-[16px] md:text-[17px] mb-2 leading-[1.6]">
              A journal of the stories, ideas and moments that shape Pause Palette.
            </p>
            <p className="text-[15px] text-gray-500 leading-[1.8] mb-2">
              From the things that inspire us and the stories behind our collections to sketches, experiments, making, shoots and moments along the way — a closer look into the world behind what we create.
            </p>
            <p className="text-[15px] text-gray-500 leading-[1.8]">
              Some stories become pieces. Others simply become part of the journey.
            </p>
          </div>

          {/* Illustrations Right */}
          <div className="md:w-[58%] flex items-end justify-end gap-2 relative">
            <div className="w-[48%] flex justify-end pb-8">
              <img
                src="/images/artwork/boat.png"
                alt="Boat Illustration"
                className="w-full max-w-[450px] object-contain"
              />
            </div>
            <div className="w-[52%] flex justify-end">
              <img
                src="/images/artwork/home.png"
                alt="Treehouse Illustration"
                className="w-full max-w-[500px] object-contain"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-12 mb-12 text-[13px] tracking-[0.05em] font-serif uppercase">
          <button suppressHydrationWarning className="text-gray-500 border-b border-gray-400 pb-0.5 hover:text-gray-800 transition-colors">Videos</button>
          <button suppressHydrationWarning className="text-[#8FB1D0] border-b border-[#8FB1D0] pb-0.5">Photos</button>
          <button suppressHydrationWarning className="text-gray-500 border-b border-gray-400 pb-0.5 hover:text-gray-800 transition-colors">All</button>
        </div>

        {/* Masonry Grid with Pagination */}
        <JournalGridClient journals={journals} />

        {/* Features / Icons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-[1200px] mx-auto">

          {/* Icon 1: Drawn by Hand */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
              <Image
                src="/images/pencil_icon.png"
                alt="Drawn by Hand"
                width={96}
                height={96}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
            <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
              DRAWN BY HAND
            </h3>
            <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
              Original illustrations, thoughtfully imagined.
            </p>
          </div>

          {/* Icon 2: Crafted with Intention */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
              <Image
                src="/images/needle.png"
                alt="Crafted with Intention"
                width={80}
                height={80}
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
              CRAFTED WITH INTENTION
            </h3>
            <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
              Every detail, considered with purpose.
            </p>
          </div>

          {/* Icon 3: Naturally Chosen */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
              <Image
                src="/images/leaf_icon.png"
                alt="Naturally Chosen"
                width={120}
                height={120}
                className="w-20 h-20 md:w-26 md:h-26 object-contain scale-125"
              />
            </div>
            <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
              NATURALLY CHOSEN
            </h3>
            <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
              Natural fabrics, selected for feel and longevity.
            </p>
          </div>

          {/* Icon 4: Designed & Made in India */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 mb-4 flex items-center justify-center">
              <Image
                src="/images/home_icon.png"
                alt="Designed & Made in India"
                width={96}
                height={96}
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
            <h3 className="font-garamond text-[10px] md:text-[11px] tracking-[0.12em] text-gray-500 uppercase mb-2 font-medium">
              DESIGNED & MADE IN INDIA
            </h3>
            <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed max-w-[200px]">
              Rooted in design, brought to life close to home.
            </p>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
