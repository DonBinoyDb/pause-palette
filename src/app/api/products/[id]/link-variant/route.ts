import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { variant } = await request.json();

    if (!variant || !variant.name) {
      return NextResponse.json({ error: "Invalid variant payload" }, { status: 400 });
    }

    const targetProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, colors: true },
    });

    if (!targetProduct) {
      return NextResponse.json({ error: "Target product not found" }, { status: 404 });
    }

    const existingColors = Array.isArray(targetProduct.colors)
      ? (targetProduct.colors as any[])
      : [];

    // Avoid duplicate variant names
    const alreadyExists = existingColors.some(
      (c) =>
        c.name?.toLowerCase() === variant.name.toLowerCase() ||
        (variant.existingProductId && c.existingProductId === variant.existingProductId)
    );

    if (!alreadyExists) {
      const updatedColors = [
        ...existingColors,
        {
          name: variant.name,
          hex: variant.hex || "#000000",
          images: variant.images || [],
          existingProductId: variant.existingProductId,
          productSlug: variant.productSlug,
        },
      ];

      await prisma.product.update({
        where: { id },
        data: { colors: updatedColors },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LINK_VARIANT_POST]", error);
    return NextResponse.json({ error: "Failed to link variant" }, { status: 500 });
  }
}
