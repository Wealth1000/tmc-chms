import type { ActivityListItem, CellStats } from "@/components/cell-dashboard/types";
import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import type { MemberRecord } from "@/lib/members-store";

export type CellLeaderSnapshotDashboard = {
  cellName: string;
  leaderName: string;
  stats: CellStats;
  lastUpdatedLabel: string;
  activities: ActivityListItem[];
};

/** Leader cell bundle stored on device for offline reads (hybrid plan C). */
export type CellLeaderSnapshot = {
  cellSlug: string;
  fetchedAt: number;
  dashboard: CellLeaderSnapshotDashboard;
  members: MemberRecord[];
  editable: CellLeaderEditableInfo;
};

export type LeaderCellServerPayload = {
  dashboard?: CellLeaderSnapshotDashboard | null;
  members?: MemberRecord[];
  editable?: CellLeaderEditableInfo | null;
  member?: MemberRecord | null;
};
