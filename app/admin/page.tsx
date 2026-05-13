import { AdminDashboardHome } from "@/components/admin/AdminDashboardHome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAdminRecentActivityItems } from "@/lib/supabase/admin-activity-queries";
import { fetchAllCellGroupRows } from "@/lib/supabase/cells-queries";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const [cellRows, activityItems] = await Promise.all([
    fetchAllCellGroupRows(supabase),
    fetchAdminRecentActivityItems(supabase, 12),
  ]);
  return <AdminDashboardHome cellRows={cellRows} activityItems={activityItems} />;
}
