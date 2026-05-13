import { Suspense } from "react";
import { AdminMembersDirectory } from "@/components/admin/AdminMembersDirectory";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listMembersWithCellNamesServer } from "@/lib/admin-members-roster";

function AdminMembersFallback() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0B0E14]">
      <div className="h-12 shrink-0 px-4 pt-[max(1rem,env(safe-area-inset-top,0px))]" />
      <div className="min-h-0 flex-1 bg-white" />
    </div>
  );
}

export default async function AdminMembersPage() {
  const supabase = await createSupabaseServerClient();
  const initialMembers = await listMembersWithCellNamesServer(supabase);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <Suspense fallback={<AdminMembersFallback />}>
        <AdminMembersDirectory initialMembers={initialMembers} />
      </Suspense>
    </div>
  );
}
