import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminActivityItem } from "@/lib/admin-cells-store";

function formatTimeLabel(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatMeetingShort(isoDate: string): string {
  if (!isoDate) return "Meeting";
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/** Recent member adds + attendance saves across all cells (admin RLS). */
export async function fetchAdminRecentActivityItems(
  supabase: SupabaseClient,
  limit = 20,
): Promise<AdminActivityItem[]> {
  const half = Math.ceil(limit / 2);

  const [memRes, attRes] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, cell_slug, created_at")
      .order("created_at", { ascending: false })
      .limit(half + 5),
    supabase
      .from("attendance_sessions")
      .select("id, cell_slug, meeting_date, member_present_count, invitee_count, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(half + 5),
  ]);

  const slugs = new Set<string>();
  for (const m of memRes.data ?? []) {
    slugs.add(String((m as { cell_slug: string }).cell_slug));
  }
  for (const a of attRes.data ?? []) {
    slugs.add(String((a as { cell_slug: string }).cell_slug));
  }

  let cellNames = new Map<string, string>();
  if (slugs.size > 0) {
    const { data: cells } = await supabase.from("cells").select("slug, name").in("slug", [...slugs]);
    for (const c of cells ?? []) {
      cellNames.set(String((c as { slug: string }).slug), String((c as { name?: string }).name ?? ""));
    }
  }

  type Row = { sortAt: number; item: AdminActivityItem };
  const rows: Row[] = [];

  for (const m of memRes.data ?? []) {
    const created = String((m as { created_at?: string }).created_at ?? "");
    const slug = String((m as { cell_slug: string }).cell_slug);
    rows.push({
      sortAt: created ? Date.parse(created) : 0,
      item: {
        id: `m-${(m as { id: string }).id}`,
        type: "member",
        cellName: cellNames.get(slug) ?? slug,
        categoryLabel: "New member",
        description: `Added ${String((m as { full_name?: string }).full_name ?? "").trim() || "Member"}`,
        timeLabel: formatTimeLabel(created),
      },
    });
  }

  for (const a of attRes.data ?? []) {
    const rec = String((a as { recorded_at?: string }).recorded_at ?? "");
    const slug = String((a as { cell_slug: string }).cell_slug);
    const md = String((a as { meeting_date?: string }).meeting_date ?? "");
    const pc = Number((a as { member_present_count?: number }).member_present_count ?? 0);
    const ic = Number((a as { invitee_count?: number }).invitee_count ?? 0);
    const parts = [`${pc} present`];
    if (ic > 0) parts.push(`${ic} invitee${ic === 1 ? "" : "s"}`);
    rows.push({
      sortAt: rec ? Date.parse(rec) : 0,
      item: {
        id: `a-${(a as { id: string }).id}`,
        type: "attendance",
        cellName: cellNames.get(slug) ?? slug,
        categoryLabel: "Attendance",
        description: `${formatMeetingShort(md)} · ${parts.join(" · ")}`,
        timeLabel: formatTimeLabel(rec),
      },
    });
  }

  rows.sort((a, b) => b.sortAt - a.sortAt);
  return rows.slice(0, limit).map((r) => r.item);
}
