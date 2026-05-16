export type ActivityIcon = "member-add" | "attendance" | "person" | "document";

export type ActivityListItem = {
  id: string;
  icon: ActivityIcon;
  title: string;
  subtext: string;
};

export type CellStats = {
  totalMembers: number;
  active: number;
  inactive: number;
  dormant: number;
};

import type { RoleSwitchMenuProps } from "@/lib/auth/role-switch-menu";

export type CellLeaderDashboardProps = {
  cellName: string;
  leaderName: string;
  stats: CellStats;
  /** Pre-formatted label, e.g. from your i18n or server */
  lastUpdatedLabel: string;
  activities: ActivityListItem[];
  /** Dev: `?cell=` slug so member flows stay scoped to the signed-in cell */
  cellSlug: string;
  /** Dual admin+leader workspace switch (profile menu). */
  roleSwitch?: RoleSwitchMenuProps | null;
  /** Wire these up to navigation, mutations, modals, etc. */
  onOpenProfile?: () => void;
  /** Prefer over `onAddMember` — uses `<Link>` so navigation works reliably on mobile */
  addMemberHref?: string;
  /** Cell-side edit screen */
  updateCellInfoHref?: string;
  /** Cell-side reports */
  viewReportsHref?: string;
  /** Record attendance */
  recordAttendanceHref?: string;
  onAddMember?: () => void;
  onRecordAttendance?: () => void;
  onUpdateCellInfo?: () => void;
  onViewReports?: () => void;
  onHelp?: () => void;
};
