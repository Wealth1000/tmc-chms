import { AdminCellsDirectory } from "@/components/admin/AdminCellsDirectory";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllCellGroupRows } from "@/lib/supabase/cells-queries";

export default async function AdminCellsDirectoryPage() {
  const supabase = await createSupabaseServerClient();
  const rows = await fetchAllCellGroupRows(supabase);
  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none">
      <AdminCellsDirectory rows={rows} />
    </div>
  );
}
