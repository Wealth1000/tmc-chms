import { AdminDashboardHome } from "@/components/admin/AdminDashboardHome";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllCellGroupRows } from "@/lib/supabase/cells-queries";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const cellRows = await fetchAllCellGroupRows(supabase);
  return <AdminDashboardHome cellRows={cellRows} />;
}
