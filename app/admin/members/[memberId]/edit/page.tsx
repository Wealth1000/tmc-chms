import { notFound } from "next/navigation";
import { EditMemberForm } from "@/components/cell-dashboard/EditMemberForm";
import { adminMembersHref } from "@/lib/admin-members-links";
import { firstSearchParam } from "@/lib/dev-login";
import { getMemberById, parseMemberListFilter } from "@/lib/members-store";

type PageProps = {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ filter?: string | string[] }>;
};

export default async function AdminEditMemberPage({ params, searchParams }: PageProps) {
  const [{ memberId }, sp] = await Promise.all([params, searchParams]);
  const filter = parseMemberListFilter(firstSearchParam(sp.filter) ?? null);
  const member = getMemberById(memberId);
  if (!member) {
    notFound();
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <EditMemberForm key={member.id} member={member} listHref={adminMembersHref(filter)} />
    </div>
  );
}
