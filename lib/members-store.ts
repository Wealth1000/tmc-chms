/**
 * Member roster — persisted in localStorage until a `members` table is wired to Supabase.
 */

import type { CellStats } from "@/components/cell-dashboard/types";

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

const STORAGE_KEY = "tmc-chms-members-v1";

const membersCache: MemberRecord[] = [];

let hydratedFromStorage = false;

export function hydrateMembersFromStorage(): void {
  if (typeof window === "undefined") return;
  if (hydratedFromStorage) return;
  hydratedFromStorage = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return;
    membersCache.length = 0;
    for (const row of parsed) {
      if (row && typeof row === "object" && "id" in row && "cellId" in row) {
        membersCache.push(row as MemberRecord);
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
}

function persistMembersToStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(membersCache));
  } catch {
    /* quota / private mode */
  }
}

export function listMembers(): MemberRecord[] {
  hydrateMembersFromStorage();
  return [...membersCache];
}

export function getMemberById(id: string): MemberRecord | undefined {
  hydrateMembersFromStorage();
  return membersCache.find((m) => m.id === id);
}

export function updateMember(id: string, patch: Partial<Omit<MemberRecord, "id">>): MemberRecord | undefined {
  hydrateMembersFromStorage();
  const i = membersCache.findIndex((m) => m.id === id);
  if (i < 0) return undefined;
  membersCache[i] = { ...membersCache[i], ...patch };
  persistMembersToStorage();
  return { ...membersCache[i] };
}

export type NewMemberInput = Omit<MemberRecord, "id">;

export function addMember(input: NewMemberInput): MemberRecord {
  hydrateMembersFromStorage();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const row: MemberRecord = { ...input, id };
  membersCache.push(row);
  persistMembersToStorage();
  return row;
}

export function tallyMembersForCell(cellSlug: string): CellStats {
  hydrateMembersFromStorage();
  let total = 0;
  let active = 0;
  let inactive = 0;
  let dormant = 0;
  for (const m of membersCache) {
    if (m.cellId !== cellSlug) continue;
    total += 1;
    if (m.memberStatus === "active") active += 1;
    else if (m.memberStatus === "inactive") inactive += 1;
    else dormant += 1;
  }
  return { totalMembers: total, active, inactive, dormant };
}

export function parseMemberListFilter(value: string | null): MemberListFilter {
  if (value === "active" || value === "inactive" || value === "dormant") {
    return value;
  }
  return "all";
}
