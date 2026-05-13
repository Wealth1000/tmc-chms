/**
 * Legacy static cell definitions (demo). Roster is Supabase-driven; this list stays empty.
 */

export type AdminCellGroupDef = {
  id: string;
  name: string;
  leader: string;
  leaderEmail: string;
  leaderPhone: string;
  meetingSchedule: string;
  meetingLocation: string;
  updatedLabel: string;
};

export const ADMIN_CELL_GROUP_DEFS: AdminCellGroupDef[] = [];
