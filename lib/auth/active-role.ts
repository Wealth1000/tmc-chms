import type { AppProfile } from "@/lib/supabase/profile";
import { effectiveLeaderCellSlug, profileHasAdminAccess, profileHasLeaderAccess } from "@/lib/supabase/profile";

export const ACTIVE_ROLE_COOKIE = "tmc_active_role";

export type ActiveRole = "admin" | "leader";

const ACTIVE_ROLE_MAX_AGE = 60 * 60 * 24 * 400; // ~400 days

export function activeRoleCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACTIVE_ROLE_MAX_AGE,
  };
}

export function parseActiveRoleCookie(value: string | undefined): ActiveRole | null {
  if (value === "admin" || value === "leader") return value;
  return null;
}

/** Which workspace the user is viewing (not the same as DB permissions). */
export function resolveActiveRole(profile: AppProfile, cookieValue: string | undefined): ActiveRole {
  const canAdmin = profileHasAdminAccess(profile);
  const canLeader = profileHasLeaderAccess(profile);
  const fromCookie = parseActiveRoleCookie(cookieValue);

  if (fromCookie === "admin" && canAdmin) return "admin";
  if (fromCookie === "leader" && canLeader) return "leader";
  if (canAdmin && !canLeader) return "admin";
  if (canLeader && !canAdmin) return "leader";
  if (canAdmin && canLeader) return "admin";
  return profile.role === "admin" ? "admin" : "leader";
}

export function postLoginPath(profile: AppProfile, activeRole: ActiveRole): string {
  if (activeRole === "admin" && profileHasAdminAccess(profile)) {
    return "/admin";
  }
  const slug = effectiveLeaderCellSlug(profile);
  if (slug) {
    return `/cell?cell=${encodeURIComponent(slug)}`;
  }
  if (profileHasAdminAccess(profile)) {
    return "/admin";
  }
  return "/account/profile?cell_slug=required";
}
