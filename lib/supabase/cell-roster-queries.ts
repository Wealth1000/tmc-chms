import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CELL_LEADER_ROSTER_ID_PREFIX,
  type MemberRecord,
} from "@/lib/members-store";
import { fetchCellDbRow, fetchLeaderDisplayMap } from "@/lib/supabase/cells-queries";
import { fetchMembersForCell } from "@/lib/supabase/members-queries";

export function buildSyntheticLeaderMember(
  cellSlug: string,
  leaderUserId: string,
  display: { name: string; email: string },
): MemberRecord {
  const name = display.name.trim() || "Cell leader";
  return {
    id: `${CELL_LEADER_ROSTER_ID_PREFIX}${leaderUserId}`,
    cellId: cellSlug,
    rosterRole: "leader",
    fullName: name,
    email: display.email.trim(),
    phone: "",
    dateOfBirth: "",
    area: "",
    isStudent: false,
    occupation: "Cell leader",
    foundationStatus: "yet_to_start",
    memberStatus: "active",
  };
}

/** Cell leader + `members` rows (deduped if a member shares the leader’s email). Attendance should use `fetchMembersForCell` only. */
export async function fetchCellRosterWithLeader(
  supabase: SupabaseClient,
  cellSlug: string,
): Promise<MemberRecord[]> {
  const cell = await fetchCellDbRow(supabase, cellSlug);
  if (!cell) return [];

  const [members, leaderMap] = await Promise.all([
    fetchMembersForCell(supabase, cellSlug),
    fetchLeaderDisplayMap(supabase, [cell.leader_user_id]),
  ]);

  const ld = leaderMap.get(cell.leader_user_id) ?? { name: "", email: "" };
  const leaderEmail = ld.email.trim().toLowerCase();
  const rest = members
    .filter((m) => m.email.trim().toLowerCase() !== leaderEmail)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const leaderRow = buildSyntheticLeaderMember(cellSlug, cell.leader_user_id, ld);
  return [leaderRow, ...rest];
}
