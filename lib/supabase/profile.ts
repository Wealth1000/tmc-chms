import type { SupabaseClient } from "@supabase/supabase-js";

export type AppProfile = {
  role: "admin" | "leader";
  is_admin: boolean;
  cell_slug: string | null;
};

export function profileHasAdminAccess(profile: AppProfile | null): boolean {
  if (!profile) return false;
  return profile.role === "admin" || profile.is_admin;
}

export function profileHasLeaderAccess(profile: AppProfile | null): boolean {
  return Boolean(effectiveLeaderCellSlug(profile));
}

/** Cell slug for leader routes (`?cell=`). Any profile with a cell assignment may use leader UI. */
export function effectiveLeaderCellSlug(profile: AppProfile | null): string | null {
  if (!profile) return null;
  const s = profile.cell_slug?.trim();
  return s ? s : null;
}

export type ProfileFetchFailure =
  | { kind: "missing_row" }
  | { kind: "invalid_role"; role: string }
  | { kind: "query_error"; message: string };

/** Same as `fetchAppProfile` but explains why login might fail even when a row exists in the table editor. */
export async function fetchAppProfileOrFail(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true; profile: AppProfile } | { ok: false; failure: ProfileFetchFailure }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, is_admin, cell_slug")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, failure: { kind: "query_error", message: error.message } };
  }
  if (!data) {
    return { ok: false, failure: { kind: "missing_row" } };
  }
  const role = String(data.role ?? "");
  if (role !== "admin" && role !== "leader") {
    return { ok: false, failure: { kind: "invalid_role", role } };
  }
  return {
    ok: true,
    profile: {
      role: role as AppProfile["role"],
      is_admin: Boolean(data.is_admin),
      cell_slug: typeof data.cell_slug === "string" ? data.cell_slug : null,
    },
  };
}

export async function fetchAppProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppProfile | null> {
  const r = await fetchAppProfileOrFail(supabase, userId);
  return r.ok ? r.profile : null;
}
