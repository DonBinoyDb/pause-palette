"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useShop } from "@/context/ShopContext";
import { DEFAULT_PRICING, DEFAULT_SILHOUETTES } from "@/lib/curatorDefaults";

type Mode = "illustration" | "embroidery" | "solid";
type Audience = "men" | "women";
type Technique = "printed" | "embroidered";
type Size = "XS" | "S" | "M" | "L" | "XL";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];

export default function Configurator() {
  const { addToCart } = useShop();

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User selections
  const [mode, setMode] = useState<Mode>("illustration");
  const [audience, setAudience] = useState<Audience>("men");
  const [technique, setTechnique] = useState<Technique>("printed");
  const [selectedPieceId, setSelectedPieceId] = useState<string>("");
  const [selectedSilhouetteId, setSelectedSilhouetteId] = useState<string>("");
  const [size, setSize] = useState<Size>("M");
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [themeText, setThemeText] = useState("");
  const [themeSubmitted, setThemeSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/curator-settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        const silList = data.silhouettes?.length ? data.silhouettes : DEFAULT_SILHOUETTES;
        if (silList.length > 0) setSelectedSilhouetteId(silList[0].id);

        const pricing = data.pricing || DEFAULT_PRICING;
        if (pricing.linenColors?.length > 0) setSelectedColorId(pricing.linenColors[0].id);

        const initialPieces = technique === "printed" ? pricing.pieces?.printed : pricing.pieces?.embroidered;
        if (initialPieces?.length > 0) setSelectedPieceId(initialPieces[0].id);
      })
      .catch((err) => {
        console.error("Error loading settings, fallback to defaults", err);
        setSelectedSilhouetteId(DEFAULT_SILHOUETTES[0].id);
        setSelectedColorId(DEFAULT_PRICING.linenColors[0].id);
        setSelectedPieceId(DEFAULT_PRICING.pieces.printed[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const pricing = settings?.pricing || DEFAULT_PRICING;
  const silhouettes = (settings?.silhouettes?.length ? settings.silhouettes : DEFAULT_SILHOUETTES) as Array<{
    id: string;
    name: string;
    basePrice: number;
    svg: string;
  }>;
  const linenColors = (pricing.linenColors?.length ? pricing.linenColors : DEFAULT_PRICING.linenColors) as Array<{
    id: string;
    name: string;
    hex: string;
    adjustment: number;
  }>;

  // Sync selected piece when technique changes
  useEffect(() => {
    const list = technique === "printed" ? pricing.pieces?.printed : pricing.pieces?.embroidered;
    if (list && list.length > 0) {
      setSelectedPieceId(list[0].id);
    }
  }, [technique, pricing.pieces]);

  if (loading) {
    return <div className="py-24 text-center text-sm font-sans text-gray-400 tracking-wider">Loading curator experience...</div>;
  }

  // Active items
  const currentPieces = technique === "printed" ? pricing.pieces?.printed || [] : pricing.pieces?.embroidered || [];
  const selectedPiece = currentPieces.find((p: any) => p.id === selectedPieceId) || currentPieces[0] || {
    id: "default",
    name: "Selected Piece",
    basePrice: technique === "printed" ? 1800 : 2200,
    image: "/images/Coverpic1.jpeg",
  };

  const selectedSilhouette = silhouettes.find((s) => s.id === selectedSilhouetteId) || silhouettes[0] || {
    id: "classic-point-collar",
    name: "Classic Point Collar",
    basePrice: 500,
    svg: "",
  };

  const selectedColor = linenColors.find((c) => c.id === selectedColorId) || linenColors[0] || {
    id: "black",
    name: "Black",
    hex: "#1C1C1C",
    adjustment: 0,
  };

  // Pricing calculations according to backend formula (customers only see final result)
  const techniqueVal = technique === "printed" ? (pricing.techniqueValues?.printed ?? 200) : (pricing.techniqueValues?.embroidered ?? 500);
  const sizeVal = pricing.sizeValues?.[size] ?? 0;
  const silBasePrice = Number(selectedSilhouette.basePrice) || 500;
  const productBasePrice = Number(selectedPiece.basePrice) || (technique === "printed" ? 1800 : 2200);
  const linenAdjustment = Number(selectedColor.adjustment) || 0;

  // Formulas
  let calculatedPrice = 0;
  let isStartingPrice = false;

  if (mode === "illustration") {
    if (technique === "printed") {
      // Final Price = Product Base Price + Technique Value + Silhouette Base Price + Size Value
      calculatedPrice = productBasePrice + techniqueVal + silBasePrice + sizeVal;
    } else {
      // Final Price = Product Base Price + Technique Value + Silhouette Base Price + Size Value + Linen Colour Value
      calculatedPrice = productBasePrice + techniqueVal + silBasePrice + sizeVal + linenAdjustment;
    }
  } else if (mode === "embroidery") {
    // Starting Price = Silhouette Base Price + Size Value + Linen Colour Value
    calculatedPrice = silBasePrice + sizeVal + linenAdjustment;
    isStartingPrice = true;
  } else if (mode === "solid") {
    // Final Price = Silhouette Base Price + Size Value + Linen Colour Value
    calculatedPrice = silBasePrice + sizeVal + linenAdjustment;
  }

  // Theme theme badge theme colors
  const badgeColors: Record<Mode, { bg: string; text: string; headerBg: string; activeBorder: string }> = {
    illustration: {
      bg: "bg-[#C4745E]",
      text: "text-white",
      headerBg: "bg-[#FDF7F5] border-[#F0DED8]",
      activeBorder: "border-[#C4745E]",
    },
    embroidery: {
      bg: "bg-[#5E836A]",
      text: "text-white",
      headerBg: "bg-[#F4F8F5] border-[#DAE8DC]",
      activeBorder: "border-[#5E836A]",
    },
    solid: {
      bg: "bg-[#5D7E8C]",
      text: "text-white",
      headerBg: "bg-[#F3F7F9] border-[#DCE7EB]",
      activeBorder: "border-[#5D7E8C]",
    },
  };

  const handleAddToCart = () => {
    let productName = "";
    let imageSrc = selectedPiece.image || "/images/Coverpic1.jpeg";

    if (mode === "illustration") {
      productName = `${audience === "men" ? "Men's" : "Women's"} Shirt (${selectedPiece.name}) - ${selectedSilhouette.name}`;
    } else if (mode === "embroidery") {
      productName = `${audience === "men" ? "Men's" : "Women's"} Custom Embroidery Shirt - ${selectedSilhouette.name}`;
      imageSrc = "/images/art1.svg";
    } else {
      productName = `${audience === "men" ? "Men's" : "Women's"} Solid Linen Shirt (${selectedColor.name}) - ${selectedSilhouette.name}`;
      imageSrc = "/images/Coverpic1.jpeg";
    }

    addToCart({
      productId: `curated-${mode}-${Date.now()}`,
      name: productName,
      price: calculatedPrice,
      image: imageSrc,
      size,
      silhouette: `${selectedSilhouette.name} | ${selectedColor.name} Linen`,
    });

    toast.success("Added your curated piece to cart!");
  };

  const handleShareTheme = () => {
    if (!themeText.trim()) {
      toast.error("Please share your theme idea or inspiration.");
      return;
    }
    setThemeSubmitted(true);
    toast.success("Thank you! Your theme request has been submitted for review.");
  };

  return (
    <div className="w-full flex flex-col font-sans text-gray-900">
      
      {/* 3 Main Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full">
        
        {/* 1. ORIGINAL ILLUSTRATION */}
        <button
          onClick={() => { setMode("illustration"); setThemeSubmitted(false); }}
          className={`relative flex flex-col items-center text-center p-8 rounded-xl border transition-all text-left group ${
            mode === "illustration"
              ? "border-[#C4745E] bg-[#FCF8F6] shadow-md ring-1 ring-[#C4745E]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          <div className="h-20 flex items-center justify-center mb-4">
            {/* Flower Illustration SVG */}
            <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="18" rx="6" ry="6" fill="#F2A65A" fillOpacity="0.8" />
              <circle cx="18" cy="14" r="5" fill="#E57373" fillOpacity="0.85" />
              <circle cx="30" cy="14" r="5" fill="#E57373" fillOpacity="0.85" />
              <circle cx="24" cy="10" r="5" fill="#F48FB1" fillOpacity="0.85" />
              <circle cx="24" cy="18" r="3.5" fill="#FFE082" />
              <path d="M24 24 L24 44" stroke="#4E7C59" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 32 C20 30 16 32 15 36 C19 36 23 34 24 32 Z" fill="#66BB6A" />
              {/* Ceramic Vase */}
              <path d="M19 44 L29 44 L31 58 L17 58 Z" fill="#2E7D32" rx="2" />
            </svg>
          </div>
          <h2 className="text-sm font-serif font-bold tracking-[0.18em] uppercase text-gray-900 mb-1">
            ORIGINAL ILLUSTRATION
          </h2>
          <p className="text-xs text-gray-500 font-sans tracking-wide">
            Use our existing illustrations
          </p>
        </button>

        {/* 2. THEME-BASED EMBROIDERY */}
        <button
          onClick={() => { setMode("embroidery"); setThemeSubmitted(false); }}
          className={`relative flex flex-col items-center text-center p-8 rounded-xl border transition-all text-left group ${
            mode === "embroidery"
              ? "border-[#5E836A] bg-[#F5F8F6] shadow-md ring-1 ring-[#5E836A]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          <div className="h-20 flex items-center justify-center mb-4">
            {/* Needle & Thread SVG */}
            <svg width="50" height="64" viewBox="0 0 50 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M38 10 L16 54" stroke="#222" strokeWidth="2" strokeLinecap="round" />
              <circle cx="36" cy="14" r="1.5" fill="white" />
              <path d="M37 13 C45 6 48 20 40 24 C32 28 20 36 22 46 C24 54 36 50 34 42" stroke="#B87333" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
            </svg>
          </div>
          <h2 className="text-sm font-serif font-bold tracking-[0.18em] uppercase text-gray-900 mb-1">
            THEME-BASED EMBROIDERY
          </h2>
          <p className="text-xs text-gray-500 font-sans tracking-wide">
            Your idea, our illustration
          </p>
        </button>

        {/* 3. SOLID LINEN */}
        <button
          onClick={() => { setMode("solid"); setThemeSubmitted(false); }}
          className={`relative flex flex-col items-center text-center p-8 rounded-xl border transition-all text-left group ${
            mode === "solid"
              ? "border-[#5D7E8C] bg-[#F4F7F9] shadow-md ring-1 ring-[#5D7E8C]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          <div className="h-20 flex flex-col items-center justify-center gap-2 mb-4">
            {/* Color Swatch Circles */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-[#5E6738] shadow-sm"></div>
              <div className="w-7 h-7 rounded-full bg-[#B87333] shadow-sm"></div>
            </div>
          </div>
          <h2 className="text-sm font-serif font-bold tracking-[0.18em] uppercase text-gray-900 mb-1">
            SOLID LINEN
          </h2>
          <p className="text-xs text-gray-500 font-sans tracking-wide">
            No print, no embroidery
          </p>
        </button>

      </div>

      {/* Main Flow Form Area */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-10">

        {/* ========================================================
            BRANCH 1: ORIGINAL ILLUSTRATION
           ======================================================== */}
        {mode === "illustration" && (
          <div className="flex flex-col gap-10">
            
            {/* STEP 1: Who is it for? */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  1
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Who is it for?
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-9">
                <button
                  type="button"
                  onClick={() => setAudience("men")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    audience === "men"
                      ? "border-[#C4745E] bg-[#C4745E]/10 text-[#C4745E] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("women")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    audience === "women"
                      ? "border-[#C4745E] bg-[#C4745E]/10 text-[#C4745E] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Women
                </button>
              </div>
            </section>

            {/* STEP 2: Technique */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  2
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Technique
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-9">
                <button
                  type="button"
                  onClick={() => setTechnique("printed")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    technique === "printed"
                      ? "border-[#C4745E] bg-[#C4745E]/10 text-[#C4745E] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Printed
                </button>
                <button
                  type="button"
                  onClick={() => setTechnique("embroidered")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    technique === "embroidered"
                      ? "border-[#C4745E] bg-[#C4745E]/10 text-[#C4745E] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Embroidered
                </button>
              </div>
            </section>

            {/* STEP 3: Choose from our pieces */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  3
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose from our pieces
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 pl-9">
                {currentPieces.map((piece: any) => {
                  const isSelected = selectedPieceId === piece.id;
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      onClick={() => setSelectedPieceId(piece.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center group ${
                        isSelected
                          ? "border-[#C4745E] bg-[#FCF8F6] ring-1 ring-[#C4745E]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="relative w-full aspect-[4/5] rounded overflow-hidden bg-gray-100">
                        {piece.image && (
                          <Image
                            src={piece.image}
                            alt={piece.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <span className="text-xs font-medium uppercase text-gray-800 truncate w-full mt-1">
                        {piece.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 4: Choose your Silhouette */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  4
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Silhouette
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 pl-9">
                {silhouettes.map((sil) => {
                  const isSelected = selectedSilhouetteId === sil.id;
                  return (
                    <button
                      key={sil.id}
                      type="button"
                      onClick={() => setSelectedSilhouetteId(sil.id)}
                      className={`flex flex-col items-center justify-between p-4 rounded-lg border h-44 transition-all text-center group ${
                        isSelected
                          ? "border-[#C4745E] bg-[#FCF8F6] ring-1 ring-[#C4745E]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-1 w-full flex items-center justify-center p-2 text-gray-700">
                        <div
                          className="w-20 h-20"
                          dangerouslySetInnerHTML={{ __html: sil.svg }}
                        />
                      </div>
                      <span className="text-xs font-medium uppercase text-gray-800 leading-tight">
                        {sil.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 5: Choose your Size */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  5
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Size
                </h3>
              </div>
              <div className="flex gap-3 pl-9">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-md border flex items-center justify-center text-xs font-bold transition-all ${
                      size === s
                        ? "border-[#C4745E] bg-[#C4745E] text-white shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 6 (Embroidered only): Choose your Linen colour */}
            {technique === "embroidered" && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                    6
                  </span>
                  <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                    Choose your Linen colour
                  </h3>
                </div>
                <div className="flex gap-6 pl-9">
                  {linenColors.map((color) => {
                    const isSelected = selectedColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColorId(color.id)}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div
                          className={`w-9 h-9 rounded-full border-2 transition-all shadow-sm ${
                            isSelected ? "border-[#C4745E] scale-110 ring-2 ring-[#C4745E]/30" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-700">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* STEP 6 (Printed) or STEP 7 (Embroidered): Your Piece */}
            <section className="flex flex-col gap-4 mt-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.illustration.bg} ${badgeColors.illustration.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  {technique === "printed" ? 6 : 7}
                </span>
                <h3 className="text-sm font-bold tracking-wide uppercase text-gray-900">
                  Your Piece
                </h3>
              </div>

              <div className="pl-9">
                <div className="p-6 md:p-8 rounded-xl border border-gray-200 bg-[#FAF9F7] flex flex-col md:flex-row gap-8 items-center">
                  
                  {/* Left: Product Image */}
                  <div className="w-40 h-48 relative rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm shrink-0">
                    {selectedPiece.image && (
                      <Image
                        src={selectedPiece.image}
                        alt={selectedPiece.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Right: Specifications & Final Price */}
                  <div className="flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-gray-900 mb-3">
                        {audience === "men" ? "Men's Shirt" : "Women's Shirt"}
                      </h4>

                      <div className="grid grid-cols-[110px_1fr] gap-y-1.5 text-xs text-gray-700 font-sans">
                        <span className="text-gray-400 uppercase">Technique:</span>
                        <span className="capitalize font-medium">{technique}</span>

                        <span className="text-gray-400 uppercase">Product:</span>
                        <span className="font-medium">{selectedPiece.name}</span>

                        <span className="text-gray-400 uppercase">Silhouette:</span>
                        <span className="font-medium">{selectedSilhouette.name}</span>

                        <span className="text-gray-400 uppercase">Size:</span>
                        <span className="font-medium">{size}</span>

                        {technique === "embroidered" && (
                          <>
                            <span className="text-gray-400 uppercase">Linen colour:</span>
                            <span className="font-medium">{selectedColor.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Final Price Block */}
                    <div className="mt-6 pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
                          Final Price (Auto calculated)
                        </span>
                        <span className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                          ₹{calculatedPrice.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="py-3 px-8 rounded-md bg-gray-900 text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
                      >
                        Add To Cart
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================
            BRANCH 2: THEME-BASED EMBROIDERY
           ======================================================== */}
        {mode === "embroidery" && (
          <div className="flex flex-col gap-10">

            {/* STEP 1: Who is it for? */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.embroidery.bg} ${badgeColors.embroidery.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  1
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Who is it for?
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-9">
                <button
                  type="button"
                  onClick={() => setAudience("men")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    audience === "men"
                      ? "border-[#5E836A] bg-[#5E836A]/10 text-[#5E836A] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("women")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    audience === "women"
                      ? "border-[#5E836A] bg-[#5E836A]/10 text-[#5E836A] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Women
                </button>
              </div>
            </section>

            {/* STEP 2: Choose your Silhouette */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.embroidery.bg} ${badgeColors.embroidery.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  2
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Silhouette
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 pl-9">
                {silhouettes.map((sil) => {
                  const isSelected = selectedSilhouetteId === sil.id;
                  return (
                    <button
                      key={sil.id}
                      type="button"
                      onClick={() => setSelectedSilhouetteId(sil.id)}
                      className={`flex flex-col items-center justify-between p-4 rounded-lg border h-44 transition-all text-center group ${
                        isSelected
                          ? "border-[#5E836A] bg-[#F5F8F6] ring-1 ring-[#5E836A]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-1 w-full flex items-center justify-center p-2 text-gray-700">
                        <div
                          className="w-20 h-20"
                          dangerouslySetInnerHTML={{ __html: sil.svg }}
                        />
                      </div>
                      <span className="text-xs font-medium uppercase text-gray-800 leading-tight">
                        {sil.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 3: Choose your Size */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.embroidery.bg} ${badgeColors.embroidery.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  3
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Size
                </h3>
              </div>
              <div className="flex gap-3 pl-9">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-md border flex items-center justify-center text-xs font-bold transition-all ${
                      size === s
                        ? "border-[#5E836A] bg-[#5E836A] text-white shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 4: Choose your Linen colour */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.embroidery.bg} ${badgeColors.embroidery.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  4
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Linen colour
                </h3>
              </div>
              <div className="flex gap-6 pl-9">
                {linenColors.map((color) => {
                  const isSelected = selectedColorId === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColorId(color.id)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`w-9 h-9 rounded-full border-2 transition-all shadow-sm ${
                          isSelected ? "border-[#5E836A] scale-110 ring-2 ring-[#5E836A]/30" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-700">
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 5: Share your theme */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.embroidery.bg} ${badgeColors.embroidery.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  5
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Share your theme
                </h3>
              </div>
              <div className="pl-9">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={themeText}
                    onChange={(e) => setThemeText(e.target.value)}
                    placeholder="Tell us about your theme, idea or inspiration..."
                    className="w-full p-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#5E836A] focus:ring-1 focus:ring-[#5E836A] resize-none"
                  />
                  <span className="absolute bottom-3 right-4 text-[10px] uppercase text-gray-400">
                    Max 300 Words
                  </span>
                </div>
              </div>
            </section>

            {/* STEP 6: Submit Request */}
            <section className="flex flex-col gap-4 mt-2 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.embroidery.bg} ${badgeColors.embroidery.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  6
                </span>
                <h3 className="text-sm font-bold tracking-wide uppercase text-gray-900">
                  Submit Request
                </h3>
              </div>
              <div className="pl-9 flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 bg-[#F5F8F6]">
                <button
                  type="button"
                  onClick={handleShareTheme}
                  disabled={themeSubmitted}
                  className="w-full max-w-sm py-4 rounded-md bg-[#5E836A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#4D6F58] transition-colors shadow-sm mb-6"
                >
                  {themeSubmitted ? "Theme Submitted ✓" : "Share Your Theme"}
                </button>

                <span className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                  Starting Price (Auto calculated)
                </span>
                <span className="font-serif text-3xl font-bold text-gray-900 mb-2">
                  ₹{calculatedPrice.toLocaleString()}+
                </span>
                <p className="text-xs text-gray-500 italic max-w-md">
                  (Customer sees only this starting price)
                  <br />
                  Final embroidery/design charge will be confirmed after review.
                </p>
              </div>
            </section>

          </div>
        )}

        {/* ========================================================
            BRANCH 3: SOLID LINEN
           ======================================================== */}
        {mode === "solid" && (
          <div className="flex flex-col gap-10">

            {/* STEP 1: Who is it for? */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.solid.bg} ${badgeColors.solid.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  1
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Who is it for?
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-9">
                <button
                  type="button"
                  onClick={() => setAudience("men")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    audience === "men"
                      ? "border-[#5D7E8C] bg-[#5D7E8C]/10 text-[#5D7E8C] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("women")}
                  className={`py-3.5 px-6 rounded-md border text-xs font-semibold uppercase tracking-wider transition-all ${
                    audience === "women"
                      ? "border-[#5D7E8C] bg-[#5D7E8C]/10 text-[#5D7E8C] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  Women
                </button>
              </div>
            </section>

            {/* STEP 2: Choose your Silhouette */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.solid.bg} ${badgeColors.solid.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  2
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Silhouette
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 pl-9">
                {silhouettes.map((sil) => {
                  const isSelected = selectedSilhouetteId === sil.id;
                  return (
                    <button
                      key={sil.id}
                      type="button"
                      onClick={() => setSelectedSilhouetteId(sil.id)}
                      className={`flex flex-col items-center justify-between p-4 rounded-lg border h-44 transition-all text-center group ${
                        isSelected
                          ? "border-[#5D7E8C] bg-[#F4F7F9] ring-1 ring-[#5D7E8C]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-1 w-full flex items-center justify-center p-2 text-gray-700">
                        <div
                          className="w-20 h-20"
                          dangerouslySetInnerHTML={{ __html: sil.svg }}
                        />
                      </div>
                      <span className="text-xs font-medium uppercase text-gray-800 leading-tight">
                        {sil.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 3: Choose your Size */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.solid.bg} ${badgeColors.solid.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  3
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Size
                </h3>
              </div>
              <div className="flex gap-3 pl-9">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-md border flex items-center justify-center text-xs font-bold transition-all ${
                      size === s
                        ? "border-[#5D7E8C] bg-[#5D7E8C] text-white shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 4: Choose your Linen colour */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.solid.bg} ${badgeColors.solid.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  4
                </span>
                <h3 className="text-sm font-medium tracking-wide uppercase text-gray-800">
                  Choose your Linen colour
                </h3>
              </div>
              <div className="flex gap-6 pl-9">
                {linenColors.map((color) => {
                  const isSelected = selectedColorId === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColorId(color.id)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`w-9 h-9 rounded-full border-2 transition-all shadow-sm ${
                          isSelected ? "border-[#5D7E8C] scale-110 ring-2 ring-[#5D7E8C]/30" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-gray-700">
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STEP 5: Your Piece */}
            <section className="flex flex-col gap-4 mt-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full ${badgeColors.solid.bg} ${badgeColors.solid.text} flex items-center justify-center text-xs font-bold shrink-0`}>
                  5
                </span>
                <h3 className="text-sm font-bold tracking-wide uppercase text-gray-900">
                  Your Piece
                </h3>
              </div>

              <div className="pl-9">
                <div className="p-6 md:p-8 rounded-xl border border-gray-200 bg-[#F4F7F9] flex flex-col md:flex-row gap-8 items-center">
                  
                  {/* Left: Solid Linen Color Preview / Shirt */}
                  <div className="w-40 h-48 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0 flex items-center justify-center p-4" style={{ backgroundColor: selectedColor.hex }}>
                    <div className="w-24 h-24 text-white opacity-80" dangerouslySetInnerHTML={{ __html: selectedSilhouette.svg }} />
                  </div>

                  {/* Right: Specifications & Final Price */}
                  <div className="flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-gray-900 mb-3">
                        {audience === "men" ? "Men's Shirt" : "Women's Shirt"}
                      </h4>

                      <div className="grid grid-cols-[110px_1fr] gap-y-1.5 text-xs text-gray-700 font-sans">
                        <span className="text-gray-400 uppercase">Technique:</span>
                        <span className="font-medium">-</span>

                        <span className="text-gray-400 uppercase">Product:</span>
                        <span className="font-medium">Solid Linen</span>

                        <span className="text-gray-400 uppercase">Silhouette:</span>
                        <span className="font-medium">{selectedSilhouette.name}</span>

                        <span className="text-gray-400 uppercase">Size:</span>
                        <span className="font-medium">{size}</span>

                        <span className="text-gray-400 uppercase">Linen colour:</span>
                        <span className="font-medium">{selectedColor.name}</span>
                      </div>
                    </div>

                    {/* Final Price Block */}
                    <div className="mt-6 pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
                          Final Price (Auto calculated)
                        </span>
                        <span className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
                          ₹{calculatedPrice.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="py-3 px-8 rounded-md bg-gray-900 text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
                      >
                        Add To Cart
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  );
}
