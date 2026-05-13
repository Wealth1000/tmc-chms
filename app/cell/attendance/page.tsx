import { redirect } from "next/navigation";
import { RecordAttendanceClient } from "@/components/cell-dashboard/RecordAttendanceClient";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCellLeaderDashboard } from "@/lib/supabase/cells-queries";
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
  const resolved = await loadCellLeaderDashboard(supabase, cell);
  if (!resolved) {
    redirect("/");
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <RecordAttendanceClient
        key={resolved.cellSlug}
        cellSlug={resolved.cellSlug}
        homeHref={cellDashboardHref(resolved.cellSlug)}
      />
    </div>
  );
}
