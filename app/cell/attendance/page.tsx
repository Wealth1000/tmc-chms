import { redirect } from "next/navigation";
import { LeaderCellPageShell } from "@/components/cell-dashboard/LeaderCellPageShell";
import { RecordAttendanceView } from "@/components/cell-dashboard/RecordAttendanceView";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { fetchCellRosterWithLeader } from "@/lib/supabase/cell-roster-queries";
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

  const members = await fetchCellRosterWithLeader(supabase, row.slug);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <LeaderCellPageShell cellSlug={row.slug} server={{ members }}>
        <RecordAttendanceView key={row.slug} homeHref={cellDashboardHref(row.slug)} />
      </LeaderCellPageShell>
    </div>
  );
}
