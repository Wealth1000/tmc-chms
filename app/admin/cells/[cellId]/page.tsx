import { notFound } from "next/navigation";
import { AdminCellGroupDetail } from "@/components/admin/AdminCellGroupDetail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellGroupRowBySlug } from "@/lib/supabase/cells-queries";
import { listMembers } from "@/lib/members-store";

type PageProps = {
  params: Promise<{ cellId: string }>;
};

export default async function AdminCellDetailPage({ params }: PageProps) {
  const { cellId } = await params;
  const supabase = await createSupabaseServerClient();
  const cell = await fetchCellGroupRowBySlug(supabase, cellId);
  if (!cell) {
    notFound();
  }

  const members = listMembers()
    .filter((m) => m.cellId === cellId)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return <AdminCellGroupDetail cell={cell} members={members} />;
}
