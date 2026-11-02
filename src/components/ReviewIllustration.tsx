import React from 'react';
import Image from 'next/image';

export type ReviewType = 'boy' | 'girl';

export interface ReviewProps {
  id: string;
  type: ReviewType;
  photoUrl: string;
  text: string;
}

export default function ReviewIllustration({ type, photoUrl, text }: Omit<ReviewProps, 'id'>) {
  const isGirl = type === 'girl';
  const imageUrl = isGirl ? '/images/review/girl.png' : '/images/review/boy.png';

  // These percentages are estimated and can be tweaked for pixel-perfect alignment
  // since boy.png and girl.png might have slightly different internal proportions.
  
  // Base coordinates for Girl
  const girlPhotoStyles = "top-[43%] left-[15%] ml-[10px] -mt-[5px] w-[31%] h-[38%] -rotate-[6deg]";
  const girlTextStyles = "top-[43%] left-[54%] w-[35%] h-[38%] rotate-[7deg]";

  // Base coordinates for Boy
  const boyPhotoStyles = "top-[37%] left-[21%] w-[31%] h-[38%] -rotate-[6deg]";
  const boyTextStyles = "top-[38%] left-[56%] w-[35%] h-[38%] rotate-[8deg]";

  const photoStyles = isGirl ? girlPhotoStyles : boyPhotoStyles;
  const textStyles = isGirl ? girlTextStyles : boyTextStyles;

  // Dynamically scale font size and padding according to review text length
  const length = text ? text.trim().length : 0;
  let fontSizeClasses = "text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed";
  if (length > 180) {
    fontSizeClasses = "text-[8.5px] sm:text-[9.5px] md:text-[10px] leading-[1.25]";
  } else if (length > 110) {
    fontSizeClasses = "text-[10px] sm:text-[10.5px] md:text-[11.5px] leading-tight";
  } else if (length > 60) {
    fontSizeClasses = "text-[11px] sm:text-[12px] md:text-[12.5px] leading-snug";
  }

  return (
    <div className="relative flex justify-center w-full">
      <img 
        src={imageUrl} 
        alt={`${type} review illustration`} 
        className="w-full h-auto object-contain" 
      />
      
      {/* Photo Area (Left Polaroid) */}
      <div className={`absolute ${photoStyles} overflow-hidden bg-gray-100 flex items-center justify-center p-1`}>
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt="Customer Review" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="font-garamond text-gray-400 text-xs">No Photo</span>
        )}
      </div>

      {/* Text Area (Right Quote Card) */}
      <div className={`absolute ${textStyles} flex items-center justify-center p-2 sm:p-2.5 md:p-3 text-center overflow-hidden`}>
        <p className={`font-garamond italic text-gray-700 max-h-full w-full break-words line-clamp-6 ${fontSizeClasses}`}>
          "{text}"
        </p>
      </div>
    </div>
  );
}
