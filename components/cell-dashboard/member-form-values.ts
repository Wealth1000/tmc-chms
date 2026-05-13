import type {
  FoundationSchoolId,
  MemberRecord,
  MemberRosterStatus,
} from "@/lib/members-store";

export type MemberFormValues = {
  fullName: string;
  email: string;
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
  dateOfBirth: "",
  area: "",
  isStudent: false,
  occupation: "",
  foundationStatus: "yet_to_start",
  memberStatus: "active",
};

export function memberRecordToFormValues(m: MemberRecord): MemberFormValues {
  return {
    fullName: m.fullName,
    email: m.email,
    dateOfBirth: m.dateOfBirth,
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
    dateOfBirth: v.dateOfBirth,
    area: v.area,
    isStudent: v.isStudent,
    occupation: v.occupation,
    foundationStatus: v.foundationStatus,
    memberStatus: v.memberStatus,
  };
}
