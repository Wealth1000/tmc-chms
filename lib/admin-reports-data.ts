import { aggregateMemberRosterStats, type CellGroupRow } from "@/lib/admin-cells-store";

export type WeeklyAttendance = { week: number; total: number; avgPerCell: number };

export type MonthlyGrowth = {
  label: string;
  totalMembers: number;
  activeMembers: number;
  avgAttendance: number;
};

export type PartnershipTypeRow = {
  id: string;
  label: string;
  amount: number;
  pct: number;
  barClass: string;
};

export type GivingTimelineRow = {
  id: string;
  category: "Tithe" | "Offering" | "Missions" | "Special" | "Building";
  cellName: string;
  dateLabel: string;
  amount: number;
};

export type TopCellRow = CellGroupRow & {
  rank: number;
  engagement: number;
  attendance: number;
};

export type ReportsSnapshot = {
  totalMembers: number;
  active: number;
  inactive: number;
  dormant: number;
  totalCells: number;
  activeRatePct: number;
  growthRatePct: number;
  totalGiving: number;
  attendanceByWeek: WeeklyAttendance[];
  growthByMonth: MonthlyGrowth[];
  partnershipTypes: PartnershipTypeRow[];
  givingTimeline: GivingTimelineRow[];
  topCells: TopCellRow[];
};

const EMPTY_WEEKS: WeeklyAttendance[] = Array.from({ length: 8 }, (_, i) => ({
  week: i + 1,
  total: 0,
  avgPerCell: 0,
}));

const MONTH_LABELS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"] as const;

/**
 * Reports from live roster + cells only. Giving, partnership splits, growth %, and
 * attendance time series stay empty/zero until backed by real tables.
 */
export function buildReportsSnapshot(cellRows: CellGroupRow[]): ReportsSnapshot {
  const roster = aggregateMemberRosterStats(cellRows);
  const { totalMembers, active, inactive, dormant, totalCells } = roster;
  const t = totalMembers > 0 ? totalMembers : 1;
  const activeRatePct = Math.round((active / t) * 1000) / 10;

  const growthRatePct = 0;
  const totalGiving = 0;
  const partnershipTypes: PartnershipTypeRow[] = [];
  const givingTimeline: GivingTimelineRow[] = [];

  const attendanceByWeek = EMPTY_WEEKS;

  const growthByMonth: MonthlyGrowth[] = MONTH_LABELS.map((label) => ({
    label,
    totalMembers: Math.max(0, totalMembers),
    activeMembers: Math.max(0, active),
    avgAttendance: 0,
  }));

  const cells = cellRows;

  const topCells: TopCellRow[] = [...cells]
    .map((c) => {
      const engagement = c.total > 0 ? Math.round((c.active / c.total) * 100) : 0;
      const attendance = engagement;
      return { ...c, engagement, attendance };
    })
    .sort((a, b) => {
      const sum = (x: { engagement: number; attendance: number }) => x.engagement + x.attendance;
      const d = sum(b) - sum(a);
      if (d !== 0) return d;
      if (b.active !== a.active) return b.active - a.active;
      return a.name.localeCompare(b.name);
    })
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  return {
    totalMembers,
    active,
    inactive,
    dormant,
    totalCells,
    activeRatePct,
    growthRatePct,
    totalGiving,
    attendanceByWeek,
    growthByMonth,
    partnershipTypes,
    givingTimeline,
    topCells,
  };
}
