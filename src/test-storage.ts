import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const parts = line.split("=");
    const k = parts[0]?.trim();
    const v = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
    if (k === "VITE_SUPABASE_URL") supabaseUrl = v;
    if (k === "VITE_SUPABASE_ANON_KEY") supabaseAnonKey = v;
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  console.log("Testing Supabase Storage upload to 'documents' bucket...");
  
  // 1. Try listing buckets
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error("❌ List buckets failed:", bucketsErr.message, bucketsErr);
  } else {
    console.log("✅ Available buckets:", buckets.map(b => b.name));
  }

  // 2. Try uploading a test file
  const dummyFile = Buffer.from("Hello world from debug script");
  const testPath = `debug_${Date.now()}.txt`;
  
  console.log(`Attempting to upload file to 'documents/${testPath}'...`);
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("documents")
    .upload(testPath, dummyFile, {
      contentType: "text/plain",
      upsert: true
    });

  if (uploadErr) {
    console.error("❌ Upload failed:", uploadErr.message, uploadErr);
  } else {
    console.log("✅ Upload succeeded! Path:", uploadData?.path);

    // Get public URL
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(testPath);
    console.log("✅ Public URL:", urlData.publicUrl);

    // Clean up
    console.log("Cleaning up uploaded test storage object...");
    const { error: deleteErr } = await supabase.storage.from("documents").remove([testPath]);
    if (deleteErr) {
      console.error("❌ Delete failed:", deleteErr.message);
    } else {
      console.log("✅ Delete succeeded!");
    }
  }
}

testStorage();
