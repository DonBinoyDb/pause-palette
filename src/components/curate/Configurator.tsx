"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useShop } from "@/context/ShopContext";
import { DEFAULT_MODES, DEFAULT_PRICING, DEFAULT_SILHOUETTES } from "@/lib/curatorDefaults";

type Mode = "illustration" | "embroidery" | "solid";
type Audience = "men" | "women";
type Technique = "printed" | "embroidered";
type Size = string;

function getSilhouetteSizes(
  sil: any,
  globalSizeValues?: Record<string, number>
) {
  if (sil?.sizes && Array.isArray(sil.sizes) && sil.sizes.length > 0) {
    return sil.sizes.map((s: any) => ({
      size: String(s.size),
      price: Number(s.price) || 0,
      enabled: s.enabled !== false,
    }));
  }
  const fallback = globalSizeValues || DEFAULT_PRICING.sizeValues;
  const base = Number(sil?.basePrice) || 500;
  return Object.entries(fallback).map(([sz, adj]) => ({
    size: sz,
    price: base + Number(adj || 0),
    enabled: true,
  }));
}

function getActiveSilhouetteSizes(
  sil: any,
  globalSizeValues?: Record<string, number>
) {
  return getSilhouetteSizes(sil, globalSizeValues).filter((s: any) => s.enabled);
}

function getSilhouettePriceForSize(
  sil: any,
  size: string,
  globalSizeValues?: Record<string, number>
): number {
  if (!sil) return 500;
  if (sil?.sizes && Array.isArray(sil.sizes) && sil.sizes.length > 0) {
    const found = sil.sizes.find((s: any) => s.size === size);
    if (found && typeof found.price === "number") {
      return Number(found.price);
    }
  }
  const base = Number(sil.basePrice) || 500;
  const adj = globalSizeValues?.[size] ?? 0;
  return base + Number(adj);
}

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
  const [showSizeGuide, setShowSizeGuide] = useState(false);

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

  const modes = settings?.modes || DEFAULT_MODES;
  const pricing = settings?.pricing || DEFAULT_PRICING;
  const silhouettes = (settings?.silhouettes?.length ? settings.silhouettes : DEFAULT_SILHOUETTES) as Array<{
    id: string;
    name: string;
    basePrice: number;
    svg: string;
    image?: string;
    sizes?: Array<{ size: string; price: number; enabled?: boolean }>;
  }>;
  const linenColors = (pricing.linenColors?.length ? pricing.linenColors : DEFAULT_PRICING.linenColors) as Array<{
    id: string;
    name: string;
    hex: string;
    adjustment: number;
  }>;

  // Filter silhouettes and colors based on active mode configuration
  const allowedSilIds = modes[mode]?.silhouettes as string[] | undefined;
  const filteredSilhouettes = allowedSilIds?.length
    ? silhouettes.filter((s) => allowedSilIds.includes(s.id))
    : silhouettes;

  const allowedColorIds = modes[mode]?.linenColors as string[] | undefined;
  const filteredLinenColors = allowedColorIds?.length
    ? linenColors.filter((c) => allowedColorIds.includes(c.id))
    : linenColors;

  // Sync selected piece when technique changes
  useEffect(() => {
    const list = technique === "printed" ? pricing.pieces?.printed : pricing.pieces?.embroidered;
    if (list && list.length > 0) {
      setSelectedPieceId(list[0].id);
    }
  }, [technique, pricing.pieces]);

  if (loading) {
    return <div className="py-24 text-center text-sm font-garamond text-gray-400 tracking-wider">Loading curator experience...</div>;
  }

  // Safe number parsing helper
  const safeNumber = (val: any, fallback = 0): number => {
    if (val === undefined || val === null || val === "") return fallback;
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  };

  // Helper to render silhouette icon whether it is uploaded image URL or SVG markup
  const renderSilhouetteIcon = (sil: any) => {
    const isUrl = sil?.image || (sil?.svg && (sil.svg.startsWith("http") || sil.svg.startsWith("/") || sil.svg.startsWith("data:")));
    if (isUrl) {
      return (
        <img
          src={sil.image || sil.svg}
          alt={sil.name}
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
      );
    }
    if (sil?.svg && sil.svg.includes("<svg")) {
      return (
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-gray-700"
          dangerouslySetInnerHTML={{ __html: sil.svg }}
        />
      );
    }
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-gray-400">
        <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
    );
  };

  // Active items
  const currentPieces = technique === "printed" ? pricing.pieces?.printed || [] : pricing.pieces?.embroidered || [];
  const activePiece = currentPieces.find((p: any) => p.id === selectedPieceId) || currentPieces[0] || {
    id: "default",
    name: "Selected Piece",
    basePrice: technique === "printed" ? 1800 : 2200,
    image: "/images/Coverpic1.jpeg",
  };

  const activeSilhouette = (filteredSilhouettes.find((s) => s.id === selectedSilhouetteId) || filteredSilhouettes[0] || silhouettes[0]) || {
    id: "classic-point-collar",
    name: "Classic Point Collar",
    basePrice: 500,
    svg: "",
  };

  const activeSilhouetteSizes = getActiveSilhouetteSizes(activeSilhouette, pricing.sizeValues);
  const availableSizes = activeSilhouetteSizes.map((s: any) => s.size);

  // Sync selected size if the currently chosen size is not available for this silhouette
  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(size)) {
      setSize(availableSizes[0]);
    }
  }, [selectedSilhouetteId, availableSizes, size]);

  const activeColor = (filteredLinenColors.find((c) => c.id === selectedColorId) || filteredLinenColors[0] || linenColors[0]) || {
    id: "black",
    name: "Black",
    hex: "#1C1C1C",
    adjustment: 0,
  };

  // Pricing calculations according to backend formula
  const techniqueVal = technique === "printed"
    ? safeNumber(pricing.techniqueValues?.printed, 200)
    : safeNumber(pricing.techniqueValues?.embroidered, 500);

  const silAndSizePrice = getSilhouettePriceForSize(activeSilhouette, size, pricing.sizeValues);
  const productBasePrice = safeNumber(activePiece.basePrice, technique === "printed" ? 1800 : 2200);
  const linenAdjustment = safeNumber(activeColor.adjustment, 0);

  let calculatedPrice = 0;

  if (mode === "illustration") {
    if (technique === "printed") {
      calculatedPrice = productBasePrice + techniqueVal + silAndSizePrice;
    } else {
      calculatedPrice = productBasePrice + techniqueVal + silAndSizePrice + linenAdjustment;
    }
  } else if (mode === "embroidery") {
    const baseEmbroideryFee = safeNumber(modes.embroidery?.startingPrice, 2000);
    calculatedPrice = baseEmbroideryFee + silAndSizePrice + linenAdjustment;
  } else if (mode === "solid") {
    const baseSolidPrice = safeNumber(modes.solid?.basePrice, 2000);
    calculatedPrice = baseSolidPrice + silAndSizePrice + linenAdjustment;
  }

  const handleAddToCart = () => {
    let productName = "";
    let imageSrc = activePiece.image || "/images/Coverpic1.jpeg";

    if (mode === "illustration") {
      productName = `Curated Piece (${activePiece.name})`;
    } else if (mode === "embroidery") {
      productName = `Curated Piece (Theme-Based Embroidery)`;
      imageSrc = "/images/needle.png";
    } else {
      productName = `Curated Piece (Solid Linen)`;
      imageSrc = "/images/solid_linen_shirt.jpg";
    }

    const isLinenApplicable = mode === "solid" || (mode === "illustration" && technique === "embroidered") || mode === "embroidery";
    const silhouetteDetail = isLinenApplicable ? `${activeSilhouette.name} | ${activeColor.name} Linen` : activeSilhouette.name;

    const curatedDetails = {
      isCurated: true,
      mode,
      modeTitle: mode === "illustration" ? "Original Illustration" : mode === "embroidery" ? "Theme-Based Embroidery" : "Solid Linen",
      audience: audience === "men" ? "Men" : "Women",
      technique: mode === "illustration" ? (technique === "printed" ? "Printed" : "Embroidered") : undefined,
      pieceName: mode === "illustration" ? activePiece.name : undefined,
      silhouetteName: activeSilhouette.name,
      size,
      colorName: isLinenApplicable ? activeColor.name : undefined,
      theme: mode === "embroidery" && themeText.trim() ? themeText.trim() : undefined,
    };

    addToCart({
      productId: `curated-${mode}-${Date.now()}`,
      name: productName,
      price: calculatedPrice,
      image: imageSrc,
      size,
      silhouette: silhouetteDetail,
      curatedDetails,
    });

    toast.success("Added your curated piece to cart!");
  };

  const handleShareTheme = () => {
    if (!themeText.trim()) {
      toast.error("Tell us about your theme, idea or inspiration...");
      return;
    }
    setThemeSubmitted(true);

    const curatedDetails = {
      isCurated: true,
      mode: "embroidery",
      modeTitle: "Theme-Based Embroidery",
      audience: audience === "men" ? "Men" : "Women",
      silhouetteName: activeSilhouette.name,
      size,
      colorName: activeColor.name,
      theme: themeText.trim(),
    };

    addToCart({
      productId: `curated-theme-${Date.now()}`,
      name: `Curated Piece (Theme-Based Embroidery)`,
      price: calculatedPrice,
      image: "/images/needle.png",
      size,
      silhouette: `${activeSilhouette.name} | ${activeColor.name} Linen | Theme: "${themeText.trim().slice(0, 50)}${themeText.length > 50 ? "..." : ""}"`,
      curatedDetails,
    });
    toast.success("Theme request submitted and added to cart!");
  };

  return (
    <div className="w-full flex flex-col font-garamond text-gray-900">
      
      {/* 3 Mode Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
        
        {/* 1. ORIGINAL ILLUSTRATION */}
        <button
          type="button"
          onClick={() => { setMode("illustration"); setThemeSubmitted(false); }}
          className={`relative flex flex-col items-center text-center p-6 rounded-md border transition-all cursor-pointer bg-white ${
            mode === "illustration"
              ? "border-[#79A7D3] ring-1 ring-[#79A7D3]"
              : "border-gray-200/90 hover:border-gray-300"
          }`}
        >
          <div className="h-24 flex items-center justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modes.illustration?.icon || "/images/flower.svg"}
              alt="Original Illustration"
              className="h-20 w-auto max-w-full object-contain"
            />
          </div>
          <h2 className="text-xs font-garamond font-semibold tracking-[0.14em] uppercase text-gray-900 mb-1.5">
            {modes.illustration?.title || "ORIGINAL ILLUSTRATION"}
          </h2>
          <p className="text-[11px] text-gray-500 font-garamond leading-relaxed">
            {modes.illustration?.description || "Begin with one of our existing Pause Palette designs and curate the piece through your preferred technique, silhouette, size and choice of collar, options."}
          </p>
        </button>

        {/* 2. THEME-BASED EMBROIDERY */}
        <button
          type="button"
          onClick={() => { setMode("embroidery"); setThemeSubmitted(false); }}
          className={`relative flex flex-col items-center text-center p-6 rounded-md border transition-all cursor-pointer bg-white ${
            mode === "embroidery"
              ? "border-[#79A7D3] ring-1 ring-[#79A7D3]"
              : "border-gray-200/90 hover:border-gray-300"
          }`}
        >
          <div className="h-24 flex items-center justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modes.embroidery?.icon || "/images/needle.png"}
              alt="Theme-based Embroidery"
              className="h-20 w-auto max-w-full object-contain"
            />
          </div>
          <h2 className="text-xs font-garamond font-semibold tracking-[0.14em] uppercase text-gray-900 mb-1.5">
            {modes.embroidery?.title || "THEME-BASED EMBROIDERY"}
          </h2>
          <p className="text-[11px] text-gray-500 font-garamond leading-relaxed">
            {modes.embroidery?.description || "Choose yarn to breathe into our available linen colour tone share the theme you'd like us to explore and interpret through embroidery."}
          </p>
        </button>

        {/* 3. SOLID LINEN */}
        <button
          type="button"
          onClick={() => { setMode("solid"); setThemeSubmitted(false); }}
          className={`relative flex flex-col items-center text-center p-6 rounded-md border transition-all cursor-pointer bg-white ${
            mode === "solid"
              ? "border-[#79A7D3] ring-1 ring-[#79A7D3]"
              : "border-gray-200/90 hover:border-gray-300"
          }`}
        >
          <div className="h-24 flex items-center justify-center mb-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[#7C9D86] absolute top-1.5 right-1.5" />
              <div className="w-6 h-6 rounded-full bg-[#B57864] absolute bottom-1.5 left-1.5" />
            </div>
          </div>
          <h2 className="text-xs font-garamond font-semibold tracking-[0.14em] uppercase text-gray-900 mb-1.5">
            {modes.solid?.title || "SOLID LINEN"}
          </h2>
          <p className="text-[11px] text-gray-500 font-garamond leading-relaxed">
            {modes.solid?.description || "Choose your preferred silhouette, size and exclusive linen shade to create a pure, unornamented expression of our 100% natural, soft, breathable Belgian flax."}
          </p>
        </button>

      </div>

      {/* Horizontal Divider */}
      <hr className="w-full border-t border-gray-200/90 mb-8" />

      {/* Left-aligned Editor Layout Area */}
      <div className="w-full flex flex-col items-start text-left">
        
        {/* Mode Heading */}
        <h3 className="text-xs font-garamond font-semibold tracking-[0.16em] uppercase text-gray-900 mb-6">
          {mode === "illustration" && "ORIGINAL ILLUSTRATION"}
          {mode === "embroidery" && "THEME-BASED EMBROIDERY"}
          {mode === "solid" && "SOLID LINEN"}
        </h3>

        {/* STEP: Who is it for? */}
        <div className="mb-6 w-full">
          <label className="block text-xs font-garamond font-medium text-gray-900 mb-0.5">
            Who is it for?
          </label>
          <p className="text-[11px] font-garamond italic text-gray-500 mb-2.5">
            Select the fit you're designing for
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAudience("men")}
              className={`px-6 py-1.5 rounded-sm border text-xs font-garamond tracking-wider transition-all cursor-pointer ${
                audience === "men"
                  ? "border-[#79A7D3] ring-1 ring-[#79A7D3] text-gray-900 bg-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
              }`}
            >
              Men
            </button>
            <button
              type="button"
              onClick={() => setAudience("women")}
              className={`px-6 py-1.5 rounded-sm border text-xs font-garamond tracking-wider transition-all cursor-pointer ${
                audience === "women"
                  ? "border-[#79A7D3] ring-1 ring-[#79A7D3] text-gray-900 bg-white"
                  : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
              }`}
            >
              Women
            </button>
          </div>
        </div>

        {/* STEP (Illustration only): Technique */}
        {mode === "illustration" && (
          <div className="mb-6 w-full">
            <label className="block text-xs font-garamond font-medium text-gray-900 mb-0.5">
              Technique
            </label>
            <p className="text-[11px] font-garamond italic text-gray-500 mb-2.5">
              Choose how the illustration is rendered
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTechnique("printed")}
                className={`px-6 py-1.5 rounded-sm border text-xs font-garamond tracking-wider transition-all cursor-pointer ${
                  technique === "printed"
                    ? "border-[#79A7D3] ring-1 ring-[#79A7D3] text-gray-900 bg-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                }`}
              >
                Printed
              </button>
              <button
                type="button"
                onClick={() => setTechnique("embroidered")}
                className={`px-6 py-1.5 rounded-sm border text-xs font-garamond tracking-wider transition-all cursor-pointer ${
                  technique === "embroidered"
                    ? "border-[#79A7D3] ring-1 ring-[#79A7D3] text-gray-900 bg-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                }`}
              >
                Embroidered
              </button>
            </div>
          </div>
        )}

        {/* STEP (Illustration only): Choose from our pieces */}
        {mode === "illustration" && (
          <div className="mb-6 w-full">
            <label className="block text-xs font-garamond font-medium text-gray-900 mb-0.5">
              Choose from our pieces
            </label>
            <p className="text-[11px] font-garamond italic text-gray-500 mb-2.5">
              Select an existing Pause Palette design
            </p>
            <div className="flex flex-wrap gap-3">
              {currentPieces.map((piece: any) => {
                const isSelected = selectedPieceId ? selectedPieceId === piece.id : activePiece.id === piece.id;
                return (
                  <button
                    key={piece.id}
                    type="button"
                    onClick={() => setSelectedPieceId(piece.id)}
                    className="flex flex-col items-start text-left cursor-pointer group"
                  >
                    <div
                      className={`relative w-20 sm:w-24 aspect-[3/4] rounded-sm overflow-hidden bg-gray-50 border transition-all ${
                        isSelected
                          ? "border-[#79A7D3] ring-1 ring-[#79A7D3]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {piece.image && (
                        <Image
                          src={piece.image}
                          alt={piece.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-garamond text-gray-700 mt-1.5 max-w-[88px] truncate leading-tight">
                      {piece.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP: Choose your Silhouette */}
        <div className="mb-6 w-full">
          <label className="block text-xs font-garamond font-medium text-gray-900 mb-0.5">
            Choose your Silhouette
          </label>
          <p className="text-[11px] font-garamond italic text-gray-500 mb-2.5">
            Every piece is cut and sewn to your chosen silhouette
          </p>
          <div className="flex flex-wrap gap-3">
            {(filteredSilhouettes.length ? filteredSilhouettes : silhouettes).map((sil) => {
              const isSelected = selectedSilhouetteId ? selectedSilhouetteId === sil.id : activeSilhouette.id === sil.id;
              const silActiveSizes = getActiveSilhouetteSizes(sil, pricing.sizeValues);
              const sizeSummary = silActiveSizes.map((s: any) => s.size).join(", ");
              return (
                <button
                  key={sil.id}
                  type="button"
                  onClick={() => setSelectedSilhouetteId(sil.id)}
                  className={`w-28 sm:w-32 h-36 sm:h-40 p-2.5 rounded-md border flex flex-col items-center justify-between text-center transition-all cursor-pointer bg-white ${
                    isSelected
                      ? "border-[#79A7D3] ring-1 ring-[#79A7D3]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex-1 w-full flex items-center justify-center p-1 text-gray-700">
                    {renderSilhouetteIcon(sil)}
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[11px] font-garamond text-gray-800 leading-tight">
                      {sil.name}
                    </span>
                    {sizeSummary && (
                      <span className="text-[9px] font-sans text-gray-400 mt-0.5 truncate max-w-full">
                        {sizeSummary}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP: Choose your Size */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-xs font-garamond font-medium text-gray-900">
              Choose your Size
            </label>
            {activeSilhouette && (
              <span className="text-[11px] font-garamond text-gray-500 italic">
                Available for {activeSilhouette.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((s: string) => {
                const sPrice = getSilhouettePriceForSize(activeSilhouette, s, pricing.sizeValues);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-8 h-8 px-2.5 rounded-sm border flex items-center justify-center text-xs font-garamond uppercase tracking-wider transition-all cursor-pointer ${
                      size === s
                        ? "border-[#79A7D3] ring-1 ring-[#79A7D3] text-gray-900 font-medium bg-white shadow-2xs"
                        : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                    }`}
                    title={`${s} (₹${sPrice})`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowSizeGuide(true)}
              className="text-xs text-gray-400 underline font-garamond hover:text-gray-800 transition-colors cursor-pointer"
            >
              Size guide
            </button>
          </div>
        </div>

        {/* STEP (Embroidery, Solid, or Embroidered Illustration): Choose your Linen colour */}
        {(mode === "embroidery" || mode === "solid" || (mode === "illustration" && technique === "embroidered")) && (
          <div className="mb-6 w-full">
            <label className="block text-xs font-garamond font-medium text-gray-900 mb-0.5">
              Choose your Linen colour
            </label>
            <p className="text-[11px] font-garamond italic text-gray-500 mb-2.5">
              Available in 100% pure Belgian linen
            </p>
            <div className="flex flex-wrap gap-5 items-center pt-0.5">
              {(filteredLinenColors.length ? filteredLinenColors : linenColors).map((color) => {
                const isSelected = selectedColorId ? selectedColorId === color.id : activeColor.id === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border transition-all ${
                        isSelected ? "ring-2 ring-offset-2 ring-[#79A7D3] scale-110" : "border-gray-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] font-garamond uppercase tracking-wider text-gray-600">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP (Embroidery only): Share your theme */}
        {mode === "embroidery" && (
          <div className="mb-6 w-full max-w-xl">
            <label className="block text-xs font-garamond font-medium text-gray-900 mb-0.5">
              Share your theme
            </label>
            <p className="text-[11px] font-garamond italic text-gray-500 mb-2">
              Tell us about your theme, idea or inspiration...
            </p>
            <div className="border border-gray-200 rounded-md p-3 focus-within:border-[#79A7D3] transition-colors bg-white">
              <textarea
                rows={4}
                value={themeText}
                onChange={(e) => setThemeText(e.target.value)}
                placeholder={modes.embroidery?.placeholder || "Tell us about your theme, idea or inspiration..."}
                className="w-full text-xs font-garamond outline-none resize-none placeholder-gray-400 text-gray-800 bg-transparent leading-relaxed"
              />
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleShareTheme}
                  disabled={themeSubmitted}
                  className="px-5 py-1.5 border border-gray-300 text-xs font-garamond uppercase tracking-wider text-gray-800 hover:border-gray-900 transition-colors rounded-sm cursor-pointer disabled:opacity-50"
                >
                  {themeSubmitted ? "Theme Submitted ✓" : "Share your theme"}
                </button>
              </div>
            </div>

            <p className="text-[11px] font-garamond text-gray-500 mt-2">
              Theme-based pieces start at ₹{calculatedPrice.toLocaleString()}+. Final pricing is confirmed after we discuss your embroidery design.
            </p>
            <p className="text-[11px] font-garamond italic text-gray-400 mt-1">
              Each piece is made to order. Please allow 10-14 days for crafting and dispatch.
            </p>
          </div>
        )}

        {/* STEP (Illustration & Solid): Your Piece Summary Card */}
        {(mode === "illustration" || mode === "solid") && (
          <div className="mt-4 mb-4 w-full">
            <label className="block text-xs font-garamond font-medium text-gray-900 mb-2">
              Your Piece
            </label>
            <div className="border border-gray-200 rounded-md p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center max-w-xl bg-white">
              {/* Left Preview: Active Silhouette Image */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-md border border-gray-200 flex items-center justify-center p-2 bg-white shrink-0 text-gray-800">
                {renderSilhouetteIcon(activeSilhouette)}
              </div>

              {/* Right specs */}
              <div className="flex-1 w-full text-xs font-garamond text-gray-700 space-y-1">
                <div className="grid grid-cols-[85px_1fr] gap-x-2">
                  <span className="text-gray-400">Audience</span>
                  <span className="capitalize">{audience}</span>
                </div>

                {mode === "illustration" && (
                  <>
                    <div className="grid grid-cols-[85px_1fr] gap-x-2">
                      <span className="text-gray-400">Technique</span>
                      <span className="capitalize">{technique}</span>
                    </div>
                    <div className="grid grid-cols-[85px_1fr] gap-x-2 items-center">
                      <span className="text-gray-400">Piece</span>
                      <span className="flex items-center gap-1.5">
                        {activePiece.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activePiece.image}
                            alt={activePiece.name}
                            className="w-4 h-4 rounded-full object-cover inline-block border border-gray-200"
                          />
                        )}
                        {activePiece.name}
                      </span>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-[85px_1fr] gap-x-2">
                  <span className="text-gray-400">Silhouette</span>
                  <span>{activeSilhouette.name}</span>
                </div>

                <div className="grid grid-cols-[85px_1fr] gap-x-2">
                  <span className="text-gray-400">Size</span>
                  <span>{size}</span>
                </div>

                {(mode === "solid" || (mode === "illustration" && technique === "embroidered")) && (
                  <div className="grid grid-cols-[85px_1fr] gap-x-2">
                    <span className="text-gray-400">Linen colour</span>
                    <span>{activeColor.name}</span>
                  </div>
                )}

                <div className="grid grid-cols-[85px_1fr] gap-x-2 pt-2 border-t border-gray-100 mt-2 font-medium text-gray-900 text-sm">
                  <span className="text-gray-500 font-normal text-xs">Price</span>
                  <span>₹ {calculatedPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Add to Cart button */}
            <div className="mt-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-2 border border-gray-300 text-xs font-garamond uppercase tracking-wider text-gray-800 hover:border-gray-900 transition-colors rounded-sm cursor-pointer"
              >
                Add to Cart
              </button>
            </div>

            {/* Dispatch notice */}
            <p className="text-[11px] font-garamond italic text-gray-400 mt-3">
              Each piece is made to order. Please allow 10-14 days for crafting and dispatch.
            </p>
          </div>
        )}

      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 text-lg cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-garamond text-xl font-medium tracking-wider uppercase text-gray-900 mb-2">
              Size Guide (Inches)
            </h3>
            <p className="text-xs text-gray-500 font-garamond mb-6">
              Our pieces feature a relaxed, comfortable silhouette. Refer to the garment dimensions below.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-garamond text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 pr-4">Size</th>
                    <th className="py-2.5 px-4">Chest</th>
                    <th className="py-2.5 px-4">Shoulder</th>
                    <th className="py-2.5 px-4">Length</th>
                    <th className="py-2.5 pl-4">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr><td className="py-2.5 pr-4 font-semibold">XS</td><td className="py-2.5 px-4">38"</td><td className="py-2.5 px-4">17.5"</td><td className="py-2.5 px-4">27.5"</td><td className="py-2.5 pl-4">9"</td></tr>
                  <tr><td className="py-2.5 pr-4 font-semibold">S</td><td className="py-2.5 px-4">40"</td><td className="py-2.5 px-4">18"</td><td className="py-2.5 px-4">28"</td><td className="py-2.5 pl-4">9.5"</td></tr>
                  <tr><td className="py-2.5 pr-4 font-semibold">M</td><td className="py-2.5 px-4">42"</td><td className="py-2.5 px-4">18.5"</td><td className="py-2.5 px-4">28.5"</td><td className="py-2.5 pl-4">10"</td></tr>
                  <tr><td className="py-2.5 pr-4 font-semibold">L</td><td className="py-2.5 px-4">44"</td><td className="py-2.5 px-4">19"</td><td className="py-2.5 px-4">29"</td><td className="py-2.5 pl-4">10.5"</td></tr>
                  <tr><td className="py-2.5 pr-4 font-semibold">XL</td><td className="py-2.5 px-4">46"</td><td className="py-2.5 px-4">19.5"</td><td className="py-2.5 px-4">29.5"</td><td className="py-2.5 pl-4">11"</td></tr>
                  <tr><td className="py-2.5 pr-4 font-semibold">XXL</td><td className="py-2.5 px-4">48"</td><td className="py-2.5 px-4">20"</td><td className="py-2.5 px-4">30"</td><td className="py-2.5 pl-4">11.5"</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-6 py-2 rounded-full bg-gray-900 text-white text-xs font-garamond uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
