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
  /** Synthetic roster row for the cell leader (not a `public.members` row). */
  rosterRole?: "leader";
  fullName: string;
  email: string;
  phone: string;
  /** ISO from DB when loaded from Supabase */
  createdAt?: string;
  dateOfBirth: string;
  area: string;
  isStudent: boolean;
  occupation: string;
  foundationStatus: FoundationSchoolId;
  memberStatus: MemberRosterStatus;
};

/** Synthetic `MemberRecord.id` for the cell leader (not in `public.members`). */
export const CELL_LEADER_ROSTER_ID_PREFIX = "cell-leader:";

export function isCellLeaderRosterEntry(m: Pick<MemberRecord, "id" | "rosterRole">): boolean {
  return m.rosterRole === "leader" || m.id.startsWith(CELL_LEADER_ROSTER_ID_PREFIX);
}

export function parseMemberListFilter(value: string | null): MemberListFilter {
  if (value === "active" || value === "inactive" || value === "dormant") {
    return value;
  }
  return "all";
}
