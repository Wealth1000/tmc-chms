import type {
  FoundationSchoolId,
  MemberRecord,
  MemberRosterStatus,
} from "@/lib/members-store";

export type MemberFormValues = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  area: string;
  isStudent: boolean;
  occupation: string;
  foundationStatus: FoundationSchoolId;
  memberStatus: MemberRosterStatus;
};

export const EMPTY_MEMBER_FORM: MemberFormValues = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  area: "",
  isStudent: false,
  occupation: "",
  foundationStatus: "yet_to_start",
  memberStatus: "active",
};

/**
 * Stored `date_of_birth` is free text; `<input type="date">` only accepts `yyyy-MM-dd`.
 * Returns a valid date string for the control, or "" so the user can pick from the native calendar.
 */
export function dateOfBirthToDateInputValue(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const mdy = s.match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/);
  if (mdy) {
    const mm = mdy[1].padStart(2, "0");
    const dd = mdy[2].padStart(2, "0");
    const yyyy = mdy[3];
    const iso = `${yyyy}-${mm}-${dd}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
  }
  return "";
}

export function memberRecordToFormValues(m: MemberRecord): MemberFormValues {
  return {
    fullName: m.fullName,
    email: m.email,
    phone: m.phone,
    dateOfBirth: dateOfBirthToDateInputValue(m.dateOfBirth),
    area: m.area,
    isStudent: m.isStudent,
    occupation: m.occupation,
    foundationStatus: m.foundationStatus,
    memberStatus: m.memberStatus,
  };
}

export function formValuesToMemberPatch(
  v: MemberFormValues,
): Partial<Omit<MemberRecord, "id">> {
  return {
    fullName: v.fullName,
    email: v.email,
    phone: v.phone,
    dateOfBirth: v.dateOfBirth,
    area: v.area,
    isStudent: v.isStudent,
    occupation: v.occupation,
    foundationStatus: v.foundationStatus,
    memberStatus: v.memberStatus,
  };
}
