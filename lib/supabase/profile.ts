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

export async function fetchAppProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, cell_slug")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const role = data.role as string;
  if (role !== "admin" && role !== "leader") return null;
  return {
    role,
    cell_slug: typeof data.cell_slug === "string" ? data.cell_slug : null,
  };
}
