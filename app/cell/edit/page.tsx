import { redirect } from "next/navigation";
import { EditCellInfoForm } from "@/components/cell-dashboard/EditCellInfoForm";
import { LeaderCellPageShell } from "@/components/cell-dashboard/LeaderCellPageShell";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { cellDbRowToEditableInfo } from "@/lib/cell-leader-editable-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { fetchCellRosterWithLeader } from "@/lib/supabase/cell-roster-queries";
import { firstSearchParam } from "@/lib/dev-login";

type PageProps = {
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function CellEditInfoPage({ searchParams }: PageProps) {
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

  const { data: prof } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.leader_user_id)
    .maybeSingle();

  const initial = cellDbRowToEditableInfo(row, String(prof?.full_name ?? ""));
  const members = await fetchCellRosterWithLeader(supabase, cell);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <LeaderCellPageShell cellSlug={cell} server={{ editable: initial, members }}>
        <EditCellInfoForm key={cell} homeHref={cellDashboardHref(cell)} />
      </LeaderCellPageShell>
    </div>
  );
}
