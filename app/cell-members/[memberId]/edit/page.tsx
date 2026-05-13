import { notFound, redirect } from "next/navigation";
import { EditMemberForm } from "@/components/cell-dashboard/EditMemberForm";
import { cellMembersHref } from "@/lib/cell-leader-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { firstSearchParam } from "@/lib/dev-login";
import { getMemberById } from "@/lib/members-store";

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

  const member = getMemberById(memberId);
  if (!member) {
    notFound();
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <EditMemberForm
        key={member.id}
        member={member}
        listHref={cellMembersHref(cell, "all")}
      />
    </div>
  );
}
