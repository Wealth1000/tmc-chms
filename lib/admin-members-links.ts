import type { MemberListFilter } from "@/lib/members-store";

export function adminMembersHref(filter: MemberListFilter = "all") {
  if (filter === "all") return "/admin/members";
  return `/admin/members?filter=${filter}`;
}

export function adminMemberEditHref(memberId: string, filter: MemberListFilter) {
  const id = encodeURIComponent(memberId);
  if (filter === "all") return `/admin/members/${id}/edit`;
  return `/admin/members/${id}/edit?filter=${filter}`;
}
