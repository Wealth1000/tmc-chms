import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CellMembersView } from "@/components/cell-dashboard/CellMembersView";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { firstSearchParam } from "@/lib/dev-login";

function CellMembersFallback() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0B0E14]">
      <div className="h-12 shrink-0 px-4 pt-[max(1rem,env(safe-area-inset-top,0px))]" />
      <div className="min-h-0 flex-1 bg-white" />
    </div>
  );
}

type PageProps = {
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function CellMembersPage({ searchParams }: PageProps) {
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
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <Suspense fallback={<CellMembersFallback />}>
        <CellMembersView cellSlug={cell} />
      </Suspense>
    </div>
  );
}
