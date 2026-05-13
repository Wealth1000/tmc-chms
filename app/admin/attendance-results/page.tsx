import { AdminAttendanceResultsClient } from "@/components/admin/AdminAttendanceResultsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchDayAttendanceReport,
  fetchSessionsByEventTitle,
} from "@/lib/supabase/attendance-results-queries";

type PageProps = {
  searchParams: Promise<{ date?: string | string[]; event?: string | string[] }>;
};

function firstString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return "";
}

export default async function AdminAttendanceResultsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const dateParam = firstString(sp.date).trim();
  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
  const eventParam = firstString(sp.event).trim();

  const supabase = await createSupabaseServerClient();

  const [dayReport, eventRows] = await Promise.all([
    dateValid ? fetchDayAttendanceReport(supabase, dateParam) : Promise.resolve(null),
    eventParam.length >= 2 ? fetchSessionsByEventTitle(supabase, eventParam) : Promise.resolve([]),
  ]);

  return (
    <AdminAttendanceResultsClient
      dateParam={dateParam}
      dateValid={dateValid}
      eventParam={eventParam}
      dayReport={dayReport}
      eventRows={eventRows}
    />
  );
}
