"use client";

import {
  addMemberPageHref,
  cellAttendanceHref,
  cellEditInfoHref,
  cellReportsHref,
} from "@/lib/cell-leader-links";
import { useLeaderCellData } from "@/components/offline/leader-cell-data-provider";
import type { RoleSwitchMenuProps } from "@/lib/auth/role-switch-menu";
import { CellLeaderDashboard } from "./CellLeaderDashboard";

export function DashboardPageClient({ roleSwitch }: { roleSwitch?: RoleSwitchMenuProps | null }) {
  const { cellSlug, dashboard } = useLeaderCellData();
  if (!dashboard) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0B0E14] p-6 text-center text-sm text-white/70">
        <p>No cell data on this device yet. Open this screen once while online to save it for offline use.</p>
      </div>
    );
  }

  const { cellName, leaderName, stats, lastUpdatedLabel, activities } = dashboard;

  return (
    <CellLeaderDashboard
      roleSwitch={roleSwitch}
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
