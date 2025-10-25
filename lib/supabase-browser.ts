import type { Database } from "@/types/database";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

/**
 * Client-side Supabase client.
 * Safe to use in browser components. Respects Row Level Security (RLS).
 */
// Reuse a single browser client instance to ensure auth state events
// (onAuthStateChange) are received consistently across the app.
let browserClient: SupabaseClient<Database> | null = null;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      supabaseUrl!,
      supabaseAnonKey!
    );
  }
  return browserClient;
}
