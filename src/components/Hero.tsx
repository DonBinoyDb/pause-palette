"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const mediaItems = [
  { type: 'image', src: '/images/cover.jpeg' },
  { type: 'image', src: '/images/Coverpic1.jpeg' },
  { type: 'image', src: '/images/coverpic2.jpg' },
  { type: 'video', src: '/images/cover-video.av1.mp4' },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  useEffect(() => {
    // If it's a video, don't set a timer. The onEnded event will trigger nextSlide.
    if (mediaItems[currentIndex].type === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    const timer = setInterval(nextSlide, 6000); // 6 seconds per image slide
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <section className="relative h-[90vh] min-h-[700px] w-full flex items-end pb-12 overflow-hidden">
      {/* Background media */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30 z-10" />
        
        {mediaItems.map((item, index) => (
          <div 
            key={item.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          >
            {item.type === 'video' ? (
              <video 
                ref={videoRef}
                src={item.src}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                onEnded={nextSlide}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={item.src} 
                alt="Cover image"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-20 text-white px-12 md:px-24">
        <h1 className="text-[2.5rem] md:text-[3.5rem] leading-[1.1] font-sans mb-1">
          illustrated stories<br/>
          for slow living.
        </h1>
        
        <p className="text-base md:text-lg font-sans font-light max-w-2xl mb-3 tracking-wide leading-relaxed">
          Thoughtfully designed pieces that carry<br/>
          art, colour and character.
        </p>
        
        <div className="flex flex-col gap-6">
          <Link 
            href="/collections" 
            className="text-base md:text-lg font-sans tracking-widest uppercase hover:opacity-80 transition-opacity w-fit"
          >
            EXPLORE COLLECTIONS
          </Link>
          
          {/* Pagination dots */}
          <div className="flex gap-3 mt-4">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                suppressHydrationWarning
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
