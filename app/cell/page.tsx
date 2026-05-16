import { redirect } from "next/navigation";
import { DashboardPageClient } from "@/components/cell-dashboard/DashboardPageClient";
import { LeaderCellPageShell } from "@/components/cell-dashboard/LeaderCellPageShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCellLeaderDashboard } from "@/lib/supabase/cells-queries";
import { getRoleSwitchMenuProps } from "@/lib/auth/role-switch-menu";
import { firstSearchParam } from "@/lib/dev-login";

type PageProps = {
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function CellLeaderPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cellSlug = firstSearchParam(sp.cell);
  if (!cellSlug) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const [resolved, roleSwitch] = await Promise.all([
    loadCellLeaderDashboard(supabase, cellSlug),
    getRoleSwitchMenuProps("leader"),
  ]);
  if (!resolved) {
    redirect("/");
  }

  return (
    <div className="flex h-full min-h-[100dvh] w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
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
        <DashboardPageClient roleSwitch={roleSwitch} />
      </LeaderCellPageShell>
    </div>
  );
}
