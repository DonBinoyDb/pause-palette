export type SilhouetteMeasurement = {
  size: string;
  chest: string;
  shoulder: string;
  length: string;
  sleeve: string;
};

export const DEFAULT_SILHOUETTE_MEASUREMENTS: Record<string, SilhouetteMeasurement[]> = {
  "classic-point-collar": [
    { size: "XS", chest: "38\"", shoulder: "17.5\"", length: "27.5\"", sleeve: "9\"" },
    { size: "S", chest: "40\"", shoulder: "18\"", length: "28\"", sleeve: "9.5\"" },
    { size: "M", chest: "42\"", shoulder: "18.5\"", length: "28.5\"", sleeve: "10\"" },
    { size: "L", chest: "44\"", shoulder: "19\"", length: "29\"", sleeve: "10.5\"" },
    { size: "XL", chest: "46\"", shoulder: "19.5\"", length: "29.5\"", sleeve: "11\"" },
    { size: "XXL", chest: "48\"", shoulder: "20\"", length: "30\"", sleeve: "11.5\"" },
  ],
  "cuban-collar": [
    { size: "XS", chest: "39\"", shoulder: "18\"", length: "26.5\"", sleeve: "9\"" },
    { size: "S", chest: "41\"", shoulder: "18.5\"", length: "27\"", sleeve: "9.5\"" },
    { size: "M", chest: "43\"", shoulder: "19\"", length: "27.5\"", sleeve: "10\"" },
    { size: "L", chest: "45\"", shoulder: "19.5\"", length: "28\"", sleeve: "10.5\"" },
    { size: "XL", chest: "47\"", shoulder: "20\"", length: "28.5\"", sleeve: "11\"" },
    { size: "XXL", chest: "49\"", shoulder: "20.5\"", length: "29\"", sleeve: "11.5\"" },
  ],
  "mandarin-collar": [
    { size: "XS", chest: "38\"", shoulder: "17.5\"", length: "27.5\"", sleeve: "9\"" },
    { size: "S", chest: "40\"", shoulder: "18\"", length: "28\"", sleeve: "9.5\"" },
    { size: "M", chest: "42\"", shoulder: "18.5\"", length: "28.5\"", sleeve: "10\"" },
    { size: "L", chest: "44\"", shoulder: "19\"", length: "29\"", sleeve: "10.5\"" },
    { size: "XL", chest: "46\"", shoulder: "19.5\"", length: "29.5\"", sleeve: "11\"" },
    { size: "XXL", chest: "48\"", shoulder: "20\"", length: "30\"", sleeve: "11.5\"" },
  ],
};

export const DEFAULT_SILHOUETTES = [
  {
    id: "classic-point-collar",
    name: "Classic Point Collar",
    basePrice: 500,
    fitDescription: "Tailored relaxed fit with structured point collar. Features a gently curved shirttail hem suitable for tucking or wearing loose.",
    measurements: DEFAULT_SILHOUETTE_MEASUREMENTS["classic-point-collar"],
    sizes: [
      { size: "XS", price: 400, enabled: true },
      { size: "S", price: 500, enabled: true },
      { size: "M", price: 500, enabled: true },
      { size: "L", price: 600, enabled: true },
      { size: "XL", price: 700, enabled: true },
      { size: "XXL", price: 800, enabled: true },
    ],
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-current">
  <path d="M30 20 L40 28 L50 22 L60 28 L70 20 L85 36 L75 44 L70 34 L70 88 L30 88 L30 34 L25 44 L15 36 Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 22 L50 88" stroke-width="1" stroke-dasharray="1 3"/>
  <path d="M38 20 L50 32 L40 28 Z" fill="currentColor" fill-opacity="0.08" stroke-width="1.5"/>
  <path d="M62 20 L50 32 L60 28 Z" fill="currentColor" fill-opacity="0.08" stroke-width="1.5"/>
  <circle cx="50" cy="40" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="52" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="64" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="76" r="1.2" fill="currentColor"/>
</svg>`
  },
  {
    id: "cuban-collar",
    name: "Cuban Collar",
    basePrice: 600,
    fitDescription: "Relaxed boxy cut with an open notch resort collar. Designed with a clean straight hem and wider chest allowance for effortless drape.",
    measurements: DEFAULT_SILHOUETTE_MEASUREMENTS["cuban-collar"],
    sizes: [
      { size: "XS", price: 500, enabled: true },
      { size: "S", price: 600, enabled: true },
      { size: "M", price: 600, enabled: true },
      { size: "L", price: 700, enabled: true },
      { size: "XL", price: 800, enabled: true },
      { size: "XXL", price: 900, enabled: true },
    ],
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-current">
  <path d="M28 22 L40 30 L50 38 L60 30 L72 22 L86 38 L76 46 L70 36 L70 88 L30 88 L30 36 L24 46 L14 38 Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M38 22 L46 29 L38 34 Z" fill="currentColor" fill-opacity="0.08" stroke-width="1.5"/>
  <path d="M62 22 L54 29 L62 34 Z" fill="currentColor" fill-opacity="0.08" stroke-width="1.5"/>
  <path d="M50 42 L50 88" stroke-width="1" stroke-dasharray="1 3"/>
  <circle cx="50" cy="50" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="62" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="74" r="1.2" fill="currentColor"/>
</svg>`
  },
  {
    id: "mandarin-collar",
    name: "Mandarin Collar",
    basePrice: 700,
    fitDescription: "Clean architectural cut with a standing band collar. Minimalist silhouette with an understated drape and classic hem.",
    measurements: DEFAULT_SILHOUETTE_MEASUREMENTS["mandarin-collar"],
    sizes: [
      { size: "XS", price: 600, enabled: true },
      { size: "S", price: 700, enabled: true },
      { size: "M", price: 700, enabled: true },
      { size: "L", price: 800, enabled: true },
      { size: "XL", price: 900, enabled: true },
      { size: "XXL", price: 1000, enabled: true },
    ],
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-current">
  <path d="M36 22 C36 19 64 19 64 22 L84 36 L75 44 L70 34 L70 88 L30 88 L30 34 L25 44 L16 36 Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 20 C40 18 60 18 60 20 L58 24 C50 26 50 26 42 24 Z" fill="currentColor" fill-opacity="0.08" stroke-width="1.5"/>
  <path d="M50 25 L50 88" stroke-width="1" stroke-dasharray="1 3"/>
  <circle cx="50" cy="34" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="46" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="58" r="1.2" fill="currentColor"/>
  <circle cx="50" cy="70" r="1.2" fill="currentColor"/>
</svg>`
  }
];

export type LinenColorSwatch = {
  id: string;
  name: string;
  hex: string;
  adjustment: number;
  image?: string;
};

export const DEFAULT_PRICING = {
  techniqueValues: {
    printed: 200,
    embroidered: 500,
  },
  sizeValues: {
    XS: -100,
    S: 0,
    M: 0,
    L: 100,
    XL: 200,
    XXL: 300,
  },
  linenColors: [
    { id: "black", name: "Black", hex: "#1C1C1C", adjustment: 0, image: "" },
    { id: "olive", name: "Olive", hex: "#5E6738", adjustment: 100, image: "" },
    { id: "brown", name: "Brown", hex: "#6E473B", adjustment: 100, image: "" },
    { id: "beige", name: "Beige", hex: "#D8C7A5", adjustment: 0, image: "" },
    { id: "sage", name: "Sage", hex: "#8A9A86", adjustment: 200, image: "" },
  ] as LinenColorSwatch[],
  pieces: {
    printed: [
      { id: "tropical-dawn", name: "Tropical Dawn", basePrice: 1800, image: "/images/Coverpic1.jpeg" },
      { id: "tropical-sky", name: "Tropical Sky", basePrice: 1800, image: "/images/coverpic2.jpg" },
      { id: "amsterdam-reverie", name: "Amsterdam Reverie", basePrice: 1800, image: "/images/cover.jpeg" },
    ],
    embroidered: [
      { id: "quiet-corner", name: "Quiet Corner", basePrice: 2200, image: "/images/in_wild_bloom.png" },
      { id: "tale-from-the-dunes", name: "Tale from the Dunes", basePrice: 2200, image: "/images/midnight_moss.png" },
      { id: "the-journey-beyond", name: "The Journey Beyond", basePrice: 2200, image: "/images/sage_and_soil.png" },
    ],
  },
};

export const DEFAULT_VISIBILITY = {
  illustration: { showAudience: true, showTechnique: true, showCanvas: true, showSilhouette: true, showSize: true, showColor: true },
  embroidery: { showAudience: true, showTheme: true, showSilhouette: true, showSize: true, showColor: true },
  solid: { showAudience: true, showSilhouette: true, showSize: true, showColor: true },
};

export const DEFAULT_MODES = {
  illustration: {
    enabled: true,
    title: "ORIGINAL ILLUSTRATION",
    description: "Begin with one of our existing Pause Palette designs and curate the piece through your preferred technique, silhouette, size and choice of collar, options.",
    icon: "/images/flower.svg",
    techniques: {
      printed: { enabled: true, value: 200 },
      embroidered: { enabled: true, value: 500 },
    },
    silhouettes: ["classic-point-collar", "cuban-collar", "mandarin-collar"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  embroidery: {
    enabled: true,
    title: "THEME-BASED EMBROIDERY",
    description: "Your idea, our illustration",
    icon: "/images/needle.png",
    startingPrice: 2000,
    placeholder: "Tell us about your theme, idea or inspiration...",
    reviewNotice: "Final embroidery/design charge will be confirmed after review.",
    customerNote: "(Customer sees only this starting price)",
    silhouettes: ["classic-point-collar", "cuban-collar", "mandarin-collar"],
    linenColors: ["black", "olive", "brown", "beige", "sage"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  solid: {
    enabled: true,
    title: "SOLID LINEN",
    subtitle: "No print, no embroidery",
    description: "Choose your preferred silhouette, size and available linen shade to create a pure, understated piece in one of our meticulously crafted European linens.",
    icon: "",
    basePrice: 2000,
    silhouettes: ["classic-point-collar", "cuban-collar", "mandarin-collar"],
    linenColors: ["black", "olive", "brown", "beige", "sage"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
};

export type SilhouetteSizeOption = {
  size: string;
  price: number;
  enabled?: boolean;
};

export function getSilhouetteSizes(
  sil: any,
  globalSizeValues?: Record<string, number>
): SilhouetteSizeOption[] {
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

export function getActiveSilhouetteSizes(
  sil: any,
  globalSizeValues?: Record<string, number>
): SilhouetteSizeOption[] {
  return getSilhouetteSizes(sil, globalSizeValues).filter((s) => s.enabled);
}

export function getSilhouettePriceForSize(
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

export function getSilhouetteMeasurements(sil: any): SilhouetteMeasurement[] {
  if (sil?.measurements && Array.isArray(sil.measurements) && sil.measurements.length > 0) {
    return sil.measurements;
  }
  if (sil?.id && DEFAULT_SILHOUETTE_MEASUREMENTS[sil.id]) {
    return DEFAULT_SILHOUETTE_MEASUREMENTS[sil.id];
  }
  return DEFAULT_SILHOUETTE_MEASUREMENTS["classic-point-collar"];
}

export function getSilhouetteFitDescription(sil: any): string {
  if (sil?.fitDescription && typeof sil.fitDescription === "string" && sil.fitDescription.trim()) {
    return sil.fitDescription.trim();
  }
  if (sil?.id === "cuban-collar") {
    return "Relaxed boxy cut with an open notch resort collar. Designed with a clean straight hem and wider chest allowance for effortless drape.";
  }
  if (sil?.id === "mandarin-collar") {
    return "Clean architectural cut with a standing band collar. Minimalist silhouette with an understated drape and classic hem.";
  }
  return "Tailored relaxed fit with structured point collar. Features a gently curved shirttail hem suitable for tucking or wearing loose.";
}

export function normalizeLinenColors(colors: any[]): LinenColorSwatch[] {
  if (!Array.isArray(colors) || colors.length === 0) {
    return DEFAULT_PRICING.linenColors;
  }

  const defaultMap = new Map<string, LinenColorSwatch>(
    DEFAULT_PRICING.linenColors.map((c) => [c.id, c])
  );

  return colors.map((c: any, index: number) => {
    const rawId = typeof c?.id === "string" && c.id.trim()
      ? c.id.trim().toLowerCase()
      : `color-${index}-${Date.now()}`;
    const defaultColor = defaultMap.get(rawId);

    // Fallback logic: ONLY fall back to default image when c.image is strictly undefined.
    // If c.image is an empty string (""), the user/admin intentionally removed the image.
    let image: string = "";
    if (typeof c?.image === "string") {
      image = c.image.trim();
    } else if (c?.image === undefined && defaultColor?.image) {
      image = defaultColor.image;
    }

    return {
      id: rawId,
      name: typeof c?.name === "string" && c.name.trim() ? c.name.trim() : (defaultColor?.name || "Custom"),
      hex: typeof c?.hex === "string" && c.hex.trim() ? c.hex.trim() : (defaultColor?.hex || "#CCCCCC"),
      adjustment: typeof c?.adjustment === "number" && !isNaN(c.adjustment) ? Number(c.adjustment) : (defaultColor?.adjustment ?? 0),
      image,
    };
  });
}


