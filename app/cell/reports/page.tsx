import { redirect } from "next/navigation";
import { CellReportsView } from "@/components/cell-dashboard/CellReportsView";
import { LeaderCellPageShell } from "@/components/cell-dashboard/LeaderCellPageShell";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCellLeaderDashboard } from "@/lib/supabase/cells-queries";
import { firstSearchParam } from "@/lib/dev-login";

type PageProps = {
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function CellReportsPage({ searchParams }: PageProps) {
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
      <LeaderCellPageShell
        cellSlug={resolved.cellSlug}
        server={{
          dashboard: {
            cellName: resolved.cellName,
            leaderName: resolved.leaderName,
            stats: resolved.stats,
            lastUpdatedLabel: resolved.lastUpdatedLabel,
            activities: resolved.activities,
          },
        }}
      >
        <CellReportsView key={resolved.cellSlug} homeHref={cellDashboardHref(resolved.cellSlug)} />
      </LeaderCellPageShell>
    </div>
  );
}
