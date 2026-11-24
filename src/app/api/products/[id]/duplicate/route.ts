import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const original = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!original) {
      return NextResponse.json(
        { success: false, message: "Original product not found" },
        { status: 404 }
      );
    }

    // Generate unique slug for the duplicate
    const baseSlug = `${original.slug}-copy`;
    let newSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: newSlug } })) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    // Create duplicate product with isPublished = false (Draft)
    const duplicate = await prisma.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        description: original.description,
        price: original.price,
        images: original.images || [],
        imageFit: original.imageFit || "cover",
        hasSilhouette: original.hasSilhouette,
        fits: (original.fits as any) || [],
        accordions: (original.accordions as any) || [],
        colors: (original.colors as any) || [],
        gender: original.gender || [],
        sizes: original.sizes || [],
        fitGuideDescription: original.fitGuideDescription,
        fitGuideImage: original.fitGuideImage,
        isPublished: false, // Always save as draft
        isNew: original.isNew,
        dispatchInfo: original.dispatchInfo,
        ...(original.collectionId
          ? { collection: { connect: { id: original.collectionId } } }
          : {}
        ),
        categories: {
          connect: original.categories.map((c) => ({ id: c.id })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product duplicated successfully as draft",
      product: duplicate,
    });
  } catch (error: any) {
    console.error("POST /api/products/[id]/duplicate error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to duplicate product" },
      { status: 500 }
    );
  }
}

