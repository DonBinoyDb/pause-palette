"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const DEFAULT_MEDIA_ITEMS = [
  { type: "image" as const, src: "/images/cover.jpeg" },
  { type: "image" as const, src: "/images/Coverpic1.jpeg" },
  { type: "image" as const, src: "/images/coverpic2.jpg" },
  { type: "video" as const, src: "/images/cover-video.av1.mp4" },
];

export interface HeroProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    mediaItems?: Array<{ type: "image" | "video"; src: string }>;
  };
}

export default function Hero({ initialData }: HeroProps) {
  const mediaItems =
    Array.isArray(initialData?.mediaItems) && initialData.mediaItems.length > 0
      ? initialData.mediaItems
      : DEFAULT_MEDIA_ITEMS;

  const title = initialData?.title || "illustrated stories\nfor slow living.";
  const subtitle =
    initialData?.subtitle || "Thoughtfully designed pieces that carry\nart, colour and character.";
  const buttonText = initialData?.buttonText || "EXPLORE COLLECTIONS";
  const buttonLink = initialData?.buttonLink || "/collections";

  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  useEffect(() => {
    const currentItem = mediaItems[currentIndex];
    if (!currentItem) return;

    // If it's a video, let onEnded handle the transition
    if (currentItem.type === "video") {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    const timer = setInterval(nextSlide, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [currentIndex, mediaItems]);

  return (
    <section 
      className="relative w-full h-screen min-h-screen min-h-[100dvh] h-[100dvh] shrink-0 flex items-end pb-12 md:pb-16 overflow-hidden"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      {/* Background media */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30 z-10" />
        
        {mediaItems.map((item, index) => (
          <div 
            key={`${item.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          >
            {item.type === "video" ? (
              <video 
                ref={index === currentIndex ? videoRef : undefined}
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
                alt="Hero background"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-20 text-white px-6 md:px-10 lg:px-20 mb-8 md:mb-0 w-full">
        <h1 className="text-4xl md:text-[3.5rem] leading-[1.1] font-sans mb-2 md:mb-1 whitespace-pre-line font-normal">
          {title}
        </h1>
        
        <p className="text-base md:text-lg font-sans font-light max-w-2xl mb-3 tracking-wide leading-relaxed whitespace-pre-line">
          {subtitle}
        </p>
        
        <div className="flex flex-col gap-6">
          <Link 
            href={buttonLink} 
            className="text-base md:text-lg font-sans tracking-widest uppercase hover:opacity-80 transition-opacity w-fit underline-offset-8"
          >
            {buttonText}
          </Link>
          
          {/* Pagination dots */}
          {mediaItems.length > 1 && (
            <div className="flex gap-3 mt-4">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  suppressHydrationWarning
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
