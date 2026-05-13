import type { SupabaseClient } from "@supabase/supabase-js";
import { listMembers, type MemberRecord } from "@/lib/members-store";

export type AdminMemberRosterRow = MemberRecord & { cellName: string };

export async function listMembersWithCellNamesServer(
  supabase: SupabaseClient,
): Promise<AdminMemberRosterRow[]> {
  const { data: cells } = await supabase.from("cells").select("slug, name");
  const nameBySlug = new Map<string, string>();
  for (const c of cells ?? []) {
    nameBySlug.set(String(c.slug), String(c.name ?? ""));
  }
  return listMembers().map((m) => ({
    ...m,
    cellName: nameBySlug.get(m.cellId) ?? "—",
  }));
}
