import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const journal = await prisma.journal.findUnique({ where: { id } });
    if (!journal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(journal);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const journal = await prisma.journal.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished,
      },
    });
    return NextResponse.json(journal);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update journal" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.journal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete journal" }, { status: 500 });
  }
}
