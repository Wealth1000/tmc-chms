import { redirect } from "next/navigation";
import { RecordAttendanceView } from "@/components/cell-dashboard/RecordAttendanceView";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadCellLeaderDashboard } from "@/lib/supabase/cells-queries";
import { firstSearchParam } from "@/lib/dev-login";
import { listMembers } from "@/lib/members-store";

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

  const members = listMembers()
    .filter((m) => m.cellId === resolved.cellSlug)
    .map((m) => ({
      id: m.id,
      fullName: m.fullName,
      memberStatus: m.memberStatus,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <RecordAttendanceView
        key={resolved.cellSlug}
        homeHref={cellDashboardHref(resolved.cellSlug)}
        members={members}
      />
    </div>
  );
}
