import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FALLBACK_DIR = path.join(process.cwd(), "src", "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "contactSettings.json");

const DEFAULT_SETTINGS = {
  whatsappNumber: "917907629021",
  supportEmail: "pausepalette@gmail.com",
  instagramUrl: "https://www.instagram.com/pause_palette?stkn=c2k1dGNxeGJ4aGtj",
};

// Helper to sanitize phone numbers for wa.me links (digits only)
export function sanitizeWhatsAppNumber(input: string): string {
  if (!input) return DEFAULT_SETTINGS.whatsappNumber;
  const digits = input.replace(/\D/g, "");
  return digits || DEFAULT_SETTINGS.whatsappNumber;
}

// Read from JSON file fallback if DB is not available
function readFallbackSettings() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const content = fs.readFileSync(FALLBACK_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("[CONTACT_SETTINGS] Failed to read fallback JSON:", err);
  }
  return null;
}

// Save to JSON file fallback
function writeFallbackSettings(data: Record<string, any>) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[CONTACT_SETTINGS] Failed to write fallback JSON:", err);
  }
}

export async function GET() {
  try {
    let settings = null;

    // Try DB first if storeSettings model is available
    try {
      if ((prisma as any).storeSettings?.findUnique) {
        settings = await (prisma as any).storeSettings.findUnique({
          where: { id: "singleton" },
        });
      }
    } catch (dbErr) {
      console.warn("[CONTACT_SETTINGS_GET] DB query failed, checking fallback:", dbErr);
    }

    // If not found in DB, check fallback file
    if (!settings) {
      settings = readFallbackSettings();
    }

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json({
      whatsappNumber: settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
      supportEmail: settings.supportEmail || DEFAULT_SETTINGS.supportEmail,
      instagramUrl: settings.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
      updatedAt: settings.updatedAt || new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CONTACT_SETTINGS_GET_ERROR]:", error);
    const fallback = readFallbackSettings() || DEFAULT_SETTINGS;
    return NextResponse.json(fallback);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawNumber = body.whatsappNumber !== undefined ? String(body.whatsappNumber).trim() : "";
    const cleanNumber = sanitizeWhatsAppNumber(rawNumber);
    const supportEmail = body.supportEmail !== undefined ? String(body.supportEmail).trim() : DEFAULT_SETTINGS.supportEmail;
    const instagramUrl = body.instagramUrl !== undefined ? String(body.instagramUrl).trim() : DEFAULT_SETTINGS.instagramUrl;

    const payload = {
      id: "singleton",
      whatsappNumber: cleanNumber,
      supportEmail,
      instagramUrl,
      updatedAt: new Date().toISOString(),
    };

    // Always persist to fallback JSON file first so data is never lost
    writeFallbackSettings(payload);

    // Persist to DB if possible
    let dbUpdated = null;
    try {
      if ((prisma as any).storeSettings?.upsert) {
        dbUpdated = await (prisma as any).storeSettings.upsert({
          where: { id: "singleton" },
          update: {
            whatsappNumber: cleanNumber,
            supportEmail,
            instagramUrl,
          },
          create: {
            id: "singleton",
            whatsappNumber: cleanNumber,
            supportEmail,
            instagramUrl,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[CONTACT_SETTINGS_POST] DB upsert failed, saved to fallback JSON:", dbErr);
    }

    return NextResponse.json({
      success: true,
      settings: dbUpdated || payload,
    });
  } catch (error: any) {
    console.error("[CONTACT_SETTINGS_POST_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
