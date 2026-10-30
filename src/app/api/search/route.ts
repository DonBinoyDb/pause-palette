import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ products: [], collections: [] });
    }

    const keywords = query.split(/\s+/).filter(Boolean);
    const upper = query.toUpperCase();
    const isGender = upper === "MEN" || upper === "WOMEN";

    // Build conditions for product matching
    const orConditions: any[] = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { collection: { name: { contains: query, mode: "insensitive" } } },
      { categories: { some: { name: { contains: query, mode: "insensitive" } } } },
    ];

    if (isGender) {
      orConditions.push({ gender: { has: upper } });
    }

    if (keywords.length > 1) {
      keywords.forEach((kw) => {
        orConditions.push(
          { name: { contains: kw, mode: "insensitive" } },
          { description: { contains: kw, mode: "insensitive" } },
          { collection: { name: { contains: kw, mode: "insensitive" } } },
          { categories: { some: { name: { contains: kw, mode: "insensitive" } } } }
        );
      });
    }

    const [products, collections] = await Promise.all([
      prisma.product.findMany({
        where: {
          isPublished: true,
          OR: orConditions,
        },
        include: {
          collection: { select: { id: true, name: true, slug: true } },
          categories: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.collection.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          coverImage: true,
          description: true,
        },
        take: 6,
      }),
    ]);

    return NextResponse.json({ products, collections });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
