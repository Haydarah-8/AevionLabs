import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — server-only, never import
 * from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_*.
 *
 * Lazily created so importing this module doesn't throw when env vars aren't
 * set yet (e.g. during `next build`'s page-data collection).
 */
let client: SupabaseClient | undefined;

export function hasSupabaseAdmin(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
