import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MakingJournalPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-24 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between mb-24 relative">
          
          {/* Text Left */}
          <div className="md:w-[45%] pt-24 md:pt-40 flex flex-col z-10">
            <h1 className="font-serif text-[18px] tracking-[0.1em] text-gray-500 uppercase mb-2">
              THE MAKING JOURNAL
            </h1>
            <p className="font-serif italic text-gray-700 font-bold text-[14px] mb-6">
              A journal of the stories, ideas and moments that shape Pause Palette.
            </p>
            <p className="text-[12px] text-gray-500 leading-relaxed mb-4 text-justify">
              From the things that inspire us and the stories behind our collections to sketches, experiments, making, shoots and moments along the way — a closer look into the world behind what we create.
            </p>
            <p className="text-[12px] text-gray-500 leading-relaxed text-justify">
              Some stories become pieces. Others simply become part of the journey.
            </p>
          </div>
          
          {/* Illustrations Right */}
          <div className="md:w-[50%] flex items-end justify-end gap-4 relative">
             <div className="w-[45%] flex justify-end pb-8">
               <img 
                 src="/images/artwork/boat.png" 
                 alt="Boat Illustration" 
                 className="w-full max-w-[300px] object-contain" 
               />
             </div>
             <div className="w-[50%] flex justify-end">
               <img 
                 src="/images/artwork/home.png" 
                 alt="Treehouse Illustration" 
                 className="w-full max-w-[340px] object-contain" 
               />
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 mb-6 text-[10px] tracking-[0.15em] font-serif uppercase">
           <button suppressHydrationWarning className="text-gray-400 hover:text-gray-800 transition-colors pb-1">VIDEOS</button>
           <button suppressHydrationWarning className="text-[#8FB1D0] border-b border-[#8FB1D0] pb-1">PHOTOS</button>
           <button suppressHydrationWarning className="text-gray-400 hover:text-gray-800 transition-colors pb-1">ALL</button>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
             <img 
               src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=600&h=1200&q=80" 
               alt="Embroidery hoop" 
               className="w-full h-auto aspect-[1/2] object-cover grayscale opacity-90 transition-opacity hover:opacity-100" 
             />
             <p className="text-[10px] text-gray-400 leading-relaxed text-justify break-all">
               asdwghfherghrghtijkjcdjvnjrjvnkjvnkbvngfbngbg-bghnbntnnynyjmujmukjmukjmukjm,uk,ki,ki,k,tyjyjy
             </p>
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col gap-3">
             <img 
               src="https://images.unsplash.com/photo-1584277261846-c6a1672ec512?auto=format&fit=crop&w=600&h=1200&q=80" 
               alt="Fabric swatches and sketches" 
               className="w-full h-auto aspect-[1/2] object-cover opacity-90 transition-opacity hover:opacity-100" 
             />
             <p className="text-[10px] text-gray-400 leading-relaxed text-justify break-all">
               asdwghfherghrghtijkjcdjvnjrjvnkjvnkbvngfbngbg-bghnbntnnynyjmujmukjmukjmukjm,uk,ki,ki,k,tyjyjy
             </p>
          </div>
          
          {/* Column 3 */}
          <div className="flex flex-col gap-3">
             <img 
               src="https://images.unsplash.com/photo-1628185038318-7b960c1d2cc3?auto=format&fit=crop&w=600&h=1200&q=80" 
               alt="Colorful thread spools" 
               className="w-full h-auto aspect-[1/2] object-cover opacity-90 transition-opacity hover:opacity-100" 
             />
             <p className="text-[10px] text-gray-400 leading-relaxed text-justify break-all">
               asdwghfherghrghtijkjcdjvnjrjvnkjvnkbvngfbngbg-bghnbntnnynyjmujmukjmukjmukjm,uk,ki,ki,k,tyjyjy
             </p>
          </div>

        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-3 mb-24 text-gray-400 text-xs">
          <button suppressHydrationWarning className="hover:text-gray-800 transition-colors">{'<'}</button>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
          </div>
          <button suppressHydrationWarning className="hover:text-gray-800 transition-colors">{'>'}</button>
        </div>

        {/* Features / Icons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-[1200px] mx-auto">
          
          {/* Icon 1: Drawn by Hand */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                 <path d="m15 5 4 4"></path>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               DRAWN BY HAND
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Original illustrations, thoughtfully imagined.
             </p>
          </div>

          {/* Icon 2: Crafted with Intention */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M14.5 2 4 22"></path>
                 <path d="M14.5 2c0 0 4-1 6 3s-3 6-5 6c-3 0-5 3-4 6s5 6 9 3"></path>
                 <line x1="13.5" y1="4" x2="15.5" y2="4"></line>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               CRAFTED WITH INTENTION
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Every detail, considered with purpose.
             </p>
          </div>

          {/* Icon 3: Naturally Chosen */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                 <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               NATURALLY CHOSEN
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Natural fabrics, selected for feel and longevity.
             </p>
          </div>

          {/* Icon 4: Designed & Made in India */}
          <div className="flex flex-col items-center text-center px-4">
             <div className="w-14 h-14 mb-4 text-gray-700">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                 <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                 <polyline points="9 22 9 12 15 12 15 22"></polyline>
               </svg>
             </div>
             <h3 className="font-serif text-[9px] tracking-[0.1em] text-gray-500 uppercase mb-2 font-medium">
               DESIGNED & MADE IN INDIA
             </h3>
             <p className="text-[10px] text-gray-400 leading-relaxed max-w-[160px]">
               Rooted in design, brought to life close to home.
             </p>
          </div>

        </div>

      </div>
      
      <Footer />
    </main>
  );
}
