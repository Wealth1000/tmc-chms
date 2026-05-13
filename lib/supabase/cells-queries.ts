import type { SupabaseClient } from "@supabase/supabase-js";
import type { CellGroupRow } from "@/lib/admin-cells-store";
import type { CellStats } from "@/components/cell-dashboard/types";
import { fetchMemberRollupMap, fetchRecentActivitiesForCell } from "@/lib/supabase/members-queries";
import type { ActivityListItem } from "@/components/cell-dashboard/types";

export type CellDbRow = {
  slug: string;
  name: string;
  leader_user_id: string;
  meeting_location: string;
  meeting_day: string;
  meeting_time: string;
  description: string;
  updated_at: string;
};

function formatUpdatedLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function emptyStats(): CellStats {
  return { totalMembers: 0, active: 0, inactive: 0, dormant: 0 };
}

function meetingSchedule(row: Pick<CellDbRow, "meeting_day" | "meeting_time">): string {
  const day = row.meeting_day?.trim() || "Wednesday";
  const time = row.meeting_time?.trim() || "7:00 PM";
  return `${day} at ${time}`;
}

export function cellRowToGroupRow(
  cell: CellDbRow,
  leaderDisplayName: string,
  memberStats: CellStats,
): CellGroupRow {
  return {
    id: cell.slug,
    name: cell.name,
    leader: leaderDisplayName.trim() || "—",
    leaderEmail: "—",
    leaderPhone: "—",
    meetingSchedule: meetingSchedule(cell),
    meetingLocation: cell.meeting_location?.trim() ?? "",
    total: memberStats.totalMembers,
    active: memberStats.active,
    inactive: memberStats.inactive,
    dormant: memberStats.dormant,
    updatedLabel: formatUpdatedLabel(cell.updated_at),
  };
}

export async function fetchCellDbRow(
  supabase: SupabaseClient,
  slug: string,
): Promise<CellDbRow | null> {
  const { data, error } = await supabase
    .from("cells")
    .select("slug, name, leader_user_id, meeting_location, meeting_day, meeting_time, description, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as CellDbRow;
}

export async function fetchAllCellGroupRows(supabase: SupabaseClient): Promise<CellGroupRow[]> {
  const { data: cells, error } = await supabase
    .from("cells")
    .select("slug, name, leader_user_id, meeting_location, meeting_day, meeting_time, description, updated_at")
    .order("name", { ascending: true });

  if (error || !cells?.length) return [];

  const rollup = await fetchMemberRollupMap(supabase);

  const ids = [...new Set(cells.map((c) => c.leader_user_id as string))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);

  const leaderName = new Map<string, string>();
  for (const p of profiles ?? []) {
    leaderName.set(p.id as string, String(p.full_name ?? ""));
  }

  return (cells as CellDbRow[]).map((c) =>
    cellRowToGroupRow(c, leaderName.get(c.leader_user_id) ?? "", rollup.get(c.slug) ?? emptyStats()),
  );
}

export async function fetchCellGroupRowBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<CellGroupRow | null> {
  const row = await fetchCellDbRow(supabase, slug);
  if (!row) return null;
  const rollup = await fetchMemberRollupMap(supabase);
  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.leader_user_id)
    .maybeSingle();
  return cellRowToGroupRow(row, String(prof?.full_name ?? ""), rollup.get(slug) ?? emptyStats());
}

export type ResolvedCellLeaderDashboard = {
  cellSlug: string;
  cellName: string;
  leaderName: string;
  lastUpdatedLabel: string;
  stats: CellStats;
  activities: ActivityListItem[];
};

export async function loadCellLeaderDashboard(
  supabase: SupabaseClient,
  cellSlug: string,
): Promise<ResolvedCellLeaderDashboard | null> {
  const cell = await fetchCellDbRow(supabase, cellSlug);
  if (!cell) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", cell.leader_user_id)
    .maybeSingle();

  const leaderName = String(prof?.full_name ?? "").trim() || "Cell leader";
  const rollup = await fetchMemberRollupMap(supabase);
  const t = rollup.get(cellSlug) ?? emptyStats();
  const activities = await fetchRecentActivitiesForCell(supabase, cellSlug);

  return {
    cellSlug: cell.slug,
    cellName: cell.name,
    leaderName,
    lastUpdatedLabel: formatUpdatedLabel(cell.updated_at),
    stats: {
      totalMembers: t.totalMembers,
      active: t.active,
      inactive: t.inactive,
      dormant: t.dormant,
    },
    activities,
  };
}
