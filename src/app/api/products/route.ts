import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");

    const products = await prisma.product.findMany({
      where: collectionId ? { collectionId } : undefined,
      include: {
        collection: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, price, images, hasSilhouette, fits, accordions, colors, categoryIds, sizes, collectionId, isPublished, isNew, fitGuideDescription, fitGuideImage } = body;

    if (!name || !slug || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        images: images || [],
        hasSilhouette: hasSilhouette || false,
        fits: fits || [],
        accordions: accordions || [],
        colors: colors || [],
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || []
        },
        sizes: sizes || [],
        fitGuideDescription: fitGuideDescription || null,
        fitGuideImage: fitGuideImage || null,
        isPublished: isPublished || false,
        isNew: isNew ?? true,
        ...(collectionId ? { collection: { connect: { id: collectionId } } } : {})
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
