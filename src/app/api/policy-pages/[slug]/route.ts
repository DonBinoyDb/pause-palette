import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POLICY_PAGE_DEFAULTS, PolicyPageData } from "@/lib/policyDefaults";

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const defaultData: PolicyPageData | undefined = POLICY_PAGE_DEFAULTS[slug];

    if (!defaultData) {
      return NextResponse.json(
        { success: false, message: "Policy page not found" },
        { status: 404 }
      );
    }

    const page = prisma.policyPage?.findUnique
      ? await prisma.policyPage.findUnique({
          where: { id: slug },
        })
      : null;

    if (!page) {
      return NextResponse.json(defaultData);
    }

    return NextResponse.json({
      id: page.id,
      title: page.title || defaultData.title,
      introText: page.introText ?? defaultData.introText,
      introItalic: page.introItalic ?? defaultData.introItalic,
      sections: Array.isArray(page.sections) && page.sections.length > 0
        ? page.sections
        : defaultData.sections,
      footerNote: page.footerNote ?? defaultData.footerNote,
      footerItalic: page.footerItalic ?? defaultData.footerItalic,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error("[POLICY_PAGE_GET_ERROR]", error);
    const { slug } = await props.params;
    const defaultData = POLICY_PAGE_DEFAULTS[slug];
    if (defaultData) {
      return NextResponse.json(defaultData);
    }
    return NextResponse.json(
      { success: false, message: "Error fetching policy page" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const defaultData: PolicyPageData | undefined = POLICY_PAGE_DEFAULTS[slug];

    if (!defaultData) {
      return NextResponse.json(
        { success: false, message: "Policy page not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.reset) {
      const resetRecord = await prisma.policyPage.upsert({
        where: { id: slug },
        create: {
          id: slug,
          title: defaultData.title,
          introText: defaultData.introText,
          introItalic: defaultData.introItalic,
          sections: defaultData.sections as any,
          footerNote: defaultData.footerNote,
          footerItalic: defaultData.footerItalic,
        },
        update: {
          title: defaultData.title,
          introText: defaultData.introText,
          introItalic: defaultData.introItalic,
          sections: defaultData.sections as any,
          footerNote: defaultData.footerNote,
          footerItalic: defaultData.footerItalic,
        },
      });
      return NextResponse.json({ success: true, data: resetRecord, isReset: true });
    }

    const { title, introText, introItalic, sections, footerNote, footerItalic } = body;

    const cleanSections = Array.isArray(sections)
      ? sections.map((sec, idx) => ({
          id: sec.id || `section-${idx + 1}`,
          title: typeof sec.title === "string" ? sec.title : "",
          content: typeof sec.content === "string" ? sec.content : "",
        }))
      : defaultData.sections;

    const updated = await prisma.policyPage.upsert({
      where: { id: slug },
      create: {
        id: slug,
        title: typeof title === "string" && title.trim() ? title.trim() : defaultData.title,
        introText: typeof introText === "string" ? introText : defaultData.introText,
        introItalic: typeof introItalic === "boolean" ? introItalic : defaultData.introItalic,
        sections: cleanSections as any,
        footerNote: typeof footerNote === "string" ? footerNote : "",
        footerItalic: typeof footerItalic === "boolean" ? footerItalic : defaultData.footerItalic,
      },
      update: {
        title: typeof title === "string" && title.trim() ? title.trim() : defaultData.title,
        introText: typeof introText === "string" ? introText : "",
        introItalic: typeof introItalic === "boolean" ? introItalic : false,
        sections: cleanSections as any,
        footerNote: typeof footerNote === "string" ? footerNote : "",
        footerItalic: typeof footerItalic === "boolean" ? footerItalic : false,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[POLICY_PAGE_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to save policy page settings" },
      { status: 500 }
    );
  }
}
