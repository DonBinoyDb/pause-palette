"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useShop } from "@/context/ShopContext";

type Mode = "illustration" | "embroidery" | "solid";
type Audience = "men" | "women";
type Technique = "printed" | "embroidered";
type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Green", hex: "#768B75" },
  { name: "Beige", hex: "#9B7D72" },
  { name: "Sand", hex: "#EAD6CB" },
];

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export default function Configurator() {
  const { addToCart } = useShop();

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State
  const [mode, setMode] = useState<Mode>("illustration");
  const [audience, setAudience] = useState<Audience>("men");
  const [technique, setTechnique] = useState<Technique>("printed");
  const [canvas, setCanvas] = useState<string>("");
  const [theme, setTheme] = useState("");
  const [silhouette, setSilhouette] = useState<string>("full");
  const [size, setSize] = useState<Size>("M");
  const [baseColor, setBaseColor] = useState(COLORS[0].name);

  useEffect(() => {
    fetch("/api/curator-settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.canvasProducts && data.canvasProducts.length > 0) {
          setCanvas(data.canvasProducts[0].id);
        }
        if (data.silhouettes && data.silhouettes.length > 0) {
          setSilhouette(data.silhouettes[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-sm text-gray-500">Loading configurator...</div>;
  }

  const visibility = settings?.visibility?.[mode] || {};
  const canvasProducts = settings?.canvasProducts || [];
  const silhouettes = settings?.silhouettes || [];

  const getPrice = () => {
    switch (mode) {
      case "illustration": return 5999;
      case "embroidery": return 6999;
      case "solid": return 3999;
      default: return 4999;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "illustration": return "ORIGINAL ILLUSTRATION";
      case "embroidery": return "THEME BASED EMBROIDERY";
      case "solid": return "SOLID COLOR";
    }
  };

  const getCustomProductName = () => {
    switch (mode) {
      case "illustration": return `Curated Illustration - ${audience === "men" ? "Men's" : "Women's"}`;
      case "embroidery": return `Curated Embroidery - ${audience === "men" ? "Men's" : "Women's"}`;
      case "solid": return `Curated Solid - ${audience === "men" ? "Men's" : "Women's"}`;
    }
  };

  const handleAddToCart = () => {
    const selectedSilhouette = silhouettes.find((s: any) => s.id === silhouette)?.name || silhouette;
    
    addToCart({
      productId: `curated-${mode}-${Date.now()}`,
      name: getCustomProductName(),
      price: getPrice(),
      image: mode === "illustration" && visibility.showCanvas 
        ? (canvasProducts.find((c: any) => c.id === canvas)?.images?.[0] || "") 
        : "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=500&q=80",
      size,
      silhouette: selectedSilhouette,
    });
    toast.success("Your custom piece has been added to your cart.");
  };

  return (
    <div className="w-full flex flex-col font-sans text-gray-900">
      
      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 max-w-4xl mx-auto">
        
        {/* Original Illustration */}
        <button 
          onClick={() => setMode("illustration")}
          className={`flex flex-col items-center text-center p-6 md:p-8 border ${mode === "illustration" ? "border-gray-900 shadow-sm" : "border-gray-200 hover:border-gray-300"} transition-all`}
        >
          <div className="h-32 flex items-center justify-center mb-6">
            <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 80 L35 80 L32 30 L28 30 Z" fill="#768B75"/>
              <circle cx="35" cy="20" r="8" fill="#F4D03F"/>
              <path d="M35 20 L25 10" stroke="#F4D03F" strokeWidth="2"/>
              <path d="M35 20 L45 10" stroke="#F4D03F" strokeWidth="2"/>
              <circle cx="20" cy="30" r="5" fill="#EAD6CB"/>
              <path d="M22 80 L38 80" stroke="#000" strokeWidth="1.5"/>
              <path d="M20 85 L40 85" stroke="#000" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3 className="text-sm font-serif font-semibold tracking-[0.1em] uppercase mb-4 text-[#79A7D3]">PHYSICAL ILLUSTRATION</h3>
          <p className="text-sm leading-relaxed text-gray-600 font-sans">
            Begin with one of our existing Pause Palette designs as a canvas for a piece through your preferred technique (embroidered, printed) and selected color palette.
          </p>
        </button>

        {/* Theme Based Embroidery */}
        <button 
          onClick={() => setMode("embroidery")}
          className={`flex flex-col items-center text-center p-6 md:p-8 border ${mode === "embroidery" ? "border-[#79A7D3] shadow-sm bg-[#F9FBFC]" : "border-gray-200 hover:border-gray-300 bg-white"} transition-all`}
        >
          <div className="h-32 flex items-center justify-center mb-6 relative">
            <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 15 L20 75" stroke="#000" strokeWidth="1.5"/>
              <path d="M42 12 C48 5 55 10 50 18 C45 25 20 40 15 50 C10 60 20 70 30 65 C40 60 50 40 45 35" stroke="#9B7D72" strokeWidth="1" fill="none"/>
              <path d="M42 18 L46 22" stroke="#000" strokeWidth="1"/>
            </svg>
          </div>
          <h3 className="text-sm font-serif font-semibold tracking-[0.1em] uppercase mb-4">THREAD BASED EMBROIDERY</h3>
          <p className="text-sm leading-relaxed text-gray-600 font-sans">
            Choose your silhouette from our available base colour then share the theme you'd like us to explore and interpret through embroidery.
          </p>
        </button>

        {/* Solid Color */}
        <button 
          onClick={() => setMode("solid")}
          className={`flex flex-col items-center text-center p-6 md:p-8 border ${mode === "solid" ? "border-[#79A7D3] shadow-sm bg-[#F9FBFC]" : "border-gray-200 hover:border-gray-300 bg-white"} transition-all`}
        >
          <div className="h-32 flex flex-col items-center justify-center gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#768B75]"></div>
            <div className="w-8 h-8 rounded-full bg-[#9B7D72]"></div>
          </div>
          <h3 className="text-sm font-serif font-semibold tracking-[0.1em] uppercase mb-4">SOLID COLOR</h3>
          <p className="text-sm leading-relaxed text-gray-600 font-sans">
            Choose your preferred silhouette, size and available base color to create a staple, unadorned piece to add to your rotation crafted from the finest linen. No specs, less.
          </p>
        </button>

      </div>

      <div className="w-full h-[1px] bg-gray-300 mb-8 md:mb-10"></div>

      {/* Dynamic Form Area */}
      <div className="max-w-xl mx-auto w-full flex flex-col gap-8 md:gap-10">
        
        {/* Dynamic Title */}
        <h2 className="text-sm font-serif font-bold tracking-[0.15em] uppercase text-gray-900 mb-0 md:mb-2 text-center md:text-left">
          {getModeTitle()}
        </h2>

        {/* Who is this for */}
        {visibility.showAudience && (
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-gray-900">Who is this for?</label>
            <span className="text-xs text-gray-500 italic">Select the appropriate silhouette.</span>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setAudience("men")}
                className={`flex-1 px-4 md:px-8 py-3 border text-sm font-medium tracking-wider uppercase transition-colors ${audience === "men" ? "border-gray-900 text-gray-900" : "border-gray-300 text-gray-400 hover:border-gray-400"}`}
              >
                Men
              </button>
              <button 
                onClick={() => setAudience("women")}
                className={`flex-1 px-4 md:px-8 py-3 border text-sm font-medium tracking-wider uppercase transition-colors ${audience === "women" ? "border-gray-900 text-gray-900" : "border-gray-300 text-gray-400 hover:border-gray-400"}`}
              >
                Women
              </button>
            </div>
          </div>
        )}

        {/* Technique */}
        {visibility.showTechnique && (
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-gray-900">Technique</label>
            <span className="text-xs text-gray-500 italic">Select how to realize the chosen artwork.</span>
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => setTechnique("printed")}
                className={`flex-1 px-4 md:px-8 py-3 border text-sm font-medium tracking-wider uppercase transition-colors ${technique === "printed" ? "border-[#79A7D3] text-[#79A7D3] bg-[#79A7D3]/5" : "border-gray-300 text-gray-400 hover:border-gray-400"}`}
              >
                Printed
              </button>
              <button 
                onClick={() => setTechnique("embroidered")}
                className={`flex-1 px-4 md:px-8 py-3 border text-sm font-medium tracking-wider uppercase transition-colors ${technique === "embroidered" ? "border-[#79A7D3] text-[#79A7D3] bg-[#79A7D3]/5" : "border-gray-300 text-gray-400 hover:border-gray-400"}`}
              >
                Embroidered
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Canvas Selection */}
        {visibility.showCanvas && canvasProducts.length > 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-base font-medium text-gray-900 block mb-1">Choose from our canvas</label>
              <span className="text-xs text-gray-500 italic">Select the illustration you like the most.</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {canvasProducts.map((c: any) => (
                <button 
                  key={c.id}
                  onClick={() => setCanvas(c.id)}
                  className="flex flex-col gap-2 min-w-[120px] text-left group"
                >
                  <div className={`relative w-[120px] h-[160px] border-[3px] transition-all bg-gray-100 ${canvas === c.id ? "border-[#79A7D3]" : "border-transparent"}`}>
                    {c.images?.[0] && <Image src={c.images[0]} alt={c.name} fill className="object-cover" />}
                  </div>
                  <span className="text-xs font-medium uppercase text-gray-800 truncate w-full">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Silhouettes */}
        {visibility.showSilhouette && silhouettes.length > 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-base font-medium text-gray-900 block mb-1">Choose your Silhouette</label>
              <span className="text-xs text-gray-500 italic">Select from the available silhouettes. Measurements below.</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {silhouettes.map((sil: any) => (
                <button 
                  key={sil.id}
                  onClick={() => setSilhouette(sil.id)}
                  className={`flex flex-col items-center justify-center min-w-[120px] h-[140px] border p-4 transition-colors ${silhouette === sil.id ? "border-[#79A7D3] bg-[#F9FBFC]" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <div className="flex-1 w-full relative flex items-center justify-center opacity-70">
                    <div className="w-16 h-16" dangerouslySetInnerHTML={{ __html: sil.svg }} />
                  </div>
                  <span className="text-xs font-medium uppercase mt-2 text-center">{sil.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        {visibility.showSize && (
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-gray-900 block mb-1">Choose your Size</label>
            <div className="flex items-center gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 border flex items-center justify-center text-sm font-medium transition-colors ${size === s ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
                >
                  {s}
                </button>
              ))}
              <button className="text-xs font-medium uppercase text-gray-500 underline ml-4 hover:text-gray-900">
                Size Guide
              </button>
            </div>
          </div>
        )}

        {/* Base Color */}
        {visibility.showColor && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-base font-medium text-gray-900 block mb-1">Choose your base color</label>
              <span className="text-xs text-gray-500 italic">Select from our selection of premium linen yarns.</span>
            </div>
            <div className="flex gap-4">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setBaseColor(c.name)}
                  className="flex flex-col items-center gap-2"
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 transition-all ${baseColor === c.name ? "border-gray-900 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c.hex }}
                  ></div>
                  <span className="text-xs font-medium uppercase">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Theme */}
        {visibility.showTheme && (
          <div className="flex flex-col gap-3 mt-4">
            <label className="text-base font-medium text-gray-900">Share your theme</label>
            <div className="relative">
              <textarea 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Minimalist floral art in blue threads..."
                className="w-full h-32 border border-gray-300 p-4 text-sm font-serif focus:outline-none focus:border-[#79A7D3] resize-none"
              />
              <div className="absolute right-4 bottom-4 text-xs text-gray-400 uppercase italic">
                Max 300 Words
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Your theme will be evaluated and translated by the Pause Palette design team into a custom artwork.
            </p>
          </div>
        )}

        <div className="w-full h-[1px] bg-gray-200 my-4"></div>

        {/* Your Piece Summary */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold uppercase">Your Piece</h3>
          
          <div className="flex items-start gap-6 border-b border-gray-200 pb-12 mb-4">
            <div className="w-24 h-24 border border-gray-200 p-2 flex items-center justify-center shrink-0 bg-[#F9F8F6]">
              {silhouettes.find((s: any) => s.id === silhouette) ? (
                <div 
                  className="w-16 h-16 opacity-60" 
                  dangerouslySetInnerHTML={{ __html: silhouettes.find((s: any) => s.id === silhouette).svg }} 
                />
              ) : (
                <div className="w-16 h-16 opacity-60 bg-gray-200 rounded"></div>
              )}
            </div>
            
            <div className="flex flex-col gap-1.5 text-sm font-mono text-gray-700">
              
              {visibility.showAudience && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Selection:</span>
                  <span>{audience === "men" ? "Men's" : "Women's"}</span>
                </div>
              )}
              
              {visibility.showTechnique && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Technique:</span>
                  <span className="capitalize">{technique}</span>
                </div>
              )}
              
              {visibility.showCanvas && canvasProducts.length > 0 && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Canvas:</span>
                  <span>{canvasProducts.find((c: any) => c.id === canvas)?.name || "None"}</span>
                </div>
              )}
              
              {visibility.showTheme && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Theme:</span>
                  <span className="truncate max-w-[200px]">{theme || "None specified"}</span>
                </div>
              )}

              {visibility.showSilhouette && silhouettes.length > 0 && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Silhouette:</span>
                  <span className="capitalize">{silhouettes.find((s: any) => s.id === silhouette)?.name || "None"}</span>
                </div>
              )}
              
              {visibility.showSize && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Size:</span>
                  <span>{size}</span>
                </div>
              )}
              
              {visibility.showColor && (
                <div className="grid grid-cols-[120px_1fr]">
                  <span className="text-gray-400 uppercase">Colour:</span>
                  <span>{baseColor}</span>
                </div>
              )}
              
              <div className="grid grid-cols-[120px_1fr] mt-3 pt-3 border-t border-gray-100 font-bold text-gray-900 text-base">
                <span className="uppercase font-normal text-gray-900">Total:</span>
                <span>₹ {getPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Add to cart */}
          <button 
            onClick={handleAddToCart}
            className="w-full max-w-[200px] bg-transparent border border-gray-900 text-gray-900 py-4 text-sm font-medium uppercase tracking-[0.1em] hover:bg-gray-900 hover:text-white transition-colors self-start"
          >
            Add To Cart
          </button>
          
          <p className="text-xs text-gray-500 mt-2 italic max-w-sm">
            Taxes & Duties calculated at checkout. Ships in 2-3 weeks.
          </p>
        </div>
      </div>
    </div>
  );
}
