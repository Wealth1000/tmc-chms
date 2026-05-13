/**
 * Supabase public API key: legacy anon JWT (`eyJ…`) or dashboard “publishable” key (`sb_publishable_…`).
 */
function readSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

/**
 * Supabase URL + public key for the browser (never use service role here).
 */
export function readSupabaseBrowserEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = readSupabasePublishableKey();
  if (!url || !key) return null;
  return { url, key };
}

/**
 * URL + public key on the server or Edge. Non-public `SUPABASE_*` names are optional duplicates of the dashboard values.
 */
export function readSupabaseServerOrEdgeEnv(): { url: string; key: string } | null {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const key = readSupabasePublishableKey();
  if (!url || !key) return null;
  return { url, key };
}
