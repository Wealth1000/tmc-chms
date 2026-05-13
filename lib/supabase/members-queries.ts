import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityListItem, CellStats } from "@/components/cell-dashboard/types";
import type {
  FoundationSchoolId,
  MemberRecord,
  MemberRosterStatus,
} from "@/lib/members-store";

export type MemberDbRow = {
  id: string;
  cell_slug: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  area: string;
  is_student: boolean;
  occupation: string;
  foundation_status: string;
  member_status: string;
  created_at?: string;
  updated_at?: string;
};

function emptyStats(): CellStats {
  return { totalMembers: 0, active: 0, inactive: 0, dormant: 0 };
}

export async function fetchMemberRollupMap(
  supabase: SupabaseClient,
): Promise<Map<string, CellStats>> {
  const map = new Map<string, CellStats>();

  const { data: cells, error: cellsErr } = await supabase.from("cells").select("slug");
  if (!cellsErr && cells?.length) {
    for (const c of cells) {
      const slug = String((c as { slug?: string }).slug ?? "").trim();
      if (!slug) continue;
      map.set(slug, { totalMembers: 1, active: 1, inactive: 0, dormant: 0 });
    }
  }

  const { data, error } = await supabase.from("members").select("cell_slug, member_status");
  if (error || !data?.length) return map;

  for (const row of data) {
    const slug = String(row.cell_slug ?? "").trim();
    if (!slug) continue;
    let s = map.get(slug);
    if (!s) {
      s = emptyStats();
      map.set(slug, s);
    }
    s.totalMembers += 1;
    const st = String(row.member_status ?? "");
    if (st === "active") s.active += 1;
    else if (st === "inactive") s.inactive += 1;
    else s.dormant += 1;
  }
  return map;
}

export async function fetchGlobalMemberStatusCounts(
  supabase: SupabaseClient,
): Promise<{ totalMembers: number; active: number; inactive: number; dormant: number }> {
  const { data, error } = await supabase.from("members").select("member_status");
  if (error || !data?.length) {
    return { totalMembers: 0, active: 0, inactive: 0, dormant: 0 };
  }
  let active = 0;
  let inactive = 0;
  let dormant = 0;
  for (const row of data) {
    const st = String(row.member_status ?? "");
    if (st === "active") active += 1;
    else if (st === "inactive") inactive += 1;
    else dormant += 1;
  }
  return { totalMembers: data.length, active, inactive, dormant };
}

export function memberRowToRecord(row: MemberDbRow): MemberRecord {
  return {
    id: row.id,
    cellId: row.cell_slug,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    createdAt: row.created_at,
    dateOfBirth: row.date_of_birth ?? "",
    area: row.area ?? "",
    isStudent: Boolean(row.is_student),
    occupation: row.occupation ?? "",
    foundationStatus: row.foundation_status as FoundationSchoolId,
    memberStatus: row.member_status as MemberRosterStatus,
  };
}

export async function fetchMembersForCell(
  supabase: SupabaseClient,
  cellSlug: string,
): Promise<MemberRecord[]> {
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, cell_slug, full_name, email, phone, date_of_birth, area, is_student, occupation, foundation_status, member_status, created_at",
    )
    .eq("cell_slug", cellSlug)
    .order("full_name", { ascending: true });

  if (error || !data) return [];
  return (data as MemberDbRow[]).map(memberRowToRecord);
}

export async function fetchMemberById(
  supabase: SupabaseClient,
  memberId: string,
): Promise<MemberRecord | null> {
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, cell_slug, full_name, email, phone, date_of_birth, area, is_student, occupation, foundation_status, member_status, created_at",
    )
    .eq("id", memberId)
    .maybeSingle();

  if (error || !data) return null;
  return memberRowToRecord(data as MemberDbRow);
}

function formatMeetingActivityTitle(meetingDate: string): string {
  if (!meetingDate) return "Attendance";
  try {
    const d = new Date(`${meetingDate}T12:00:00`);
    return `Attendance · ${d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  } catch {
    return `Attendance · ${meetingDate}`;
  }
}

export async function fetchRecentActivitiesForCell(
  supabase: SupabaseClient,
  cellSlug: string,
  limit = 25,
): Promise<ActivityListItem[]> {
  const [memRes, attRes] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, created_at")
      .eq("cell_slug", cellSlug)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("attendance_sessions")
      .select("id, meeting_date, member_present_count, invitee_count, recorded_at")
      .eq("cell_slug", cellSlug)
      .order("recorded_at", { ascending: false })
      .limit(20),
  ]);

  type Row = { sortAt: number; item: ActivityListItem };
  const rows: Row[] = [];

  for (const m of memRes.data ?? []) {
    const created = String((m as { created_at?: string }).created_at ?? "");
    const sortAt = created ? Date.parse(created) : 0;
    rows.push({
      sortAt,
      item: {
        id: `member-${(m as { id: string }).id}`,
        icon: "member-add",
        title: `Added ${String((m as { full_name?: string }).full_name ?? "").trim() || "Member"}`,
        subtext: "New member joined the cell",
      },
    });
  }

  for (const a of attRes.data ?? []) {
    const rec = String((a as { recorded_at?: string }).recorded_at ?? "");
    const sortAt = rec ? Date.parse(rec) : 0;
    const md = String((a as { meeting_date?: string }).meeting_date ?? "");
    const pc = Number((a as { member_present_count?: number }).member_present_count ?? 0);
    const ic = Number((a as { invitee_count?: number }).invitee_count ?? 0);
    const parts: string[] = [];
    parts.push(`${pc} member${pc === 1 ? "" : "s"} present`);
    if (ic > 0) parts.push(`${ic} invitee${ic === 1 ? "" : "s"}`);
    rows.push({
      sortAt,
      item: {
        id: `attendance-${(a as { id: string }).id}`,
        icon: "attendance",
        title: formatMeetingActivityTitle(md),
        subtext: parts.join(" · "),
      },
    });
  }

  rows.sort((a, b) => b.sortAt - a.sortAt);
  return rows.slice(0, limit).map((r) => r.item);
}
