import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseCookieToSet } from "@/lib/supabase/cookie-types";
import { readSupabaseServerOrEdgeEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const env = readSupabaseServerOrEdgeEnv();
  if (!env) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (optional SUPABASE_URL / SUPABASE_ANON_KEY duplicates for server).",
    );
  }
  const { url, key } = env;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; session refresh runs in middleware instead.
        }
      },
    },
  });
}
