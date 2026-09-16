import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import ReviewIllustration, { ReviewType } from "@/components/ReviewIllustration";
import { prisma } from "@/lib/prisma";

export default async function WornStoriesPage() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1600px]">
        
        {/* Header Section */}
        <div className="text-center mb-16 mt-4">
          <h1 className="font-serif text-2xl tracking-[0.15em] text-gray-700 uppercase mb-4">
            Worn Stories
          </h1>
          <p className="font-serif italic text-gray-600 text-sm mb-6">
            Your words, your moments, your Pause Palette.
          </p>
          <p className="text-[13px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A collection of reflections from those who wear our pieces — the moments they carry, the memories they gather, and the ways each piece becomes part of their everyday.<br/>
            <span className="italic">Because a piece finds a new meaning once it becomes yours.</span>
          </p>
        </div>

        {/* Reviews Illustration Section (Dynamic) */}
        <div className="mb-12 relative flex justify-center -mx-6 md:-mx-12 lg:-mx-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-[2000px] w-full mx-auto px-6 lg:px-12">
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
        <div className="flex items-center justify-center gap-4 mb-24 text-gray-500 text-xs tracking-widest">
          <button suppressHydrationWarning className="hover:text-gray-800">{'<'}</button>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
          </div>
          <button suppressHydrationWarning className="hover:text-gray-800">{'>'}</button>
          <span className="ml-2 hover:text-gray-800 cursor-pointer underline underline-offset-4">ALL</span>
        </div>

        {/* Share Your Story Section */}
        <div className="max-w-xl mx-auto text-center mb-16">
          <h2 className="font-serif text-sm tracking-[0.1em] text-gray-700 uppercase mb-4">
            Share Your Story
          </h2>
          <p className="font-serif italic text-gray-600 text-sm mb-4">
            Is a piece of Pause Palette already part of your story?
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed mb-8">
            Tell us how you wore it, where it went with you, or simply what you loved about it — and, if you wish, share a photograph from the moment.<br/><br/>
            Your story could become part of Worn Stories.
          </p>

          {/* Form */}
          <form className="flex flex-col gap-4 text-left">
            <input 
              suppressHydrationWarning
              type="text" 
              placeholder="Name" 
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400"
            />
            <input 
              suppressHydrationWarning
              type="email" 
              placeholder="Email" 
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400"
            />
            <input 
              suppressHydrationWarning
              type="text" 
              placeholder="Phone (optional)" 
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400"
            />
            
            {/* File Upload Input */}
            <div className="relative w-full">
              <input 
                type="file" 
                id="photo-upload" 
                className="hidden"
              />
              <label 
                htmlFor="photo-upload" 
                className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[13px] text-gray-400 flex justify-between items-center cursor-pointer hover:border-gray-400 italic"
              >
                <span>Upload Photo (optional)</span>
                <span className="text-gray-500">Choose file</span>
              </label>
            </div>

            <textarea 
              placeholder="Message" 
              rows={4}
              className="w-full border border-gray-300 rounded-sm px-4 py-3 text-[13px] text-gray-700 focus:outline-none focus:border-gray-400 italic placeholder:text-gray-400 resize-none mb-2"
            ></textarea>

            <button 
              suppressHydrationWarning
              type="button"
              className="w-full border border-[#8FB1D0] text-[#7A9BB9] font-serif italic py-2.5 rounded-sm hover:bg-[#F4F8FB] transition-colors text-sm"
            >
              Send your Story
            </button>
          </form>
        </div>

        {/* Bottom Illustration Section */}
        <div className="flex justify-center mt-12 mb-8">
           {/* The user specified to use /images/add.png for this illustration */}
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
