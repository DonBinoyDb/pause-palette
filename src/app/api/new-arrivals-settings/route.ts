import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_NEW_ARRIVALS_DATA } from "@/lib/newArrivalsDefaults";

export async function GET() {
  try {
    const settings = prisma.newArrivalsSettings?.findUnique
      ? await prisma.newArrivalsSettings.findUnique({
          where: { id: "singleton" },
        })
      : null;

    if (!settings) {
      return NextResponse.json(DEFAULT_NEW_ARRIVALS_DATA);
    }

    return NextResponse.json({
      isEnabled: settings.isEnabled ?? true,
      tagline: settings.tagline || DEFAULT_NEW_ARRIVALS_DATA.tagline,
      title: settings.title ?? "",
      subtitle: settings.subtitle ?? "",
      buttonText: settings.buttonText || DEFAULT_NEW_ARRIVALS_DATA.buttonText,
      buttonLink: settings.buttonLink || DEFAULT_NEW_ARRIVALS_DATA.buttonLink,
      limit: typeof settings.limit === "number" ? settings.limit : DEFAULT_NEW_ARRIVALS_DATA.limit,
      productIds: Array.isArray(settings.productIds) ? settings.productIds : [],
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("[NEW_ARRIVALS_GET_ERROR]", error);
    return NextResponse.json(DEFAULT_NEW_ARRIVALS_DATA);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      isEnabled,
      tagline,
      title,
      subtitle,
      buttonText,
      buttonLink,
      limit,
      productIds,
    } = body;

    if (!prisma.newArrivalsSettings?.upsert) {
      return NextResponse.json(
        { success: false, message: "NewArrivalsSettings model not ready. Please restart server." },
        { status: 500 }
      );
    }

    const updated = await prisma.newArrivalsSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        isEnabled: typeof isEnabled === "boolean" ? isEnabled : true,
        tagline: typeof tagline === "string" ? tagline : DEFAULT_NEW_ARRIVALS_DATA.tagline,
        title: typeof title === "string" ? title : "",
        subtitle: typeof subtitle === "string" ? subtitle : "",
        buttonText: typeof buttonText === "string" ? buttonText : DEFAULT_NEW_ARRIVALS_DATA.buttonText,
        buttonLink: typeof buttonLink === "string" ? buttonLink : DEFAULT_NEW_ARRIVALS_DATA.buttonLink,
        limit: typeof limit === "number" ? limit : DEFAULT_NEW_ARRIVALS_DATA.limit,
        productIds: Array.isArray(productIds) ? productIds : [],
      },
      update: {
        isEnabled: typeof isEnabled === "boolean" ? isEnabled : true,
        tagline: typeof tagline === "string" ? tagline : undefined,
        title: typeof title === "string" ? title : undefined,
        subtitle: typeof subtitle === "string" ? subtitle : undefined,
        buttonText: typeof buttonText === "string" ? buttonText : undefined,
        buttonLink: typeof buttonLink === "string" ? buttonLink : undefined,
        limit: typeof limit === "number" ? limit : undefined,
        productIds: Array.isArray(productIds) ? productIds : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[NEW_ARRIVALS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to save new arrivals settings" },
      { status: 500 }
    );
  }
}
