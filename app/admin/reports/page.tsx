import { AdminReportsDashboard } from "@/components/admin/AdminReportsDashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllCellGroupRows } from "@/lib/supabase/cells-queries";

export default async function AdminReportsPage() {
  const supabase = await createSupabaseServerClient();
  const cellRows = await fetchAllCellGroupRows(supabase);
  return (
    <div className="w-full min-w-0 max-w-full px-3 py-6 pb-10 sm:px-4 lg:px-8 lg:py-8">
      <AdminReportsDashboard cellRows={cellRows} />
    </div>
  );
}
