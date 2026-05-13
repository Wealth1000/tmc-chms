import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates `cells` + sets `profiles.cell_slug` for the signed-in leader if missing (pre-0002 accounts).
 * Uses DB RPC `ensure_leader_cell_for_current_user` (migration `0003_ensure_leader_cell_rpc.sql`).
 */
export async function ensureLeaderCellForCurrentUser(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.rpc("ensure_leader_cell_for_current_user", {});
  if (error) {
    console.error("ensure_leader_cell_for_current_user:", error.message);
    return null;
  }
  if (typeof data !== "string" || !data.trim()) return null;
  return data.trim();
}
