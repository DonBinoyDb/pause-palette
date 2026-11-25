import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true, name: true, images: true },
        },
      },
    });

    if (!collection) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTION_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, coverImage, images } = body;

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    const imageArray = Array.isArray(images)
      ? images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
      : undefined;

    const effectiveCover = imageArray !== undefined
      ? (imageArray.length > 0 ? imageArray[0] : null)
      : coverImage;

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        coverImage: effectiveCover,
        ...(imageArray !== undefined ? { images: imageArray } : {}),
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTION_PUT]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTION_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
