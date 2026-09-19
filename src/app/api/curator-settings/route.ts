import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.curatorSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await prisma.curatorSettings.create({
        data: {
          id: "singleton",
          visibility: {
            illustration: { showAudience: true, showTechnique: true, showCanvas: true, showSilhouette: true, showSize: true, showColor: true },
            embroidery: { showAudience: true, showTheme: true, showSilhouette: true, showSize: true, showColor: true },
            solid: { showAudience: true, showSilhouette: true, showSize: true, showColor: true },
          },
          canvasProductIds: [],
          silhouettes: [
            { id: "full", name: "Full sleeve shirt", type: "full" },
            { id: "half", name: "Half Sleeve Shirt", type: "half" }
          ]
        },
      });
    }

    // Fetch the actual canvas products
    let canvasProducts: any[] = [];
    if (settings.canvasProductIds && settings.canvasProductIds.length > 0) {
      canvasProducts = await prisma.product.findMany({
        where: { id: { in: settings.canvasProductIds } },
        select: { id: true, name: true, images: true }
      });
    }

    return NextResponse.json({ ...settings, canvasProducts });
  } catch (error) {
    console.error("Failed to fetch curator settings:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { visibility, canvasProductIds, silhouettes } = body;

    const settings = await prisma.curatorSettings.upsert({
      where: { id: "singleton" },
      update: {
        ...(visibility !== undefined && { visibility }),
        ...(canvasProductIds !== undefined && { canvasProductIds }),
        ...(silhouettes !== undefined && { silhouettes }),
      },
      create: {
        id: "singleton",
        visibility: visibility || {},
        canvasProductIds: canvasProductIds || [],
        silhouettes: silhouettes || [],
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update curator settings:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
