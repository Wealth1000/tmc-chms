"use client";

import { useLayoutEffect, useState } from "react";
import {
  addMemberPageHref,
  cellAttendanceHref,
  cellEditInfoHref,
  cellReportsHref,
} from "@/lib/cell-leader-links";
import { listCellActivities } from "@/lib/cell-activity-store";
import { tallyMembersForCell } from "@/lib/members-store";
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
  stats: serverStats,
  lastUpdatedLabel,
  activities: serverActivities,
}: DashboardPageClientProps) {
  const [stats, setStats] = useState(serverStats);
  const [activities, setActivities] = useState<ActivityListItem[]>(serverActivities);

  useLayoutEffect(() => {
    setStats(tallyMembersForCell(cellSlug));
    setActivities(listCellActivities(cellSlug));
  }, [cellSlug]);

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
    />
  );
}
