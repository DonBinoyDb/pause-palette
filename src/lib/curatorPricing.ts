import prisma from "@/lib/prisma";
import { DEFAULT_PRICING, DEFAULT_SILHOUETTES } from "@/lib/curatorDefaults";

export async function calculateCuratedItemPrice(curatedDetails: any): Promise<number> {
  try {
    const settings = await prisma.curatorSettings.findUnique({
      where: { id: "singleton" },
    });

    const visibilityData = (settings?.visibility as any) || {};
    const pricing = visibilityData.pricing || DEFAULT_PRICING;
    const silhouettes = (settings?.silhouettes as any[]) || DEFAULT_SILHOUETTES;

    const silhouetteId = curatedDetails?.silhouetteId;
    const size = curatedDetails?.size || "M";
    const mode = curatedDetails?.mode || "embroidery";
    const fabric = curatedDetails?.fabric;

    // Find silhouette
    const silhouette = silhouettes.find((s: any) => s.id === silhouetteId) || silhouettes[0];
    let price = silhouette?.basePrice || 1299;

    // Size adjustment
    const sizeObj = silhouette?.sizes?.find((s: any) => s.size === size);
    if (sizeObj && typeof sizeObj.price === "number") {
      price = sizeObj.price;
    }

    // Fabric adjustment if defined
    if (fabric && pricing?.fabrics?.[fabric]) {
      price += Number(pricing.fabrics[fabric]);
    }

    // Mode adjustment if applicable
    if (mode === "embroidery" && pricing?.embroideryAddon) {
      price += Number(pricing.embroideryAddon);
    }

    return Math.max(1, Math.round(price));
  } catch (err) {
    console.error("Error calculating curated price:", err);
    return 1299; // Fallback sensible default
  }
}
