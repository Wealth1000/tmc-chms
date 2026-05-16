import { notFound, redirect } from "next/navigation";
import { EditMemberForm } from "@/components/cell-dashboard/EditMemberForm";
import { LeaderCellPageShell } from "@/components/cell-dashboard/LeaderCellPageShell";
import { fetchCellRosterWithLeader } from "@/lib/supabase/cell-roster-queries";
import { cellMembersHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { fetchMemberById } from "@/lib/supabase/members-queries";
import { firstSearchParam } from "@/lib/dev-login";

type PageProps = {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ cell?: string | string[] }>;
};

export default async function EditMemberPage({ params, searchParams }: PageProps) {
  const [{ memberId }, sp] = await Promise.all([params, searchParams]);
  const cell = firstSearchParam(sp.cell);
  if (!cell) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const row = await fetchCellDbRow(supabase, cell);
  if (!row) {
    redirect("/");
  }

  const [member, members] = await Promise.all([
    fetchMemberById(supabase, memberId),
    fetchCellRosterWithLeader(supabase, cell),
  ]);
  if (!member || member.cellId !== cell) {
    notFound();
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <LeaderCellPageShell cellSlug={cell} server={{ members, member }}>
        <EditMemberForm key={member.id} memberId={member.id} listHref={cellMembersHref(cell, "all")} />
      </LeaderCellPageShell>
    </div>
  );
}
