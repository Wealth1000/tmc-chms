import type { SupabaseClient } from "@supabase/supabase-js";
import type { CellGroupRow } from "@/lib/admin-cells-store";
import { listMembers } from "@/lib/members-store";
import type { CellStats } from "@/components/cell-dashboard/types";

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

function tallyMembersForSlug(slug: string) {
  let total = 0;
  let active = 0;
  let inactive = 0;
  let dormant = 0;
  for (const m of listMembers()) {
    if (m.cellId !== slug) continue;
    total += 1;
    if (m.memberStatus === "active") active += 1;
    else if (m.memberStatus === "inactive") inactive += 1;
    else dormant += 1;
  }
  return { total, active, inactive, dormant };
}

function meetingSchedule(row: Pick<CellDbRow, "meeting_day" | "meeting_time">): string {
  const day = row.meeting_day?.trim() || "Wednesday";
  const time = row.meeting_time?.trim() || "7:00 PM";
  return `${day} at ${time}`;
}

export function cellRowToGroupRow(cell: CellDbRow, leaderDisplayName: string): CellGroupRow {
  const t = tallyMembersForSlug(cell.slug);
  return {
    id: cell.slug,
    name: cell.name,
    leader: leaderDisplayName.trim() || "—",
    leaderEmail: "—",
    leaderPhone: "—",
    meetingSchedule: meetingSchedule(cell),
    meetingLocation: cell.meeting_location?.trim() ?? "",
    total: t.total,
    active: t.active,
    inactive: t.inactive,
    dormant: t.dormant,
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

  const ids = [...new Set(cells.map((c) => c.leader_user_id as string))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);

  const leaderName = new Map<string, string>();
  for (const p of profiles ?? []) {
    leaderName.set(p.id as string, String(p.full_name ?? ""));
  }

  return (cells as CellDbRow[]).map((c) =>
    cellRowToGroupRow(c, leaderName.get(c.leader_user_id) ?? ""),
  );
}

export async function fetchCellGroupRowBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<CellGroupRow | null> {
  const row = await fetchCellDbRow(supabase, slug);
  if (!row) return null;
  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.leader_user_id)
    .maybeSingle();
  return cellRowToGroupRow(row, String(prof?.full_name ?? ""));
}

export type ResolvedCellLeaderDashboard = {
  cellSlug: string;
  cellName: string;
  leaderName: string;
  lastUpdatedLabel: string;
  stats: CellStats;
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
  const t = tallyMembersForSlug(cellSlug);

  return {
    cellSlug: cell.slug,
    cellName: cell.name,
    leaderName,
    lastUpdatedLabel: formatUpdatedLabel(cell.updated_at),
    stats: {
      totalMembers: t.total,
      active: t.active,
      inactive: t.inactive,
      dormant: t.dormant,
    },
  };
}
