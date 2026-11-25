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
    const { name, slug, description, price, images, imageFit, hasSilhouette, fits, accordions, colors, categoryIds, sizes, collectionId, isPublished, isNew, fitGuideDescription, fitGuideImage, dispatchInfo } = body;

    if (!name || !slug || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let genderList: string[] = Array.isArray(body.gender) ? body.gender : [];
    if (genderList.length === 0 && Array.isArray(categoryIds) && categoryIds.length > 0) {
      const selectedCats = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { slug: true, name: true }
      });
      selectedCats.forEach((c) => {
        const s = (c.slug || c.name || "").toLowerCase();
        if (s.includes("men") && !s.includes("women") && !genderList.includes("MEN")) genderList.push("MEN");
        if (s.includes("women") && !genderList.includes("WOMEN")) genderList.push("WOMEN");
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        images: images || [],
        imageFit: imageFit || "cover",
        hasSilhouette: hasSilhouette || false,
        fits: fits || [],
        accordions: accordions || [],
        colors: colors || [],
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || []
        },
        gender: genderList,
        sizes: sizes || [],
        fitGuideDescription: fitGuideDescription || null,
        fitGuideImage: fitGuideImage || null,
        isPublished: isPublished || false,
        isNew: isNew ?? true,
        dispatchInfo: dispatchInfo || "Thoughtfully made to order - Dispatches in 12-15 business days.",
        ...(collectionId ? { collection: { connect: { id: collectionId } } } : {})
      },
    });

    // Automatically place newly created product first in New Arrivals
    if (isNew !== false) {
      try {
        const settings = await prisma.newArrivalsSettings.findUnique({ where: { id: "singleton" } });
        if (settings) {
          const currentIds = (settings.productIds || []).filter((id: string) => id !== product.id);
          await prisma.newArrivalsSettings.update({
            where: { id: "singleton" },
            data: {
              productIds: [product.id, ...currentIds]
            }
          });
        }
      } catch (err) {
        console.warn("[PRODUCTS_POST] Could not prepend to new arrivals:", err);
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
