"use client";

import { RecordAttendanceView } from "./RecordAttendanceView";
import type { AttendanceMemberRow } from "./RecordAttendanceView";
import { hydrateMembersFromStorage, listMembers } from "@/lib/members-store";

type Props = {
  cellSlug: string;
  homeHref: string;
};

export function RecordAttendanceClient({ cellSlug, homeHref }: Props) {
  hydrateMembersFromStorage();
  const members: AttendanceMemberRow[] = listMembers()
    .filter((m) => m.cellId === cellSlug)
    .map((m) => ({
      id: m.id,
      fullName: m.fullName,
      memberStatus: m.memberStatus,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return <RecordAttendanceView homeHref={homeHref} cellSlug={cellSlug} members={members} />;
}
