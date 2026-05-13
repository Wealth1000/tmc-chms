/**
 * Cell leader "Update Cell Info" form shape. Values are loaded from Supabase (`cells` + profile)
 * and saved via `app/cell/actions.ts`.
 */

export type CellLeaderEditableInfo = {
  cellName: string;
  leaderName: string;
  description: string;
  meetingLocation: string;
  meetingDay: string;
  meetingTime: string;
  lastUpdatedLabel: string;
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function MEETING_DAY_OPTIONS(): readonly string[] {
  return WEEKDAYS;
}
