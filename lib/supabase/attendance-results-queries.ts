import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AttendanceSessionListRow,
  DayAttendanceReport,
} from "@/lib/attendance-results-models";

export type { AttendanceSessionListRow, DayAttendanceReport } from "@/lib/attendance-results-models";

async function cellNameMap(
  supabase: SupabaseClient,
  slugs: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniq = [...new Set(slugs)].filter(Boolean);
  if (!uniq.length) return map;
  const { data } = await supabase.from("cells").select("slug, name").in("slug", uniq);
  for (const c of data ?? []) {
    map.set(String((c as { slug: string }).slug), String((c as { name?: string }).name ?? ""));
  }
  return map;
}

function mapSessionRows(
  data: Record<string, unknown>[],
  names: Map<string, string>,
): AttendanceSessionListRow[] {
  return data.map((r) => {
    const slug = String(r.cell_slug ?? "");
    const off = r.offering_amount;
    return {
      id: String(r.id ?? ""),
      cellSlug: slug,
      cellName: names.get(slug) ?? slug,
      meetingDate: String(r.meeting_date ?? ""),
      memberPresentCount: Number(r.member_present_count ?? 0),
      inviteeCount: Number(r.invitee_count ?? 0),
      recordedAt: String(r.recorded_at ?? ""),
      eventTitle: String(r.event_title ?? ""),
      offeringAmount: off != null && off !== "" ? Number(off) : null,
    };
  });
}

/** yyyy-mm-dd */
export async function fetchDayAttendanceReport(
  supabase: SupabaseClient,
  meetingDate: string,
): Promise<DayAttendanceReport> {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(
      "id, cell_slug, meeting_date, member_present_count, invitee_count, recorded_at, event_title, offering_amount",
    )
    .eq("meeting_date", meetingDate)
    .order("cell_slug", { ascending: true });

  if (error || !data?.length) {
    return {
      meetingDate,
      totalMemberPresent: 0,
      totalInvitees: 0,
      totalOffering: 0,
      sessionCount: 0,
      rows: [],
    };
  }

  const rowsRaw = data as Record<string, unknown>[];
  const names = await cellNameMap(
    supabase,
    rowsRaw.map((r) => String(r.cell_slug ?? "")),
  );
  const rows = mapSessionRows(rowsRaw, names);
  let totalMemberPresent = 0;
  let totalInvitees = 0;
  let totalOffering = 0;
  for (const row of rows) {
    totalMemberPresent += row.memberPresentCount;
    totalInvitees += row.inviteeCount;
    if (row.offeringAmount != null && !Number.isNaN(row.offeringAmount)) {
      totalOffering += row.offeringAmount;
    }
  }
  return {
    meetingDate,
    totalMemberPresent,
    totalInvitees,
    totalOffering,
    sessionCount: rows.length,
    rows,
  };
}

/** Strip characters that break PostgREST ilike patterns; keep letters, numbers, spaces, apostrophe, hyphen. */
function sanitizeEventSearchQuery(q: string): string {
  return q.replace(/[^\p{L}\p{N}\s'-]/gu, "").trim();
}

export async function fetchSessionsByEventTitle(
  supabase: SupabaseClient,
  query: string,
  limit = 120,
): Promise<AttendanceSessionListRow[]> {
  const safe = sanitizeEventSearchQuery(query);
  if (safe.length < 2) return [];

  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(
      "id, cell_slug, meeting_date, member_present_count, invitee_count, recorded_at, event_title, offering_amount",
    )
    .ilike("event_title", `%${safe}%`)
    .order("meeting_date", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];

  const rowsRaw = data as Record<string, unknown>[];
  const names = await cellNameMap(
    supabase,
    rowsRaw.map((r) => String(r.cell_slug ?? "")),
  );
  return mapSessionRows(rowsRaw, names);
}
