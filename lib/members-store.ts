/**
 * Member roster types and URL filter parsing.
 * Data lives in Supabase `public.members` — use `lib/supabase/members-queries` and `app/members/actions`.
 */

export type MemberRosterStatus = "active" | "inactive" | "dormant";

export type MemberListFilter = "all" | MemberRosterStatus;

export type FoundationSchoolId = "yet_to_start" | "started" | "completed";

/** Full member row — `cellId` matches `public.cells.slug`. */
export type MemberRecord = {
  id: string;
  cellId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  area: string;
  isStudent: boolean;
  occupation: string;
  foundationStatus: FoundationSchoolId;
  memberStatus: MemberRosterStatus;
};

export function parseMemberListFilter(value: string | null): MemberListFilter {
  if (value === "active" || value === "inactive" || value === "dormant") {
    return value;
  }
  return "all";
}
