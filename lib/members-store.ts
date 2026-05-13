/**
 * Member roster — in-memory until a `members` table is wired to Supabase.
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
  dateOfBirth: string;
  area: string;
  isStudent: boolean;
  occupation: string;
  foundationStatus: FoundationSchoolId;
  memberStatus: MemberRosterStatus;
};

const membersCache: MemberRecord[] = [];

export function listMembers(): MemberRecord[] {
  return [...membersCache];
}

export function getMemberById(id: string): MemberRecord | undefined {
  return membersCache.find((m) => m.id === id);
}

export function updateMember(id: string, patch: Partial<Omit<MemberRecord, "id">>): MemberRecord | undefined {
  const i = membersCache.findIndex((m) => m.id === id);
  if (i < 0) return undefined;
  membersCache[i] = { ...membersCache[i], ...patch };
  return { ...membersCache[i] };
}

export function parseMemberListFilter(value: string | null): MemberListFilter {
  if (value === "active" || value === "inactive" || value === "dormant") {
    return value;
  }
  return "all";
}
