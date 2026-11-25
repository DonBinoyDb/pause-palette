import prisma from "@/lib/prisma";
import {
  DEFAULT_PRICING,
  DEFAULT_SILHOUETTES,
  DEFAULT_MODES,
  getSilhouettePriceForSize,
  normalizeLinenColors,
  LinenColorSwatch,
} from "@/lib/curatorDefaults";

function safeNumber(val: any, fallback: number): number {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export async function resolveCuratedItem(curatedDetails: any) {
  try {
    const settings = await prisma.curatorSettings.findUnique({
      where: { id: "singleton" },
    });

    const visibilityData = (settings?.visibility as any) || {};
    const pricing = visibilityData.pricing || DEFAULT_PRICING;
    const modes = visibilityData.modes || DEFAULT_MODES;
    const silhouettes = (settings?.silhouettes as any[]) || DEFAULT_SILHOUETTES;
    const linenColors: LinenColorSwatch[] = normalizeLinenColors(pricing.linenColors || []);

    const mode = String(curatedDetails?.mode || "embroidery").toLowerCase();
    const size = String(curatedDetails?.size || "M");
    const silhouetteId = curatedDetails?.silhouetteId;
    const colorId = curatedDetails?.colorId;
    const colorName = curatedDetails?.colorName;

    // Resolve silhouette
    const silhouette = silhouettes.find((s: any) => s.id === silhouetteId) || silhouettes[0] || DEFAULT_SILHOUETTES[0];
    const silAndSizePrice = getSilhouettePriceForSize(silhouette, size, pricing.sizeValues);

    // Resolve linen color swatch from server settings
    let matchedColor: LinenColorSwatch | undefined;
    if (colorId) {
      matchedColor = linenColors.find((c) => c.id === colorId);
    }
    if (!matchedColor && colorName) {
      matchedColor = linenColors.find((c) => c.name.toLowerCase() === colorName.toLowerCase());
    }

    const isLinenApplicable =
      mode === "solid" ||
      mode === "embroidery" ||
      (mode === "illustration" && curatedDetails?.technique?.toLowerCase() === "embroidered");

    const colorAdjustment = isLinenApplicable && matchedColor ? safeNumber(matchedColor.adjustment, 0) : 0;

    let price = 0;
    if (mode === "illustration") {
      const isPrinted = curatedDetails?.technique?.toLowerCase() === "printed";
      const techniqueVal = isPrinted
        ? safeNumber(pricing.techniqueValues?.printed, 200)
        : safeNumber(pricing.techniqueValues?.embroidered, 500);

      const pieceList = isPrinted ? pricing.pieces?.printed : pricing.pieces?.embroidered;
      const matchedPiece =
        pieceList?.find((p: any) => p.name === curatedDetails?.pieceName || p.id === curatedDetails?.pieceId) ||
        pieceList?.[0];
      const productBasePrice = safeNumber(matchedPiece?.basePrice, isPrinted ? 1800 : 2200);

      price = productBasePrice + techniqueVal + silAndSizePrice + (isPrinted ? 0 : colorAdjustment);
    } else if (mode === "solid") {
      const baseSolidPrice = safeNumber(modes.solid?.basePrice, 2000);
      price = baseSolidPrice + silAndSizePrice + colorAdjustment;
    } else {
      // mode === "embroidery"
      const baseEmbroideryFee = safeNumber(modes.embroidery?.startingPrice, 2000);
      price = baseEmbroideryFee + silAndSizePrice + colorAdjustment;
    }

    const verifiedPrice = Math.max(1, Math.round(price));

    // Construct server-frozen snapshot
    const frozenDetails = {
      ...(curatedDetails || {}),
      isCurated: true,
      mode,
      silhouetteId: silhouette?.id,
      silhouetteName: silhouette?.name || curatedDetails?.silhouetteName,
      size,
      colorId: isLinenApplicable && matchedColor ? matchedColor.id : (curatedDetails?.colorId || null),
      colorName: isLinenApplicable && matchedColor ? matchedColor.name : (curatedDetails?.colorName || null),
      colorHex: isLinenApplicable && matchedColor ? matchedColor.hex : (curatedDetails?.colorHex || null),
      colorImage: isLinenApplicable && matchedColor?.image ? matchedColor.image : (curatedDetails?.colorImage || null),
      colorAdjustment,
      verifiedPrice,
    };

    return { verifiedPrice, frozenDetails };
  } catch (err) {
    console.error("Error resolving curated item:", err);
    return {
      verifiedPrice: 1299,
      frozenDetails: { ...(curatedDetails || {}), isCurated: true },
    };
  }
}

export async function calculateCuratedItemPrice(curatedDetails: any): Promise<number> {
  const result = await resolveCuratedItem(curatedDetails);
  return result.verifiedPrice;
}
