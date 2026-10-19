import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const DEFAULT_HERO_DATA = {
  title: "illustrated stories\nfor slow living.",
  subtitle: "Thoughtfully designed pieces that carry\nart, colour and character.",
  buttonText: "EXPLORE COLLECTIONS",
  buttonLink: "/collections",
  mediaItems: [
    { id: "slide-1", type: "image", src: "/images/cover.jpeg" },
    { id: "slide-2", type: "image", src: "/images/Coverpic1.jpeg" },
    { id: "slide-3", type: "image", src: "/images/coverpic2.jpg" },
    { id: "slide-4", type: "video", src: "/images/cover-video.av1.mp4" },
  ],
};

export async function GET() {
  try {
    const hero = await prisma.heroBanner.findUnique({
      where: { id: "singleton" },
    });

    if (!hero) {
      return NextResponse.json(DEFAULT_HERO_DATA);
    }

    const media = Array.isArray(hero.mediaItems) && (hero.mediaItems as any[]).length > 0
      ? hero.mediaItems
      : DEFAULT_HERO_DATA.mediaItems;

    return NextResponse.json({
      title: hero.title || DEFAULT_HERO_DATA.title,
      subtitle: hero.subtitle || DEFAULT_HERO_DATA.subtitle,
      buttonText: hero.buttonText || DEFAULT_HERO_DATA.buttonText,
      buttonLink: hero.buttonLink || DEFAULT_HERO_DATA.buttonLink,
      mediaItems: media,
      updatedAt: hero.updatedAt,
    });
  } catch (error) {
    console.error("[HERO_GET_ERROR]", error);
    return NextResponse.json(DEFAULT_HERO_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, buttonText, buttonLink, mediaItems } = body;

    const updated = await prisma.heroBanner.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        title: typeof title === "string" ? title : DEFAULT_HERO_DATA.title,
        subtitle: typeof subtitle === "string" ? subtitle : DEFAULT_HERO_DATA.subtitle,
        buttonText: typeof buttonText === "string" ? buttonText : DEFAULT_HERO_DATA.buttonText,
        buttonLink: typeof buttonLink === "string" ? buttonLink : DEFAULT_HERO_DATA.buttonLink,
        mediaItems: Array.isArray(mediaItems) ? mediaItems : DEFAULT_HERO_DATA.mediaItems,
      },
      update: {
        title: typeof title === "string" ? title : undefined,
        subtitle: typeof subtitle === "string" ? subtitle : undefined,
        buttonText: typeof buttonText === "string" ? buttonText : undefined,
        buttonLink: typeof buttonLink === "string" ? buttonLink : undefined,
        mediaItems: Array.isArray(mediaItems) ? mediaItems : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[HERO_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to save hero banner settings" },
      { status: 500 }
    );
  }
}
