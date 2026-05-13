import type { CellGroupRow } from "@/lib/admin-cells-store";
import type { FoundationSchoolId, MemberRecord } from "@/lib/members-store";

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

const JOIN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Deterministic demo phone — not stored on `MemberRecord`. */
export function demoPhoneForMember(memberId: string): string {
  const h = djb2(memberId);
  const area = 200 + (h % 50);
  const mid = String(200 + (h % 799)).padStart(3, "0");
  const last = String(1000 + (h % 9000)).padStart(4, "0");
  return `(${area}) ${mid}-${last}`;
}

export function demoJoinedLabel(memberId: string): string {
  const h = djb2(memberId);
  const mo = JOIN_MONTHS[h % 12]!;
  const day = 1 + (h % 28);
  const year = 2023 + (h % 3);
  return `Joined ${mo} ${day}, ${year}`;
}

export type CellFoundationBreakdown = {
  completed: number;
  inProgress: number;
  notStarted: number;
};

export function getFoundationBreakdown(members: MemberRecord[]): CellFoundationBreakdown {
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  for (const m of members) {
    if (m.foundationStatus === "completed") completed += 1;
    else if (m.foundationStatus === "started") inProgress += 1;
    else notStarted += 1;
  }
  return { completed, inProgress, notStarted };
}

export function foundationCompletionRatePct(members: MemberRecord[]): number {
  const n = members.length;
  if (!n) return 0;
  const c = members.filter((m) => m.foundationStatus === "completed").length;
  return Math.round((c / n) * 100);
}

export type CellAttendanceDemo = {
  averagePresent: number;
  attendanceRatePct: number;
  weeklyPresent: number[];
};

export function getCellAttendanceDemo(cell: CellGroupRow): CellAttendanceDemo {
  const total = Math.max(cell.total, 1);
  const h = djb2(cell.id);
  const anchor = Math.min(cell.active, total);
  const averagePresent = Math.max(
    0,
    Math.min(total, Math.round(anchor * 0.78 + total * 0.06 + (h % 4))),
  );
  const attendanceRatePct = Math.min(100, Math.round((averagePresent / total) * 100));
  const weeklyPresent: number[] = [];
  const cap = Math.max(5, Math.min(20, total + 2));
  for (let i = 0; i < 8; i++) {
    const w = djb2(`${cell.id}-wk${i}`);
    const v = Math.max(0, Math.min(cap, Math.round(averagePresent + (w % 9) - 4)));
    weeklyPresent.push(v);
  }
  return { averagePresent, attendanceRatePct, weeklyPresent };
}

export type CellTimelineItem = {
  id: string;
  title: string;
  timeLabel: string;
  byLine: string;
};

export function buildCellActivityTimeline(cell: CellGroupRow): CellTimelineItem[] {
  const { id, leader, total, active } = cell;
  const present =
    total > 0 ? Math.max(1, Math.min(total, Math.round(active * 0.88 + (total - active) * 0.15))) : 0;
  const fsDone = Math.max(0, Math.floor(active * 0.22));
  return [
    {
      id: `${id}-tl1`,
      title: `Attendance recorded: ${present} members present`,
      timeLabel: "May 5, 2026 at 7:30 PM",
      byLine: `By ${leader}`,
    },
    {
      id: `${id}-tl2`,
      title: "Member status updated",
      timeLabel: "May 4, 2026 at 2:15 PM",
      byLine: `By ${leader}`,
    },
    {
      id: `${id}-tl3`,
      title: "Monthly report submitted",
      timeLabel: "May 3, 2026 at 11:20 AM",
      byLine: `By ${leader}`,
    },
    {
      id: `${id}-tl4`,
      title: "New member added to roster",
      timeLabel: "May 2, 2026 at 8:45 PM",
      byLine: `By ${leader}`,
    },
    {
      id: `${id}-tl5`,
      title: `Foundation School completion: ${fsDone} members`,
      timeLabel: "May 1, 2026 at 6:00 PM",
      byLine: `By ${leader}`,
    },
  ];
}

export function foundationSchoolBadge(
  status: FoundationSchoolId,
): { label: string; className: string } {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        className: "border-neutral-900 bg-neutral-900 text-white",
      };
    case "started":
      return {
        label: "In Progress",
        className: "border-sky-200 bg-sky-50 text-sky-900",
      };
    default:
      return {
        label: "Not Started",
        className: "border-neutral-200 bg-neutral-100 text-neutral-600",
      };
  }
}
