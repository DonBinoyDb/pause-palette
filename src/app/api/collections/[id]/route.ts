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
    const { name, slug, description, coverImage } = body;

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        coverImage,
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
