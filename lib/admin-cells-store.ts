/**
 * Admin cell directory types and aggregates. Cell rows are loaded from Supabase in route handlers.
 */

import { listMembers } from "@/lib/members-store";

export type CellGroupRow = {
  id: string;
  name: string;
  leader: string;
  leaderEmail: string;
  leaderPhone: string;
  meetingSchedule: string;
  meetingLocation: string;
  total: number;
  active: number;
  inactive: number;
  dormant: number;
  updatedLabel: string;
};

export type AdminActivityType = "attendance" | "member" | "submission";

export type AdminActivityItem = {
  id: string;
  type: AdminActivityType;
  cellName: string;
  categoryLabel: string;
  description: string;
  timeLabel: string;
};

/** Whole-roster counts from the member store (same sums as `/admin/members`). */
export function aggregateMemberRosterStats(cellRows: CellGroupRow[]) {
  const members = listMembers();
  let active = 0;
  let inactive = 0;
  let dormant = 0;
  for (const m of members) {
    if (m.memberStatus === "active") active += 1;
    else if (m.memberStatus === "inactive") inactive += 1;
    else dormant += 1;
  }
  return {
    totalCells: cellRows.length,
    totalMembers: members.length,
    active,
    inactive,
    dormant,
  };
}

/** Placeholder until attendance and reports are persisted. */
export function buildAdminActivityFeed(_rows: CellGroupRow[]): AdminActivityItem[] {
  return [];
}

export function aggregateAdminStats(rows: CellGroupRow[]) {
  const totalCells = rows.length;
  let totalMembers = 0;
  let active = 0;
  let inactive = 0;
  let dormant = 0;
  for (const r of rows) {
    totalMembers += r.total;
    active += r.active;
    inactive += r.inactive;
    dormant += r.dormant;
  }
  return { totalCells, totalMembers, active, inactive, dormant };
}
