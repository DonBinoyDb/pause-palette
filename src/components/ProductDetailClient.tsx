"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { X, Check, Info, ShoppingBag, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useShop } from "@/context/ShopContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DEFAULT_SILHOUETTES } from "@/lib/curatorDefaults";

type ProductDetails = {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  collectionName?: string | null;
  categories?: { id?: string; name: string; slug?: string }[];
  hasSilhouette: boolean;
  fits: {
    name: string;
    iconUrl: string;
    image?: string;
    description?: string;
    fitGuideDescription?: string;
    fitGuideImage?: string;
  }[];
  accordions?: { title: string, content: string }[];
  gender: string[];
  sizes?: string[];
  fitGuideDescription?: string;
  fitGuideImage?: string;
  colors?: { name: string, hex: string, images: string[] }[];
  dispatchInfo?: string | null;
  imageFit?: "cover" | "contain" | string;
};

export default function ProductDetailClient({ product }: { product: ProductDetails }) {
  const isContain = product.imageFit === "contain";
  const isLandscape = product.imageFit === "landscape";
  const defaultSilhouettes: {
    name: string;
    iconUrl: string;
    image?: string;
    description?: string;
    fitGuideDescription?: string;
    fitGuideImage?: string;
  }[] = [
    {
      name: "Classic Point Collar",
      iconUrl: "",
      image: "",
      description: "A timeless structured point collar cut tailored with traditional shoulder lines and a gentle curved hem. Perfect for both tucked and relaxed untucked wear.",
      fitGuideDescription: "Tailored relaxed fit with structured point collar. Features a gently curved shirttail hem.",
      fitGuideImage: "",
    },
    {
      name: "Cuban Collar",
      iconUrl: "",
      image: "",
      description: "A relaxed camp/resort collar cut with open notch lapels, dropped shoulder allowance, and a clean straight hem. Engineered for easygoing, fluid drape.",
      fitGuideDescription: "Relaxed boxy cut with open notch resort collar. Designed with a clean straight hem and wider chest allowance.",
      fitGuideImage: "",
    },
    {
      name: "Mandarin Collar",
      iconUrl: "",
      image: "",
      description: "A minimalist band standing collar silhouette with clean architectural seamlines. Offers an understated, refined modern Eastern tailoring aesthetic.",
      fitGuideDescription: "Clean architectural cut with a standing band collar. Minimalist silhouette with an understated drape.",
      fitGuideImage: "",
    },
  ];

  const availableSilhouettes = product.fits && product.fits.length > 0
    ? product.fits
    : defaultSilhouettes;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isFitGuideOpen, setIsFitGuideOpen] = useState(false);
  const [isSilhouetteDrawerOpen, setIsSilhouetteDrawerOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSilhouette, setSelectedSilhouette] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<{ size: boolean; silhouette: boolean }>({
    size: false,
    silhouette: false,
  });
  const [isAdded, setIsAdded] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const { addToCart, toggleSaved, isSaved } = useShop();
  const { data: session } = useSession();
  const router = useRouter();

  // Close on ESC and lock body scroll when modal or side drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartModalOpen(false);
        setIsFitGuideOpen(false);
        setIsSilhouetteDrawerOpen(false);
      }
    };

    if (isCartModalOpen || isFitGuideOpen || isSilhouetteDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartModalOpen, isFitGuideOpen, isSilhouetteDrawerOpen]);

  const colors = product.colors || [];
  const currentColorImages = (colors.length > 0 && selectedColorIndex !== null && selectedColorIndex < colors.length && colors[selectedColorIndex].images.length > 0)
    ? colors[selectedColorIndex].images
    : product.images;

  // Map images, fallback if empty
  const displayImages = currentColorImages.length > 0
    ? currentColorImages
    : ["https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop"];

  const handleAddToCart = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Validation: Both size and silhouette are mandatory
    const missingSize = !selectedSize;
    const missingSilhouette = !selectedSilhouette;

    if (missingSize || missingSilhouette) {
      setSelectionError({ size: missingSize, silhouette: missingSilhouette });
      if (missingSize && missingSilhouette) {
        toast.error("Please select a Size and Silhouette before adding to cart.");
      } else if (missingSize) {
        toast.error("Please select a Size before adding to cart.");
      } else {
        toast.error("Please select a Silhouette before adding to cart.");
      }
      return;
    }

    const activeColor = (colors.length > 0 && selectedColorIndex !== null && colors[selectedColorIndex])
      ? colors[selectedColorIndex]
      : null;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: displayImages[0],
      size: selectedSize,
      silhouette: selectedSilhouette,
      color: activeColor ? activeColor.name : undefined,
    });

    setIsAdded(true);
    setIsCartModalOpen(true);
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

      <div className="pt-20 md:pt-32 pb-24 px-0 md:px-8 lg:px-16 w-full max-w-[1700px] mx-auto">

        {/* Back Button */}
        <div className="px-6 md:px-0 mb-4 md:mb-6">
          <button
            type="button"
            suppressHydrationWarning
            aria-label="Go back"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/shop/all");
              }
            }}
            className="group p-1 text-gray-500 hover:text-[#79A7D3] inline-flex items-center justify-center transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft size={22} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

          {/* Left: Images Section */}
          <div className="w-full lg:w-7/12 flex gap-0 md:gap-8">

            {/* Thumbnails (sticky) */}
            <div className="hidden md:flex flex-col gap-4 w-20 shrink-0 sticky top-32 h-fit">
              {displayImages.map((src, idx) => (
                  <div key={idx} className={`${isLandscape ? 'aspect-[4/3]' : 'aspect-[3/4]'} w-full relative ${isContain || isLandscape ? 'bg-[#FBFBFA]' : 'bg-gray-100'} cursor-pointer overflow-hidden border border-transparent hover:border-gray-300`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Thumbnail ${idx + 1}`} className={`${isContain || isLandscape ? 'object-contain' : 'object-cover'} w-full h-full`} />
                  </div>
              ))}
                </div>

            {/* Main Images (stacked on desktop, carousel on mobile) */ }
                < div className = "flex-1 flex flex-row md:flex-col gap-0 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 hide-scrollbar" >
                {
                  displayImages.map((src, idx) => (
                      <div
                        key={idx}
                        className={`w-full shrink-0 md:shrink relative snap-start ${isLandscape
                            ? "aspect-[4/3] bg-[#FBFBFA] flex items-center justify-center"
                            : isContain
                              ? "aspect-[3/4] md:aspect-auto md:min-h-[520px] bg-[#FBFBFA] flex items-center justify-center"
                              : "aspect-[3/4] bg-gray-100"
                          }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Product Image ${idx + 1}`}
                          className={`${isLandscape || isContain
                              ? "object-contain max-h-[85vh] w-full h-auto"
                              : "object-cover w-full h-full"
                            }`}
                        />
                      </div>
              ))}
                    </div>
          </div>

            {/* Right: Product Details (sticky) */}
            <div className="w-full lg:w-5/12 sticky top-32 py-4 px-4 md:px-0">
              <h1 className="font-garamond text-3xl md:text-4xl text-gray-800 mb-1">{product.name}</h1>
              {product.collectionName && (
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm tracking-wide text-gray-500 font-garamond italic">
                    {product.collectionName}
                  </p>
                </div>
              )}

              <p className="font-garamond font-medium text-2xl md:text-3xl text-gray-900 mb-2">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

              {/* Category Display between Price and Variants */}
              {product.category && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Colour Options */}
              {colors.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-500">Variants:</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {colors[selectedColorIndex]?.name || "Original"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColorIndex(idx)}
                        title={color.name}
                        aria-label={`Select color ${color.name}`}
                        className={`w-11 h-14 border p-0.5 cursor-pointer transition-all group rounded-xs relative ${selectedColorIndex === idx
                            ? 'border-gray-900 ring-2 ring-[#79A7D3]/40 shadow-xs scale-105'
                            : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                          }`}
                      >
                        <div
                          className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 overflow-hidden rounded-2xs"
                        >
                          {color.images.length > 0 ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={color.images[0]} alt={color.name} className={`w-full h-full object-cover transition-opacity ${selectedColorIndex === idx ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`} />
                          ) : color.hex ? (
                            <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                          ) : (
                            <span>{color.name.slice(0, 3)}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[12.5px] md:text-[13px] font-garamond uppercase tracking-wider text-gray-700 font-medium">
                    Size:{" "}
                    {selectedSize ? (
                      <span className="text-gray-900 font-semibold">{selectedSize}</span>
                    ) : (
                      <span className={`text-xs italic ${selectionError.size ? "text-red-600 font-medium" : "text-gray-400"}`}>
                        {selectionError.size ? "Please select a size *" : "Select size *"}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsFitGuideOpen(true)}
                    className="text-xs text-gray-500 hover:text-gray-800 tracking-wide underline font-garamond cursor-pointer"
                  >
                    Fit Guide {'>'}
                  </button>
                </div>
                <div className="flex gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setSelectedSize(size);
                        if (selectionError.size) {
                          setSelectionError(prev => ({ ...prev, size: false }));
                        }
                      }}
                      className={`w-11 h-11 flex items-center justify-center text-sm border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-[#79A7D3] bg-white text-[#79A7D3] font-medium shadow-sm ring-1 ring-[#79A7D3]'
                          : selectionError.size
                          ? 'border-red-300 text-gray-700 bg-red-50/20 hover:border-red-400'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Silhouette Selection */}
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12.5px] md:text-[13px] font-garamond uppercase tracking-wider text-gray-700 font-medium">
                    Silhouette:{" "}
                    {selectedSilhouette ? (
                      <span className="text-gray-900 font-semibold">{selectedSilhouette}</span>
                    ) : (
                      <span className={`text-xs italic ${selectionError.silhouette ? "text-red-600 font-medium" : "text-gray-400"}`}>
                        {selectionError.silhouette ? "Please select a silhouette *" : "Select silhouette *"}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsSilhouetteDrawerOpen(true)}
                    className="text-xs text-gray-400 hover:text-gray-800 underline font-garamond cursor-pointer"
                  >
                    View cuts
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableSilhouettes.map((fitItem) => {
                    const isSelected = selectedSilhouette === fitItem.name;
                    return (
                      <button
                        key={fitItem.name}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => {
                          setSelectedSilhouette(fitItem.name);
                          if (selectionError.silhouette) {
                            setSelectionError(prev => ({ ...prev, silhouette: false }));
                          }
                          setIsSilhouetteDrawerOpen(true);
                        }}
                        className={`min-w-[110px] px-4 py-3 rounded-sm border flex flex-col items-center justify-center gap-2 text-[13px] font-garamond tracking-wide transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#79A7D3] ring-1 ring-[#79A7D3] bg-[#F4F8FB]/40 text-[#79A7D3] font-medium shadow-xs"
                            : selectionError.silhouette
                            ? "border-red-300 hover:border-red-400 bg-red-50/20 text-gray-700"
                            : "border-gray-200 hover:border-gray-400 bg-white text-gray-600"
                        }`}
                      >
                        {fitItem.iconUrl && (
                          <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={fitItem.iconUrl} alt={fitItem.name} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                        )}
                        <span className="text-center leading-tight">{fitItem.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection Reminder Banner */}
              {(selectionError.size || selectionError.silhouette) && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-garamond rounded-sm flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span className="font-semibold text-red-800">Please choose:</span>
                  <span>
                    {selectionError.size && selectionError.silhouette
                      ? "Both your Size and Silhouette are required before adding to cart."
                      : selectionError.size
                      ? "Please select your Size above."
                      : "Please select your Silhouette above."}
                  </span>
                </div>
              )}

              {/* Add to Cart & Wishlist */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleAddToCart}
                  suppressHydrationWarning
                  className={`flex-1 border font-serif text-lg tracking-wide py-4 px-4 transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.99] ${isAdded
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-[#79A7D3] bg-white hover:bg-[#F4F8FB] text-[#79A7D3] font-medium'
                    }`}
                >
                  {isAdded ? 'Added to Cart' : 'Add To Cart'}
                </button>

                <button
                  onClick={() => toggleSaved({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: displayImages[0]
                  })}
                  className={`flex items-center justify-center w-16 shrink-0 border transition-all hover:scale-[1.02] cursor-pointer ${isSaved(product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#79A7D3] bg-white hover:bg-[#F4F8FB] text-[#79A7D3]'}`}
                >
                  <span className="text-2xl leading-none pt-0.5">{isSaved(product.id) ? '♥' : '♡'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 italic text-center mb-10">
                {product.dispatchInfo || "Thoughtfully made to order - Dispatches in 12-15 business days."}
              </p>

              {/* Description */}
              <p className="text-base text-gray-600 leading-relaxed mb-10 whitespace-pre-wrap">
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
                      <span className="text-sm tracking-wide text-gray-600">{item.title}</span>
                      <span className="text-gray-400 text-sm font-light">{openAccordion === item.title ? '−' : '+'}</span>
                    </button>
                    {openAccordion === item.title && (
                      <div className="pb-4 text-sm text-gray-500 leading-relaxed pr-8 whitespace-pre-wrap">
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

        {/* Fit Guide Slide-over Drawer (Garment Sizing S, M, L, XL, XXL) */}
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${isFitGuideOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsFitGuideOpen(false)}
          />

          <div
            className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isFitGuideOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col z-20`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-garamond text-xl tracking-widest text-gray-900">FIT GUIDE</h2>
              <button
                type="button"
                onClick={() => setIsFitGuideOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 rounded-full cursor-pointer"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {product.fitGuideDescription ? (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-8 font-serif">
                  {product.fitGuideDescription}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic mb-8 font-serif">
                  Fit guide description is not available for this piece yet.
                </p>
              )}

              {product.fitGuideImage && (
                <div className="w-full bg-gray-50 rounded-sm overflow-hidden p-2 border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.fitGuideImage}
                    alt="Fit Guide"
                    className="w-full h-auto object-contain mix-blend-multiply"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Silhouette Slide-over Drawer */}
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSilhouetteDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsSilhouetteDrawerOpen(false)}
          />

          <div
            className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${
              isSilhouetteDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            } flex flex-col z-20`}
          >
            {(() => {
              const activeFitName = selectedSilhouette || availableSilhouettes[0]?.name;
              const activeFit = availableSilhouettes.find((f) => f.name === activeFitName) || availableSilhouettes[0];

              const getFitDesc = () => {
                if (activeFit?.description?.trim()) return activeFit.description.trim();
                const lower = (activeFitName || "").toLowerCase();
                if (lower.includes("point") || lower.includes("classic")) {
                  return "A timeless structured point collar cut tailored with traditional shoulder lines and a gentle curved hem. Perfect for both tucked and relaxed untucked wear.";
                }
                if (lower.includes("cuban") || lower.includes("camp") || lower.includes("resort")) {
                  return "A relaxed camp/resort collar cut with open notch lapels, dropped shoulder allowance, and a clean straight hem. Engineered for easygoing, fluid drape.";
                }
                if (lower.includes("mandarin") || lower.includes("band") || lower.includes("chinese")) {
                  return "A minimalist band standing collar silhouette with clean architectural seamlines. Offers an understated, refined modern Eastern tailoring aesthetic.";
                }
                return "Thoughtfully tailored silhouette with mindful proportions and refined craftsmanship. Crafted for comfortable movement and effortless style.";
              };

              return (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="font-garamond text-[14px] md:text-[15px] text-gray-500 font-medium tracking-[0.1em] uppercase">
                      {activeFitName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsSilhouetteDrawerOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 rounded-full cursor-pointer"
                      aria-label="Close drawer"
                    >
                      <X size={20} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Content Area - Stacked: Image -> Description -> Image */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* 1. First Image: Cut Image */}
                    <div className="w-full bg-gray-50 rounded-sm overflow-hidden mb-8 border border-gray-100">
                      {activeFit.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={activeFit.image}
                          alt={`${activeFit.name} Cut Photo`}
                          className="w-full h-auto object-cover"
                        />
                      ) : activeFit.iconUrl ? (
                        <div className="w-full py-10 flex flex-col items-center justify-center">
                          <div className="w-24 h-24 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={activeFit.iconUrl}
                              alt={activeFit.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const lower = (activeFitName || "").toLowerCase();
                          const matchedSvg =
                            lower.includes("cuban") || lower.includes("camp") || lower.includes("resort")
                              ? DEFAULT_SILHOUETTES.find((s) => s.id === "cuban-collar")?.svg
                              : lower.includes("mandarin") || lower.includes("band") || lower.includes("chinese")
                              ? DEFAULT_SILHOUETTES.find((s) => s.id === "mandarin-collar")?.svg
                              : DEFAULT_SILHOUETTES.find((s) => s.id === "classic-point-collar")?.svg;

                          return (
                            <div className="w-full py-10 flex flex-col items-center justify-center text-gray-500">
                              {matchedSvg && (
                                <div
                                  className="w-24 h-24 text-gray-700"
                                  dangerouslySetInnerHTML={{ __html: matchedSvg }}
                                />
                              )}
                              <span className="text-[11px] font-garamond uppercase tracking-widest text-gray-400 mt-3">
                                {activeFit.name}
                              </span>
                            </div>
                          );
                        })()
                      )}
                    </div>

                    {/* 2. Middle: Description Paragraph */}
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-8 font-serif">
                      {getFitDesc()}
                    </p>

                    {/* 3. Second Image: Fit Guide Image */}
                    <div className="w-full bg-gray-50 rounded-sm overflow-hidden p-2 border border-gray-100">
                      {activeFit.fitGuideImage || product.fitGuideImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={activeFit.fitGuideImage || product.fitGuideImage}
                          alt={`${activeFit.name} Fit Guide`}
                          className="w-full h-auto object-contain mix-blend-multiply"
                        />
                      ) : (
                        <div className="w-full py-10 flex flex-col items-center justify-center text-center px-4">
                          <span className="font-garamond text-sm uppercase tracking-widest text-gray-500 mb-1">
                            Fit Guide
                          </span>
                          <span className="text-xs font-serif italic text-gray-400">
                            Fit guide image not uploaded for this cut yet.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticky Bottom Actions */}
                  <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSilhouette(activeFitName);
                        if (selectionError.silhouette) {
                          setSelectionError((prev) => ({ ...prev, silhouette: false }));
                        }
                        setIsSilhouetteDrawerOpen(false);
                      }}
                      className="w-full border border-[#79A7D3] bg-white hover:bg-[#F4F8FB] text-[#79A7D3] font-serif text-lg tracking-wide py-3.5 px-4 transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.99] font-medium"
                    >
                      Confirm Silhouette
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Added to Cart Popup Modal */}
        {isCartModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsCartModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-none sm:rounded-xs shadow-2xl p-6 sm:p-8 text-center border border-[#DCE8F3] animate-in zoom-in-95 duration-200"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCartModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#79A7D3] transition-colors p-1.5 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.5} />
              </button>

              {/* Checkmark Icon in brand soft blue badge */}
              <div className="w-12 h-12 rounded-full bg-[#F4F8FB] border border-[#D5E5F2] text-[#79A7D3] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Check size={22} strokeWidth={2.5} />
              </div>

              {/* Brand Title & Subtitle */}
              <h3 className="font-garamond text-2xl text-gray-900 tracking-wide mb-1 font-normal uppercase">
                Added to Cart
              </h3>
              <p className="text-xs text-gray-500 font-serif italic mb-5">
                Your piece has been thoughtfully added to your shopping bag.
              </p>

              {/* Product Card Snapshot */}
              <div className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-none sm:rounded-xs p-3.5 flex items-center gap-4 text-left mb-6">
                <div className="w-16 h-20 bg-white border border-gray-100 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImages[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-garamond text-sm text-gray-900 font-medium truncate uppercase tracking-wide">
                    {product.name}
                  </p>
                  <div className="text-[12px] text-gray-500 mt-0.5 space-y-0.5 font-light">
                    <p>Size: <span className="text-gray-800 font-normal">{selectedSize}</span></p>
                    {selectedSilhouette && (
                      <p className="truncate">Silhouette: <span className="text-gray-800 font-normal">{selectedSilhouette}</span></p>
                    )}
                  </div>
                  <p className="text-sm font-serif text-[#4A7DAF] font-semibold mt-1.5">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Two Signature Blue Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartModalOpen(false);
                    router.push("/cart");
                  }}
                  className="w-full border border-[#79A7D3] bg-[#79A7D3] hover:bg-[#6894BE] text-white py-3.5 px-6 font-serif text-xs sm:text-[13px] tracking-[0.18em] uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.99] font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} /> Go To Cart
                </button>
                <button
                  type="button"
                  onClick={() => setIsCartModalOpen(false)}
                  className="w-full border border-[#79A7D3] bg-white hover:bg-[#F4F8FB] text-[#79A7D3] py-3.5 px-6 font-serif text-xs sm:text-[13px] tracking-[0.18em] uppercase transition-all duration-200 cursor-pointer active:scale-[0.99] font-medium"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
