import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseBrowserEnv } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const env = readSupabaseBrowserEnv();
  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and a public API key (anon or publishable)");
  }
  return createBrowserClient(env.url, env.key);
}
