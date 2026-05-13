export type AttendanceSessionListRow = {
  id: string;
  cellSlug: string;
  cellName: string;
  meetingDate: string;
  memberPresentCount: number;
  inviteeCount: number;
  recordedAt: string;
  eventTitle: string;
  offeringAmount: number | null;
};

export type DayAttendanceReport = {
  meetingDate: string;
  totalMemberPresent: number;
  totalInvitees: number;
  totalOffering: number;
  sessionCount: number;
  rows: AttendanceSessionListRow[];
};

export function aggregateEventSearchRows(rows: AttendanceSessionListRow[]): {
  totalMemberPresent: number;
  totalInvitees: number;
  totalOffering: number;
  sessionCount: number;
} {
  let totalMemberPresent = 0;
  let totalInvitees = 0;
  let totalOffering = 0;
  for (const row of rows) {
    totalMemberPresent += row.memberPresentCount;
    totalInvitees += row.inviteeCount;
    if (row.offeringAmount != null && !Number.isNaN(row.offeringAmount)) {
      totalOffering += row.offeringAmount;
    }
  }
  return { totalMemberPresent, totalInvitees, totalOffering, sessionCount: rows.length };
}
