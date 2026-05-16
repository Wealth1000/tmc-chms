import type { CellLeaderSnapshot } from "@/lib/offline/cell-snapshot-types";
import { cellDbRowToEditableInfo } from "@/lib/cell-leader-editable-mapper";
import { fetchCellDbRow, loadCellLeaderDashboard } from "@/lib/supabase/cells-queries";
import { fetchCellRosterWithLeader } from "@/lib/supabase/cell-roster-queries";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function buildCellLeaderSnapshot(
  supabase: SupabaseClient,
  cellSlug: string,
): Promise<CellLeaderSnapshot | null> {
  const [dashboard, members, cell] = await Promise.all([
    loadCellLeaderDashboard(supabase, cellSlug),
    fetchCellRosterWithLeader(supabase, cellSlug),
    fetchCellDbRow(supabase, cellSlug),
  ]);

  if (!dashboard || !cell) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", cell.leader_user_id)
    .maybeSingle();

  const editable = cellDbRowToEditableInfo(cell, String(prof?.full_name ?? ""));

  return {
    cellSlug,
    fetchedAt: Date.now(),
    dashboard: {
      cellName: dashboard.cellName,
      leaderName: dashboard.leaderName,
      stats: dashboard.stats,
      lastUpdatedLabel: dashboard.lastUpdatedLabel,
      activities: dashboard.activities,
    },
    members,
    editable,
  };
}
