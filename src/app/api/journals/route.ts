import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(journals);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch journals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const journal = await prisma.journal.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished,
      },
    });
    return NextResponse.json(journal, { status: 201 });
  } catch (error: any) {
    console.error("POST Journal Error:", error);
    return NextResponse.json({ error: "Failed to create journal", details: error.message, stack: error.stack }, { status: 500 });
  }
}
