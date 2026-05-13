import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/** Shape of entries passed by `@supabase/ssr` to `cookies.setAll`. */
export type SupabaseCookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};
