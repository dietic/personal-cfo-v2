import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient<Database> | null = null;

/**
 * Server-side Supabase client with service role key.
 * WARNING: Only use this in server components, API routes, and server actions.
 * This bypasses Row Level Security (RLS).
 *
 * Lazy initialization to avoid errors during build time.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

/**
 * @deprecated Use getSupabaseAdmin() instead. This export is kept for backwards compatibility.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient<Database>];
  },
});
