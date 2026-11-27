import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import JournalGridClient from "./JournalGridClient";
import BackButton from "@/components/BackButton";

export default async function MakingJournalPage() {
  const journals = await prisma.journal.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />

      <div className="pt-28 md:pt-32 pb-20 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">

        <div className="mb-4 pt-4">
          <BackButton fallbackHref="/" />
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 md:gap-8 relative">

          {/* Text Left */}
          <div className="md:w-[42%] flex flex-col z-10 pb-2 md:pb-6">
            <h1 className="font-garamond text-[14px] tracking-[0.1em] text-gray-500 uppercase font-medium mb-3">
              THE MAKING JOURNAL
            </h1>
            <p className="text-[15px] text-gray-500 leading-[1.8] mb-2">
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

        {/* Masonry / Ribbon Grid with Interactive Tabs */}
        <JournalGridClient journals={journals} />

        {/* Features / Icons Section */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8 pt-16 max-w-[1200px] mx-auto w-full">

          {/* Icon 1: Drawn by Hand */}
          <div className="flex flex-col items-center text-center px-1 sm:px-2 md:px-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
              <Image
                src="/images/pencil_icon.png"
                alt="Drawn by Hand"
                width={112}
                height={112}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
              />
            </div>
            <h3 className="font-garamond text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.06em] sm:tracking-[0.1em] md:tracking-[0.12em] text-gray-500 uppercase mb-1 sm:mb-2 font-medium">
              DRAWN BY HAND
            </h3>
            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-gray-400 leading-tight sm:leading-relaxed max-w-[200px]">
              Original illustrations, thoughtfully imagined.
            </p>
          </div>

          {/* Icon 2: Crafted with Intention */}
          <div className="flex flex-col items-center text-center px-1 sm:px-2 md:px-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
              <Image
                src="/images/needle.png"
                alt="Crafted with Intention"
                width={112}
                height={112}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
              />
            </div>
            <h3 className="font-garamond text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.06em] sm:tracking-[0.1em] md:tracking-[0.12em] text-gray-500 uppercase mb-1 sm:mb-2 font-medium">
              CRAFTED WITH INTENTION
            </h3>
            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-gray-400 leading-tight sm:leading-relaxed max-w-[200px]">
              Every detail, considered with purpose.
            </p>
          </div>

          {/* Icon 3: Naturally Chosen */}
          <div className="flex flex-col items-center text-center px-1 sm:px-2 md:px-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
              <Image
                src="/images/leaf_icon.png"
                alt="Naturally Chosen"
                width={112}
                height={112}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
              />
            </div>
            <h3 className="font-garamond text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.06em] sm:tracking-[0.1em] md:tracking-[0.12em] text-gray-500 uppercase mb-1 sm:mb-2 font-medium">
              NATURALLY CHOSEN
            </h3>
            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-gray-400 leading-tight sm:leading-relaxed max-w-[200px]">
              Natural fabrics, selected for feel and longevity.
            </p>
          </div>

          {/* Icon 4: Designed & Made in India */}
          <div className="flex flex-col items-center text-center px-1 sm:px-2 md:px-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
              <Image
                src="/images/home_icon_v2.png"
                alt="Designed & Made in India"
                width={116}
                height={116}
                className="w-[52px] h-[52px] sm:w-[68px] sm:h-[68px] md:w-[100px] md:h-[100px] lg:w-[116px] lg:h-[116px] object-contain"
              />
            </div>
            <h3 className="font-garamond text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.06em] sm:tracking-[0.1em] md:tracking-[0.12em] text-gray-500 uppercase mb-1 sm:mb-2 font-medium">
              DESIGNED & MADE IN INDIA
            </h3>
            <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-gray-400 leading-tight sm:leading-relaxed max-w-[200px]">
              Rooted in design, brought to life close to home.
            </p>
          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
