import { redirect } from "next/navigation";
import { DashboardPageClient } from "@/components/cell-dashboard/DashboardPageClient";
import type { ActivityListItem } from "@/components/cell-dashboard/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCellLeaderDashboard } from "@/lib/supabase/cells-queries";
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
  const resolved = await loadCellLeaderDashboard(supabase, cellSlug);
  if (!resolved) {
    redirect("/");
  }

  const activities: ActivityListItem[] = [];

  return (
    <div className="flex h-full min-h-[100dvh] w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <DashboardPageClient
        cellSlug={resolved.cellSlug}
        cellName={resolved.cellName}
        leaderName={resolved.leaderName}
        stats={resolved.stats}
        lastUpdatedLabel={resolved.lastUpdatedLabel}
        activities={activities}
      />
    </div>
  );
}
