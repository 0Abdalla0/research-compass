import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || "";
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] || "";

// Verify both keys exist and the URL is a valid format to prevent createClient from throwing.
export const hasSupabaseKeys = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("your-project-id")
);

if (!hasSupabaseKeys) {
  console.warn(
    "Supabase credentials are missing, placeholder, or invalid. App is running in offline mode with mock seed data."
  );
}

export const supabase = hasSupabaseKeys
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
