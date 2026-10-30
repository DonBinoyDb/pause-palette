"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Check, ArrowRight } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  description?: string | null;
  sizes?: string[];
  collection?: { name: string } | null;
  colors?: { name: string; hex: string; images: string[] }[];
}

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { addToCart } = useShop();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || "M");
      setSelectedColorIndex(0);
      setAdded(false);
      // Lock body scroll
      document.body.style.overflow = "hidden";
      
      const firstColorImage = product.colors?.[0]?.images?.[0];
      setSelectedImage(firstColorImage || product.images?.[0] || "");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const defaultSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL"];
  const colors = product.colors || [];
  const activeColor = colors[selectedColorIndex];

  const handleSelectColor = (idx: number) => {
    setSelectedColorIndex(idx);
    const colorImg = colors[idx]?.images?.[0];
    if (colorImg) {
      setSelectedImage(colorImg);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: selectedImage || product.images?.[0] || "",
      size: selectedSize,
      silhouette: "Classic",
      color: activeColor ? activeColor.name : undefined,
    });

    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image & Thumbnails */}
        <div className="w-full md:w-1/2 bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[3/4] max-h-[360px] md:max-h-[440px] overflow-hidden rounded-lg bg-gray-100 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage || "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1974&auto=format&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto max-w-full py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-14 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img 
                      ? "border-[#79A7D3] ring-1 ring-[#79A7D3] scale-105 shadow-sm" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Collection */}
            {product.collection?.name && (
              <span className="text-[10px] md:text-[11px] tracking-[0.25em] text-gray-400 uppercase font-semibold block mb-1.5">
                {product.collection.name}
              </span>
            )}

            {/* Title */}
            <h2 
              className="text-xl md:text-2xl text-gray-800 font-normal leading-snug mb-2"
              style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
            >
              {product.name}
            </h2>

            {/* Price */}
            <p 
              className="text-[16px] md:text-[18px] text-gray-800 font-medium mb-3"
              style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
            >
              ₹ {product.price.toLocaleString("en-IN")}
            </p>

            {/* Description */}
            <p 
              className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed mb-5 font-garamond line-clamp-3"
              style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
            >
              {product.description || "A thoughtfully designed piece for slow living, carrying original hand-drawn artwork, colour, and timeless craftsmanship."}
            </p>

            {/* Colour Selector */}
            {colors.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">Select Colour</span>
                  <span className="text-[11px] text-gray-700 font-medium">{activeColor?.name}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectColor(idx)}
                      title={col.name}
                      aria-label={`Select ${col.name}`}
                      className={`h-7 px-2.5 text-[10px] tracking-wider uppercase rounded-sm border transition-all flex items-center gap-1.5 ${
                        selectedColorIndex === idx
                          ? "border-[#2C2B29] bg-[#2C2B29] text-white font-medium shadow-2xs"
                          : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                      }`}
                    >
                      {col.hex && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" 
                          style={{ backgroundColor: col.hex }} 
                        />
                      )}
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-medium">Select Size</span>
                <span className="text-[11px] text-gray-400 font-garamond italic">Standard Fit</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {defaultSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-8 min-w-[36px] px-2.5 text-[11px] tracking-wider uppercase rounded-sm border transition-all ${
                      selectedSize === size
                        ? "border-[#79A7D3] bg-[#79A7D3] text-white font-medium shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3 px-6 rounded text-[11px] tracking-[0.25em] uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${
                added 
                  ? "bg-[#79A7D3] border-[#79A7D3] text-white shadow-sm" 
                  : "bg-white text-gray-900 border-gray-900 hover:bg-[#79A7D3] hover:border-[#79A7D3] hover:text-white active:scale-[0.99]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </button>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 w-full text-center text-[11px] tracking-[0.18em] uppercase text-gray-400 hover:text-[#79A7D3] transition-colors py-1 group"
            >
              <span>View full product details</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
