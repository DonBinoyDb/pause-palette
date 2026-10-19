import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Initialize Supabase Client with Service Role to bypass RLS for uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (supports hero videos & high-res images)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "File exceeds the 25MB size limit." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);

    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
    let uploadBuffer = originalBuffer;
    let contentType = file.type || "application/octet-stream";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const sanitizedName = originalNameWithoutExt.replace(/[^a-zA-Z0-9]/g, "");
    let filename = "";

    if (isVideo) {
      const ext = file.name.split(".").pop() || "mp4";
      filename = `${uniqueSuffix}-${sanitizedName}.${ext}`;
      contentType = file.type || `video/${ext}`;
    } else {
      try {
        // Convert images to WebP using sharp
        uploadBuffer = await sharp(originalBuffer)
          .webp({ quality: 85 })
          .toBuffer();
        filename = `${uniqueSuffix}-${sanitizedName}.webp`;
        contentType = "image/webp";
      } catch (sharpError) {
        // Fallback to original buffer if sharp cannot process
        filename = `${uniqueSuffix}-${sanitizedName}.${file.name.split(".").pop() || "jpg"}`;
      }
    }
    
    // Upload to Supabase Storage Bucket 'product-images'
    const { data: uploadData, error } = await supabase.storage
      .from("product-images")
      .upload(filename, uploadBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error("[SUPABASE_UPLOAD_ERROR]", error);
      return NextResponse.json({ success: false, message: "Upload failed: " + error.message }, { status: 500 });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);

    // Return the public URL
    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
