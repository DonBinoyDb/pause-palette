import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { requireAdmin } from "@/lib/authHelpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ALLOWED_DEGREES = [90, 180, 270] as const;
type AllowedDegree = (typeof ALLOWED_DEGREES)[number];

function validateSupabaseImageUrl(urlStr: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTPS URLs are accepted" };
    }

    const expectedSupabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : "";
    const isSupabaseDomain =
      parsed.hostname.endsWith(".supabase.co") ||
      (expectedSupabaseHost && parsed.hostname === expectedSupabaseHost);

    if (!isSupabaseDomain) {
      return { valid: false, error: "Only images hosted in project Supabase Storage can be rotated" };
    }

    // Must belong to product-images bucket
    if (!parsed.pathname.includes("/storage/v1/object/public/product-images/")) {
      return { valid: false, error: "Only product-images bucket items can be rotated" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL string" };
  }
}

export async function POST(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, degrees } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ success: false, message: "Image URL is required" }, { status: 400 });
    }

    const numDegrees = Number(degrees);
    if (!ALLOWED_DEGREES.includes(numDegrees as AllowedDegree)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid rotation degrees. Allowed values: 90, 180, 270",
        },
        { status: 400 }
      );
    }

    const urlCheck = validateSupabaseImageUrl(imageUrl);
    if (!urlCheck.valid) {
      return NextResponse.json({ success: false, message: urlCheck.error }, { status: 403 });
    }

    // Fetch image from Supabase
    const fetchRes = await fetch(imageUrl);
    if (!fetchRes.ok) {
      return NextResponse.json({ success: false, message: "Failed to download original image" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await fetchRes.arrayBuffer());

    // Single-pass physical rotation via sharp
    const rotatedBuffer = await sharp(inputBuffer)
      .rotate(numDegrees)
      .webp({ quality: 85 })
      .toBuffer();

    const parsedUrl = new URL(imageUrl);
    const originalFilename = parsedUrl.pathname.split("/").pop() || "image.webp";
    const baseName = originalFilename.replace(/\.[^/.]+$/, "").replace(/-r(90|180|270)-\d+$/, "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const newFilename = `${baseName}-r${numDegrees}-${uniqueSuffix}.webp`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(newFilename, rotatedBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      console.error("[ROTATE_UPLOAD_ERROR]", uploadError);
      return NextResponse.json(
        { success: false, message: "Failed to upload rotated image: " + uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (error: any) {
    console.error("[ROTATE_IMAGE_ERROR]", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to rotate image" }, { status: 500 });
  }
}
