import { redirect } from "next/navigation";
import { RecordAttendanceView } from "@/components/cell-dashboard/RecordAttendanceView";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { fetchMembersForCell } from "@/lib/supabase/members-queries";
import { firstSearchParam } from "@/lib/dev-login";

type PageProps = {
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function CellAttendancePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cell = firstSearchParam(sp.cell);
  if (!cell) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const row = await fetchCellDbRow(supabase, cell);
  if (!row) {
    redirect("/");
  }

  const members = await fetchMembersForCell(supabase, row.slug);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <RecordAttendanceView
        key={row.slug}
        cellSlug={row.slug}
        homeHref={cellDashboardHref(row.slug)}
        members={members.map((m) => ({
          id: m.id,
          fullName: m.fullName,
          memberStatus: m.memberStatus,
        }))}
      />
    </div>
  );
}
