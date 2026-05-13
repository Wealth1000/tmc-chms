import type { SupabaseClient } from "@supabase/supabase-js";
import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import { effectiveLeaderCellSlug, fetchAppProfile } from "@/lib/supabase/profile";

export async function applyUpdateMyCellName(
  supabase: SupabaseClient,
  name: string,
): Promise<{ error?: string; ok: true } | { error: string; ok: false }> {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { error: "Use at least 2 characters for the cell name.", ok: false };
  }
  if (trimmed.length > 120) {
    return { error: "Keep the cell name at 120 characters or fewer.", ok: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in.", ok: false };
  }

  const profile = await fetchAppProfile(supabase, user.id);
  const slug = effectiveLeaderCellSlug(profile);
  if (!slug) {
    return { error: "Only cell leaders can rename a cell.", ok: false };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("cells")
    .update({ name: trimmed, updated_at: now })
    .eq("slug", slug)
    .eq("leader_user_id", user.id);

  if (error) {
    return { error: error.message, ok: false };
  }
  return { ok: true };
}

export async function applySaveCellLeaderDetails(
  supabase: SupabaseClient,
  cellSlug: string,
  values: CellLeaderEditableInfo,
): Promise<{ error?: string; ok: true } | { error: string; ok: false }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in.", ok: false };
  }

  const profile = await fetchAppProfile(supabase, user.id);
  const allowedSlug = effectiveLeaderCellSlug(profile);
  if (!allowedSlug || allowedSlug !== cellSlug) {
    return { error: "You can only edit your own cell.", ok: false };
  }

  const now = new Date().toISOString();
  const { error: cellErr } = await supabase
    .from("cells")
    .update({
      name: values.cellName.trim(),
      meeting_location: values.meetingLocation.trim(),
      meeting_day: values.meetingDay.trim(),
      meeting_time: values.meetingTime.trim(),
      description: values.description.trim(),
      updated_at: now,
    })
    .eq("slug", cellSlug)
    .eq("leader_user_id", user.id);

  if (cellErr) {
    return { error: cellErr.message, ok: false };
  }

  const { error: profErr } = await supabase
    .from("profiles")
    .update({ full_name: values.leaderName.trim(), updated_at: now })
    .eq("id", user.id);

  if (profErr) {
    return { error: profErr.message, ok: false };
  }
  return { ok: true };
}
