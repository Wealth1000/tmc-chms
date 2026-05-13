import type { SupabaseClient } from "@supabase/supabase-js";
import { memberRowToRecord, type MemberDbRow } from "@/lib/supabase/members-queries";
import type { MemberRecord } from "@/lib/members-store";

export type AdminMemberRosterRow = MemberRecord & { cellName: string };

export async function listMembersWithCellNamesServer(
  supabase: SupabaseClient,
): Promise<AdminMemberRosterRow[]> {
  const { data: members, error } = await supabase
    .from("members")
    .select(
      "id, cell_slug, full_name, email, phone, date_of_birth, area, is_student, occupation, foundation_status, member_status",
    )
    .order("full_name", { ascending: true });

  if (error || !members?.length) return [];

  const slugs = [...new Set(members.map((m) => String((m as MemberDbRow).cell_slug)))];
  const { data: cells } = await supabase.from("cells").select("slug, name").in("slug", slugs);

  const nameBySlug = new Map<string, string>();
  for (const c of cells ?? []) {
    nameBySlug.set(String(c.slug), String(c.name ?? ""));
  }

  return (members as MemberDbRow[]).map((row) => ({
    ...memberRowToRecord(row),
    cellName: nameBySlug.get(row.cell_slug) ?? "—",
  }));
}
