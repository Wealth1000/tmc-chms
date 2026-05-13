import type { MemberListFilter } from "@/lib/members-store";

export const CELL_LEADER_QUERY_KEY = "cell";

export function cellDashboardHref(cellSlug: string) {
  return `/cell?${CELL_LEADER_QUERY_KEY}=${encodeURIComponent(cellSlug)}`;
}

export function cellMembersHref(cellSlug: string, filter: MemberListFilter = "all") {
  const sp = new URLSearchParams();
  sp.set(CELL_LEADER_QUERY_KEY, cellSlug);
  if (filter !== "all") sp.set("filter", filter);
  return `/cell-members?${sp.toString()}`;
}

export function cellMemberEditHref(cellSlug: string, memberId: string) {
  return `/cell-members/${encodeURIComponent(memberId)}/edit?${CELL_LEADER_QUERY_KEY}=${encodeURIComponent(cellSlug)}`;
}

export function addMemberPageHref(cellSlug: string) {
  return `/add-member?${CELL_LEADER_QUERY_KEY}=${encodeURIComponent(cellSlug)}`;
}

export function cellEditInfoHref(cellSlug: string) {
  return `/cell/edit?${CELL_LEADER_QUERY_KEY}=${encodeURIComponent(cellSlug)}`;
}

export function cellReportsHref(cellSlug: string) {
  return `/cell/reports?${CELL_LEADER_QUERY_KEY}=${encodeURIComponent(cellSlug)}`;
}

export function cellAttendanceHref(cellSlug: string) {
  return `/cell/attendance?${CELL_LEADER_QUERY_KEY}=${encodeURIComponent(cellSlug)}`;
}
