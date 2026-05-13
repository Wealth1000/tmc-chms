import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import type { CellDbRow } from "@/lib/supabase/cells-queries";

function formatUpdatedLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

export function cellDbRowToEditableInfo(cell: CellDbRow, leaderFullName: string): CellLeaderEditableInfo {
  return {
    cellName: cell.name,
    leaderName: leaderFullName.trim() || "Cell leader",
    description: cell.description ?? "",
    meetingLocation: cell.meeting_location ?? "",
    meetingDay: cell.meeting_day?.trim() || "Wednesday",
    meetingTime: cell.meeting_time?.trim() || "7:00 PM",
    lastUpdatedLabel: formatUpdatedLabel(cell.updated_at),
  };
}
