import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Creating 'product-images' bucket...");
  
  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 2097152 // 2MB
  });
  
  if (error) {
    console.error("Error creating bucket:", error);
  } else {
    console.log("Bucket created successfully:", data);
  }
}

main();
