import type { CellStats } from "@/components/cell-dashboard/types";

export type CellReportPeriod = "week" | "month" | "quarter";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export type RecentAttendanceRow = {
  id: string;
  dateLabel: string;
  totalMembers: number;
  present: number;
  absent: number;
  ratePct: number;
};

const DEMO_DATE_LABELS = ["May 7, 2026", "Apr 30, 2026", "Apr 23, 2026", "Apr 16, 2026"] as const;

export function buildRecentAttendanceRows(totalMembers: number, cellId: string): RecentAttendanceRow[] {
  if (totalMembers <= 0) {
    return DEMO_DATE_LABELS.map((dateLabel, i) => ({
      id: `att-${cellId}-${i}`,
      dateLabel,
      totalMembers: 0,
      present: 0,
      absent: 0,
      ratePct: 0,
    }));
  }
  const T = totalMembers;
  return DEMO_DATE_LABELS.map((dateLabel, i) => {
    const w = djb2(`${cellId}-att-${i}`);
    const target = 0.66 + ((w % 28) / 100);
    let present = Math.round(T * target);
    present = Math.min(T, Math.max(0, present));
    const absent = T - present;
    const ratePct = Math.round((present / T) * 100);
    return {
      id: `att-${cellId}-${i}`,
      dateLabel,
      totalMembers: T,
      present,
      absent,
      ratePct,
    };
  });
}

export function estimateNewMembersCount(cellId: string, totalMembers: number): number {
  if (totalMembers <= 0) return 0;
  const w = djb2(`${cellId}-new`);
  const cap = Math.max(1, Math.min(6, Math.ceil(totalMembers / 3)));
  return Math.min(totalMembers, 1 + (w % cap));
}

export function periodScale(period: CellReportPeriod): number {
  if (period === "week") return 0.93;
  if (period === "quarter") return 1.07;
  return 1;
}

export type CellReportsOverviewBase = {
  avgAttendance: number;
  attendanceRatePct: number;
  newMembers: number;
  inactive: number;
  rows: RecentAttendanceRow[];
};

export function buildCellReportsOverview(stats: CellStats, cellId: string): CellReportsOverviewBase {
  const rows = buildRecentAttendanceRows(stats.totalMembers, cellId);
  if (stats.totalMembers <= 0) {
    return {
      avgAttendance: 0,
      attendanceRatePct: 0,
      newMembers: 0,
      inactive: stats.inactive,
      rows,
    };
  }
  const avgPresent = rows.reduce((s, r) => s + r.present, 0) / rows.length;
  const avgAttendance = Math.round(avgPresent * 10) / 10;
  const attendanceRatePct = Math.round(
    rows.reduce((s, r) => s + r.ratePct, 0) / rows.length,
  );
  return {
    avgAttendance,
    attendanceRatePct,
    newMembers: estimateNewMembersCount(cellId, stats.totalMembers),
    inactive: stats.inactive,
    rows,
  };
}

export function applyPeriodToOverview(
  base: CellReportsOverviewBase,
  period: CellReportPeriod,
): CellReportsOverviewBase {
  const f = periodScale(period);
  const rows = base.rows.map((r) => {
    const T = r.totalMembers;
    const present = Math.min(T, Math.max(0, Math.round(r.present * f)));
    const absent = T - present;
    const ratePct = Math.round((present / Math.max(T, 1)) * 100);
    return { ...r, present, absent, ratePct };
  });
  const avgPresent = rows.reduce((s, r) => s + r.present, 0) / rows.length;
  const avgAttendance = Math.round(avgPresent * 10) / 10;
  const attendanceRatePct = Math.round(
    rows.reduce((s, r) => s + r.ratePct, 0) / rows.length,
  );
  return {
    avgAttendance,
    attendanceRatePct,
    newMembers: Math.max(0, Math.round(base.newMembers * (period === "quarter" ? 1.15 : period === "week" ? 0.85 : 1))),
    inactive: base.inactive,
    rows,
  };
}
