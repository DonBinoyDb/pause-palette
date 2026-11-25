import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        collection: true,
        categories: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { collectionId: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let genderList: string[] | undefined = Array.isArray(data.gender) ? data.gender : undefined;
    if ((!genderList || genderList.length === 0) && Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      const selectedCats = await prisma.category.findMany({
        where: { id: { in: data.categoryIds } },
        select: { slug: true, name: true }
      });
      const inferred: string[] = [];
      selectedCats.forEach((c) => {
        const s = (c.slug || c.name || "").toLowerCase();
        if (s.includes("men") && !s.includes("women") && !inferred.includes("MEN")) inferred.push("MEN");
        if (s.includes("women") && !inferred.includes("WOMEN")) inferred.push("WOMEN");
      });
      if (inferred.length > 0) {
        genderList = inferred;
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: parseFloat(data.price),
        ...(data.collectionId 
          ? { collection: { connect: { id: data.collectionId } } } 
          : existingProduct.collectionId 
             ? { collection: { disconnect: true } }
             : {}
        ),
        hasSilhouette: data.hasSilhouette ?? false,
        fits: data.fits || [],
        accordions: data.accordions || [],
        colors: data.colors || [],
        categories: {
          set: data.categoryIds?.map((id: string) => ({ id })) || []
        },
        ...(genderList !== undefined ? { gender: genderList } : {}),
        sizes: data.sizes || [],
        fitGuideDescription: data.fitGuideDescription || null,
        fitGuideImage: data.fitGuideImage || null,
        isPublished: data.isPublished,
        isNew: data.isNew ?? true,
        dispatchInfo: data.dispatchInfo !== undefined ? data.dispatchInfo : undefined,
        images: data.images || [],
        imageFit: data.imageFit !== undefined ? data.imageFit : undefined,
      },
    });

    if (data.isNew === true) {
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
        console.warn("[PRODUCTS_PUT] Could not prepend to new arrivals:", err);
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { 
        error: error?.message || "Failed to update product",
        details: String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
