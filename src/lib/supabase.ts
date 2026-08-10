import { createClient } from "@supabase/supabase-js";

// Make sure Supabase URL and Anon Key are defined in environment variables.
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || "";
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase configuration keys are missing. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. Falling back to offline seed data mode."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const hasSupabaseKeys = !!(supabaseUrl && supabaseAnonKey);
