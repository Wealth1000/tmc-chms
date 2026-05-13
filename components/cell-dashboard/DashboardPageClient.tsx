"use client";

import {
  addMemberPageHref,
  cellAttendanceHref,
  cellEditInfoHref,
  cellReportsHref,
} from "@/lib/cell-leader-links";
import { CellLeaderDashboard } from "./CellLeaderDashboard";
import type { ActivityListItem, CellStats } from "./types";

type DashboardPageClientProps = {
  cellSlug: string;
  cellName: string;
  leaderName: string;
  stats: CellStats;
  lastUpdatedLabel: string;
  activities: ActivityListItem[];
};

export function DashboardPageClient({
  cellSlug,
  cellName,
  leaderName,
  stats,
  lastUpdatedLabel,
  activities,
}: DashboardPageClientProps) {
  return (
    <CellLeaderDashboard
      cellSlug={cellSlug}
      cellName={cellName}
      leaderName={leaderName}
      stats={stats}
      lastUpdatedLabel={lastUpdatedLabel}
      activities={activities}
      addMemberHref={addMemberPageHref(cellSlug)}
      updateCellInfoHref={cellEditInfoHref(cellSlug)}
      viewReportsHref={cellReportsHref(cellSlug)}
      recordAttendanceHref={cellAttendanceHref(cellSlug)}
      // TODO: wire remaining actions / routes
      // onOpenProfile={() => {}}
      // onRecordAttendance={() => {}}
      // onUpdateCellInfo={() => {}}
      // onViewReports={() => {}}
      // onHelp={() => {}}
    />
  );
}
