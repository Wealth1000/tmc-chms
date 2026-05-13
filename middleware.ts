import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseCookieToSet } from "@/lib/supabase/cookie-types";
import { readSupabaseServerOrEdgeEnv } from "@/lib/supabase/env";
import { ensureLeaderCellForCurrentUser } from "@/lib/supabase/ensure-leader-cell";
import { effectiveLeaderCellSlug, fetchAppProfile } from "@/lib/supabase/profile";

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/cell")) return true;
  if (pathname.startsWith("/cell-members")) return true;
  if (pathname === "/add-member" || pathname.startsWith("/add-member/")) return true;
  if (pathname.startsWith("/account")) return true;
  return false;
}

function leaderNeedsCellQuery(pathname: string): boolean {
  return (
    pathname.startsWith("/cell") ||
    pathname.startsWith("/cell-members") ||
    pathname === "/add-member" ||
    pathname.startsWith("/add-member/")
  );
}

export async function middleware(request: NextRequest) {
  const supabaseEnv = readSupabaseServerOrEdgeEnv();
  if (!supabaseEnv) {
    return NextResponse.next({ request: { headers: request.headers } });
  }
  const { url: supabaseUrl, key: supabaseAnonKey } = supabaseEnv;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  let profile = user ? await fetchAppProfile(supabase, user.id) : null;

  if (user && profile?.role === "leader" && !effectiveLeaderCellSlug(profile)) {
    await ensureLeaderCellForCurrentUser(supabase);
    profile = await fetchAppProfile(supabase, user.id);
  }

  if (pathname === "/" && user && profile) {
    if (profile.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (profile.role === "leader") {
      const slug = effectiveLeaderCellSlug(profile);
      if (!slug) {
        return NextResponse.redirect(new URL("/account/profile?cell_slug=required", request.url));
      }
      const u = new URL("/cell", request.url);
      u.searchParams.set("cell", slug);
      return NextResponse.redirect(u);
    }
  }

  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (!user || !profile) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (profile.role === "admin") {
    if (
      pathname.startsWith("/cell") ||
      pathname.startsWith("/cell-members") ||
      pathname.startsWith("/add-member")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (profile.role === "leader") {
    const slug = effectiveLeaderCellSlug(profile);
    if (pathname.startsWith("/admin")) {
      if (!slug) {
        return NextResponse.redirect(new URL("/account/profile?cell_slug=required", request.url));
      }
      const u = new URL("/cell", request.url);
      u.searchParams.set("cell", slug);
      return NextResponse.redirect(u);
    }
    if (leaderNeedsCellQuery(pathname)) {
      if (!slug) {
        return NextResponse.redirect(new URL("/account/profile?cell_slug=required", request.url));
      }
      const cellParam = searchParams.get("cell")?.trim() ?? "";
      if (cellParam !== slug) {
        const u = request.nextUrl.clone();
        u.searchParams.set("cell", slug);
        return NextResponse.redirect(u);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
