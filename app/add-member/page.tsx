import { redirect } from "next/navigation";
import { AddMemberForm } from "@/components/cell-dashboard/AddMemberForm";
import { cellDashboardHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { firstSearchParam } from "@/lib/dev-login";

type PageProps = {
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function AddMemberPage({ searchParams }: PageProps) {
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

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <AddMemberForm cellSlug={cell} homeHref={cellDashboardHref(cell)} />
    </div>
  );
}
