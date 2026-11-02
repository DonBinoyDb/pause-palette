import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.lookbookItem.findMany({
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lookbook items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Support batch creation for 5-image lookbook sets
    if (Array.isArray(data.items)) {
      const existingCount = await prisma.lookbookItem.count();
      const created = await prisma.$transaction(
        data.items.map((item: any, idx: number) =>
          prisma.lookbookItem.create({
            data: {
              title: item.title || null,
              imageUrl: item.imageUrl,
              linkUrl: item.linkUrl || null,
              orderIndex: typeof item.orderIndex === "number" ? item.orderIndex : existingCount + idx,
              isPublished: item.isPublished ?? true,
            },
          })
        )
      );
      return NextResponse.json(created);
    }

    // Single item creation
    const existingCount = await prisma.lookbookItem.count();
    const item = await prisma.lookbookItem.create({
      data: {
        title: data.title || null,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        orderIndex: typeof data.orderIndex === "number" ? data.orderIndex : existingCount,
        isPublished: data.isPublished ?? true,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to create lookbook item:", error);
    return NextResponse.json({ error: "Failed to create lookbook item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    }
    const ids = idsParam.split(",").filter(Boolean);
    await prisma.lookbookItem.deleteMany({
      where: { id: { in: ids } },
    });
    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error("Failed to delete lookbook items:", error);
    return NextResponse.json({ error: "Failed to delete lookbook items" }, { status: 500 });
  }
}
