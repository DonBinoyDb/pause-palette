"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { X, Check, Info } from "lucide-react";
import { useShop } from "@/context/ShopContext";

type ProductDetails = {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  hasSilhouette: boolean;
  fits: {name: string, iconUrl: string}[];
  accordions?: {title: string, content: string}[];
  gender: string[];
  sizes?: string[];
};

export default function ProductDetailClient({ product }: { product: ProductDetails }) {
  const [selectedSize, setSelectedSize] = useState("S");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isSilhouetteModalOpen, setIsSilhouetteModalOpen] = useState(false);
  const [selectedSilhouette, setSelectedSilhouette] = useState(
    product.fits && product.fits.length > 0 ? product.fits[0].name : "original"
  );
  const [isAdded, setIsAdded] = useState(false);

  const { addToCart, toggleSaved, isSaved } = useShop();

  // Map images, fallback if empty
  const images = product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop"];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      size: selectedSize,
      silhouette: selectedSilhouette
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL", "XXL"];

  const defaultAccordions = [
    { title: "Product Details", content: "" },
    { title: "Size & Fit", content: "" },
    { title: "The Fabric", content: "" },
    { title: "Care", content: "" },
  ];
  
  const accordions = product.accordions && product.accordions.length > 0 
    ? product.accordions 
    : defaultAccordions;

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24 container mx-auto w-full max-w-[1400px]">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left: Images Section */}
          <div className="w-full lg:w-7/12 flex gap-4 md:gap-8">
            
            {/* Thumbnails (sticky) */}
            <div className="hidden md:flex flex-col gap-4 w-20 shrink-0 sticky top-32 h-fit">
              {images.map((src, idx) => (
                <div key={idx} className="aspect-[3/4] w-full relative bg-gray-100 cursor-pointer overflow-hidden border border-transparent hover:border-gray-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Thumbnail ${idx+1}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>

            {/* Main Images (stacked) */}
            <div className="flex-1 flex flex-col gap-4">
              {images.map((src, idx) => (
                <div key={idx} className="aspect-[3/4] w-full relative bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Product Image ${idx+1}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details (sticky) */}
          <div className="w-full lg:w-5/12 sticky top-32 py-4">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-800 mb-1">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
               <p className="text-[12px] tracking-wide text-gray-500 italic">
                 {product.category} {product.gender?.length > 0 ? `| ${product.gender.join(', ')}` : ''}
               </p>
               <button onClick={() => toggleSaved(product)} className={`text-xs hover:scale-110 transition-transform ${isSaved(product.id) ? 'text-red-500' : 'text-gray-400'}`}>
                 {isSaved(product.id) ? '♥' : '♡'}
               </button>
            </div>
            
            <p className="font-serif text-lg text-gray-700 mb-6">₹ {product.price}</p>

            {/* Colour Options */}
            <div className="mb-8">
              <p className="text-[11px] text-gray-500 mb-2">Colour Options:</p>
              <div className="w-10 h-12 border border-gray-300 p-0.5 cursor-pointer">
                <div className="w-full h-full bg-blue-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[0]} alt="Colour Swatch" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="flex justify-between items-end mb-4">
              <div className="flex gap-2">
                {sizes.map(size => (
                  <button 
                    key={size}
                    suppressHydrationWarning
                    onClick={() => setSelectedSize(size)}
                    className={`w-9 h-9 flex items-center justify-center text-xs border ${selectedSize === size ? 'border-[#2C2B29] bg-[#2C2B29] text-white font-medium shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-400'} transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button suppressHydrationWarning className="text-[11px] text-gray-500 hover:text-gray-800 tracking-wide">
                Fit Guide {'>'}
              </button>
            </div>

            {/* Silhouette Dropdown */}
            {product.hasSilhouette && product.fits?.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] text-gray-500 italic mb-2">Prefer this illustration in another form? Choose from our available silhouettes.</p>
                <button 
                  suppressHydrationWarning 
                  onClick={() => setIsSilhouetteModalOpen(true)}
                  className="w-full border border-gray-300 py-3 px-4 flex justify-between items-center text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="mx-auto tracking-wide">
                    {`Selected: ${selectedSilhouette}`}
                  </span>
                  <span className="text-gray-400">+</span>
                </button>
              </div>
            )}

            {/* Add to Cart */}
            <button 
              onClick={handleAddToCart}
              suppressHydrationWarning 
              className={`w-full border font-serif tracking-wide py-3 px-4 mb-2 transition-colors ${
                isAdded 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-[#8FB1D0] text-[#7A9BB9] hover:bg-[#F4F8FB]'
              }`}
            >
              {isAdded ? 'Added to Cart' : 'Add To Cart'}
            </button>
            <p className="text-[10px] text-gray-400 italic text-center mb-10">Thoughtfully made to order - Dispatches in 12-15 business days.</p>

            {/* Description */}
            <p className="text-[13px] text-gray-600 leading-relaxed mb-10 whitespace-pre-wrap">
              {product.description || "Thoughtfully designed, slowly crafted."}
            </p>

            {/* Accordion */}
            <div className="border-t border-gray-200">
              {accordions.map((item, idx) => (
                <div key={idx} className="border-b border-gray-200">
                  <button 
                    suppressHydrationWarning
                    onClick={() => setOpenAccordion(openAccordion === item.title ? null : item.title)}
                    className="w-full py-4 flex justify-between items-center text-left"
                  >
                    <span className="text-[12px] tracking-wide text-gray-600">{item.title}</span>
                    <span className="text-gray-400 text-sm font-light">{openAccordion === item.title ? '−' : '+'}</span>
                  </button>
                  {openAccordion === item.title && (
                    <div className="pb-4 text-[12px] text-gray-500 leading-relaxed pr-8 whitespace-pre-wrap">
                      {item.content || `Details for ${item.title} will be provided soon.`}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
      
      <Footer />

      {/* Silhouette Selection Modal */}
      {isSilhouetteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSilhouetteModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-[#FBF9F6] rounded-sm shadow-xl max-h-[90vh] overflow-y-auto flex flex-col">
            <button 
              onClick={() => setIsSilhouetteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            
            <div className="px-8 py-10 flex-1">
              <h2 className="text-center font-serif text-xl tracking-widest text-gray-800 mb-2">CHOOSE YOUR SILHOUETTE</h2>
              <p className="text-center text-sm text-gray-600 mb-10">Select the silhouette you prefer for this illustration.</p>

              {/* Dynamic Fits */}
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.fits.map((fitItem, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedSilhouette(fitItem.name)}
                      className={`border rounded-md p-4 flex flex-col items-center cursor-pointer transition-colors relative ${selectedSilhouette === fitItem.name ? 'border-gray-800 bg-white' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border ${selectedSilhouette === fitItem.name ? 'bg-[#3A3831] border-[#3A3831] text-white' : 'border-gray-400'}`}>
                        {selectedSilhouette === fitItem.name && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div className="w-20 h-20 bg-white border border-gray-100 flex items-center justify-center rounded-sm mb-4 mt-2 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={fitItem.iconUrl} alt={fitItem.name} className="w-full h-full object-contain" />
                      </div>
                      <p className="font-serif text-gray-800 text-sm text-center leading-tight mb-1">{fitItem.name}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Bottom Actions */}
            <div className="px-8 pb-8 pt-4 bg-[#FBF9F6] sticky bottom-0 border-t border-gray-200">
              <div className="flex items-start justify-center gap-2 mb-6">
                <Info size={14} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="text-xs text-gray-600 text-center max-w-sm">Illustration placement may vary slightly to complement the chosen silhouette.</p>
              </div>
              <button 
                onClick={() => setIsSilhouetteModalOpen(false)}
                className="w-full bg-[#3A3831] hover:bg-[#2A2821] text-white py-4 font-serif tracking-widest text-sm transition-colors"
              >
                CONFIRM SILHOUETTE
              </button>
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}
