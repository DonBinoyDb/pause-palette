export const DEFAULT_SILHOUETTES = [
  {
    id: "classic-point-collar",
    name: "Classic Point Collar",
    basePrice: 500,
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
  },
  linenColors: [
    { id: "black", name: "Black", hex: "#1C1C1C", adjustment: 0 },
    { id: "olive", name: "Olive", hex: "#5E6738", adjustment: 100 },
    { id: "brown", name: "Brown", hex: "#6E473B", adjustment: 100 },
    { id: "beige", name: "Beige", hex: "#D8C7A5", adjustment: 0 },
    { id: "sage", name: "Sage", hex: "#8A9A86", adjustment: 200 },
  ],
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
