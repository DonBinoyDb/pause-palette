import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(collections);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, coverImage } = body;

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        coverImage,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
