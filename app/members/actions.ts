"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchMemberById } from "@/lib/supabase/members-queries";
import {
  effectiveLeaderCellSlug,
  fetchAppProfile,
  profileHasAdminAccess,
} from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidateCellSlugPaths } from "@/lib/revalidate-cell-paths";

export type MemberMutationResult = { ok: true } | { ok: false; error: string };

type NewMemberPayload = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  area: string;
  isStudent: boolean;
  occupation: string;
  foundationStatus: string;
  memberStatus: string;
};

async function assertCanManageCell(
  supabase: SupabaseClient,
  cellSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You are not signed in." };
  }
  const profile = await fetchAppProfile(supabase, user.id);
  if (profileHasAdminAccess(profile)) {
    return { ok: true };
  }
  const slug = effectiveLeaderCellSlug(profile);
  if (!slug || slug !== cellSlug) {
    return { ok: false, error: "You can only manage your own cell." };
  }
  return { ok: true };
}

function revalidateMemberPaths(cellSlug: string) {
  revalidateCellSlugPaths(cellSlug);
}

export async function createMemberAction(
  cellSlug: string,
  payload: NewMemberPayload,
): Promise<MemberMutationResult> {
  const supabase = await createSupabaseServerClient();
  const gate = await assertCanManageCell(supabase, cellSlug);
  if (!gate.ok) return gate;

  const now = new Date().toISOString();
  const { error } = await supabase.from("members").insert({
    cell_slug: cellSlug,
    full_name: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    date_of_birth: payload.dateOfBirth.trim(),
    area: payload.area.trim(),
    is_student: payload.isStudent,
    occupation: payload.occupation.trim(),
    foundation_status: payload.foundationStatus,
    member_status: payload.memberStatus,
    updated_at: now,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A member with this email is already in this cell." };
    }
    return { ok: false, error: error.message };
  }

  revalidateMemberPaths(cellSlug);
  return { ok: true };
}

export async function updateMemberAction(
  memberId: string,
  payload: NewMemberPayload,
): Promise<MemberMutationResult> {
  const supabase = await createSupabaseServerClient();
  const existing = await fetchMemberById(supabase, memberId);
  if (!existing) {
    return { ok: false, error: "Member not found." };
  }

  const gate = await assertCanManageCell(supabase, existing.cellId);
  if (!gate.ok) return gate;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("members")
    .update({
      full_name: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      date_of_birth: payload.dateOfBirth.trim(),
      area: payload.area.trim(),
      is_student: payload.isStudent,
      occupation: payload.occupation.trim(),
      foundation_status: payload.foundationStatus,
      member_status: payload.memberStatus,
      updated_at: now,
    })
    .eq("id", memberId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A member with this email is already in this cell." };
    }
    return { ok: false, error: error.message };
  }

  revalidateMemberPaths(existing.cellId);
  return { ok: true };
}

export async function deleteMemberAction(memberId: string): Promise<MemberMutationResult> {
  const supabase = await createSupabaseServerClient();
  const existing = await fetchMemberById(supabase, memberId);
  if (!existing) {
    return { ok: false, error: "Member not found." };
  }

  const gate = await assertCanManageCell(supabase, existing.cellId);
  if (!gate.ok) return gate;

  const { error } = await supabase.from("members").delete().eq("id", memberId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateMemberPaths(existing.cellId);
  return { ok: true };
}

export type InviteePayload = { name: string; phone: string };

export async function saveAttendanceAction(
  cellSlug: string,
  meetingDate: string,
  presentMemberIds: string[],
  invitees: InviteePayload[],
): Promise<MemberMutationResult> {
  const supabase = await createSupabaseServerClient();
  const gate = await assertCanManageCell(supabase, cellSlug);
  if (!gate.ok) return gate;

  if (!meetingDate || meetingDate.length < 8) {
    return { ok: false, error: "Please choose a meeting date." };
  }

  const inviteeJson = invitees.map((i) => ({
    name: i.name.trim(),
    phone: i.phone.trim(),
  }));

  const { error } = await supabase.rpc("save_attendance_bundle", {
    p_cell_slug: cellSlug,
    p_meeting_date: meetingDate,
    p_member_ids: presentMemberIds,
    p_invitees: inviteeJson,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateMemberPaths(cellSlug);
  return { ok: true };
}
