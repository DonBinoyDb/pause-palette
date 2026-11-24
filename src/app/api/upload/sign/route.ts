import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client with Service Role to generate signed upload URLs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filename = body.filename || "file";
    const contentType = body.contentType || "application/octet-stream";

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalNameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const sanitizedName = originalNameWithoutExt.replace(/[^a-zA-Z0-9]/g, "") || "media";
    const ext = filename.split(".").pop() || (contentType.startsWith("video/") ? "mp4" : "jpg");
    const targetPath = `${uniqueSuffix}-${sanitizedName}.${ext}`;

    // Create a signed upload URL valid for direct client PUT
    const { data, error } = await supabase.storage
      .from("product-images")
      .createSignedUploadUrl(targetPath);

    if (error) {
      console.error("[SUPABASE_SIGN_UPLOAD_ERROR]", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(targetPath);

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: targetPath,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error("[SIGN_UPLOAD_ERROR]", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to create signed upload URL" },
      { status: 500 }
    );
  }
}

