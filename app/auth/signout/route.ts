import { type NextRequest, NextResponse } from "next/server";
import { ACTIVE_ROLE_COOKIE } from "@/lib/auth/active-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** POST clears Supabase auth cookies (reliable here vs some Server Action cookie paths). */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(ACTIVE_ROLE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
