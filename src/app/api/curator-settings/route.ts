import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SILHOUETTES, DEFAULT_PRICING, DEFAULT_VISIBILITY, DEFAULT_MODES } from "@/lib/curatorDefaults";

export { DEFAULT_SILHOUETTES, DEFAULT_PRICING, DEFAULT_VISIBILITY, DEFAULT_MODES };

export async function GET() {
  try {
    let settings = null;
    try {
      settings = await prisma.curatorSettings.findUnique({
        where: { id: "singleton" },
      });
    } catch (dbError) {
      console.warn("DB connection failed in curator-settings GET, using fallback defaults:", dbError);
    }

    if (!settings) {
      return NextResponse.json({
        id: "singleton",
        visibility: DEFAULT_VISIBILITY,
        pricing: DEFAULT_PRICING,
        modes: DEFAULT_MODES,
        silhouettes: DEFAULT_SILHOUETTES,
        canvasProducts: [],
      });
    }

    const visibilityData = (settings.visibility as any) || {};
    const pricing = visibilityData.pricing || DEFAULT_PRICING;
    let silhouettes = settings.silhouettes as any[];
    if (!silhouettes || silhouettes.length === 0 || !silhouettes.some((s) => s.id === "cuban-collar" || s.id === "classic-point-collar")) {
      silhouettes = DEFAULT_SILHOUETTES;
    }

    const embroiderySilhouettes = (visibilityData.modes?.embroidery?.silhouettes || []).filter((id: string) =>
      silhouettes.some((s) => s.id === id)
    );

    const solidSilhouettes = (visibilityData.modes?.solid?.silhouettes || []).filter((id: string) =>
      silhouettes.some((s) => s.id === id)
    );

    const modes = {
      illustration: { ...DEFAULT_MODES.illustration, ...(visibilityData.modes?.illustration || {}) },
      embroidery: {
        ...DEFAULT_MODES.embroidery,
        ...(visibilityData.modes?.embroidery || {}),
        silhouettes: embroiderySilhouettes.length > 0 ? embroiderySilhouettes : DEFAULT_MODES.embroidery.silhouettes,
      },
      solid: {
        ...DEFAULT_MODES.solid,
        ...(visibilityData.modes?.solid || {}),
        silhouettes: solidSilhouettes.length > 0 ? solidSilhouettes : DEFAULT_MODES.solid.silhouettes,
      },
    };

    // Try fetching products if ids exist
    let canvasProducts: any[] = [];
    if (settings.canvasProductIds && settings.canvasProductIds.length > 0) {
      try {
        canvasProducts = await prisma.product.findMany({
          where: { id: { in: settings.canvasProductIds } },
          select: { id: true, name: true, images: true, price: true }
        });
      } catch (err) {
        console.warn("Failed fetching canvas products:", err);
      }
    }

    const cleanVisibility = {
      ...DEFAULT_VISIBILITY,
      ...(visibilityData.illustration ? { illustration: visibilityData.illustration } : {}),
      ...(visibilityData.embroidery ? { embroidery: visibilityData.embroidery } : {}),
      ...(visibilityData.solid ? { solid: visibilityData.solid } : {}),
    };

    return NextResponse.json({
      ...settings,
      visibility: cleanVisibility,
      pricing,
      modes,
      silhouettes,
      canvasProducts,
    });
  } catch (error) {
    console.error("Failed to fetch curator settings:", error);
    return NextResponse.json({
      id: "singleton",
      visibility: DEFAULT_VISIBILITY,
      pricing: DEFAULT_PRICING,
      modes: DEFAULT_MODES,
      silhouettes: DEFAULT_SILHOUETTES,
      canvasProducts: [],
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { visibility, canvasProductIds, silhouettes, pricing, modes } = body;

    // Merge pricing and modes into visibility payload to store seamlessly without schema alteration
    const mergedVisibility = {
      ...(visibility || {}),
      ...(pricing !== undefined && { pricing }),
      ...(modes !== undefined && { modes }),
    };

    try {
      const settings = await prisma.curatorSettings.upsert({
        where: { id: "singleton" },
        update: {
          visibility: mergedVisibility,
          ...(canvasProductIds !== undefined && { canvasProductIds }),
          ...(silhouettes !== undefined && { silhouettes }),
        },
        create: {
          id: "singleton",
          visibility: mergedVisibility,
          canvasProductIds: canvasProductIds || [],
          silhouettes: silhouettes || DEFAULT_SILHOUETTES,
        },
      });

      return NextResponse.json({
        ...settings,
        pricing: mergedVisibility.pricing || DEFAULT_PRICING,
        modes: mergedVisibility.modes || DEFAULT_MODES,
      });
    } catch (dbErr) {
      console.warn("Database save failed, returning updated JSON payload:", dbErr);
      return NextResponse.json({
        id: "singleton",
        visibility,
        pricing: pricing || DEFAULT_PRICING,
        modes: modes || DEFAULT_MODES,
        silhouettes: silhouettes || DEFAULT_SILHOUETTES,
        canvasProductIds: canvasProductIds || [],
      });
    }
  } catch (error) {
    console.error("Failed to update curator settings:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
