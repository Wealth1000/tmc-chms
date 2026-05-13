import type { SupabaseClient } from "@supabase/supabase-js";

export type AppProfile = {
  role: "admin" | "leader";
  cell_slug: string | null;
};

/** Leaders need a non-empty `profiles.cell_slug` for `?cell=` routes (no silent demo default). */
export function effectiveLeaderCellSlug(profile: AppProfile | null): string | null {
  if (!profile || profile.role !== "leader") return null;
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
    .select("role, cell_slug")
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
