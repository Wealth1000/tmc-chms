import type { SupabaseClient } from "@supabase/supabase-js";
import { buildSyntheticLeaderMember } from "@/lib/supabase/cell-roster-queries";
import { fetchLeaderDisplayMap } from "@/lib/supabase/cells-queries";
import { memberRowToRecord, type MemberDbRow } from "@/lib/supabase/members-queries";
import type { MemberRecord } from "@/lib/members-store";

export type AdminMemberRosterRow = MemberRecord & { cellName: string };

export async function listMembersWithCellNamesServer(
  supabase: SupabaseClient,
): Promise<AdminMemberRosterRow[]> {
  const [{ data: cells, error: cellsErr }, { data: members, error: memErr }] = await Promise.all([
    supabase.from("cells").select("slug, name, leader_user_id").order("name", { ascending: true }),
    supabase
      .from("members")
      .select(
        "id, cell_slug, full_name, email, phone, date_of_birth, area, is_student, occupation, foundation_status, member_status, created_at",
      )
      .order("full_name", { ascending: true }),
  ]);

  const nameBySlug = new Map<string, string>();
  for (const c of cells ?? []) {
    nameBySlug.set(String((c as { slug: string }).slug), String((c as { name?: string }).name ?? ""));
  }

  const leaderEmailsBySlug = new Map<string, string>();
  const leaderRows: AdminMemberRosterRow[] = [];

  if (!cellsErr && cells?.length) {
    const leaderIds = [
      ...new Set(
        (cells as { leader_user_id: string }[]).map((c) => String(c.leader_user_id)),
      ),
    ];
    const leaderMap = await fetchLeaderDisplayMap(supabase, leaderIds);

    for (const c of cells as { slug: string; name?: string; leader_user_id: string }[]) {
      const slug = String(c.slug ?? "").trim();
      if (!slug) continue;
      const ld = leaderMap.get(c.leader_user_id) ?? { name: "", email: "" };
      leaderEmailsBySlug.set(slug, ld.email.trim().toLowerCase());
      leaderRows.push({
        ...buildSyntheticLeaderMember(slug, c.leader_user_id, ld),
        cellName: String(c.name ?? "").trim() || "—",
      });
    }
  }

  const memberRows: AdminMemberRosterRow[] = [];
  if (!memErr && members?.length) {
    for (const row of members as MemberDbRow[]) {
      const slug = String(row.cell_slug ?? "").trim();
      const le = leaderEmailsBySlug.get(slug);
      if (le && row.email.trim().toLowerCase() === le) continue;
      memberRows.push({
        ...memberRowToRecord(row),
        cellName: nameBySlug.get(row.cell_slug) ?? "—",
      });
    }
  }

  return [...leaderRows, ...memberRows].sort((a, b) => a.fullName.localeCompare(b.fullName));
}
