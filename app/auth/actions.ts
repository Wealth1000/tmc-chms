"use server";

import { redirect } from "next/navigation";
import { readSupabaseServerOrEdgeEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureLeaderCellForCurrentUser } from "@/lib/supabase/ensure-leader-cell";
import { effectiveLeaderCellSlug, fetchAppProfileOrFail } from "@/lib/supabase/profile";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  if (!readSupabaseServerOrEdgeEnv()) {
    return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and a public API key: NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).";
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return "Enter your email and password.";
  }

  const supabase = await createSupabaseServerClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return "Invalid email or password.";
  }

  const session = signInData.session;
  const user = signInData.user ?? session?.user;
  if (!user) {
    return "Could not load your session.";
  }
  if (!session) {
    return "No active session (e.g. email not confirmed). Confirm your email in Supabase Auth, then try again.";
  }

  const { error: setSessionErr } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (setSessionErr) {
    console.error("setSession after login:", setSessionErr.message);
  }

  const { error: ensureProfileErr } = await supabase.rpc("ensure_auth_user_profile");
  if (ensureProfileErr) {
    console.error("ensure_auth_user_profile:", ensureProfileErr.message);
  }

  let profileResult = await fetchAppProfileOrFail(supabase, user.id);
  if (!profileResult.ok) {
    const f = profileResult.failure;
    if (f.kind === "invalid_role") {
      return `Your profile row exists, but role must be exactly "admin" or "leader" (got "${f.role || "empty"}"). Update public.profiles.role for user id ${user.id}.`;
    }
    if (f.kind === "query_error") {
      return `Could not read your profile (${f.message}). If this mentions RLS or JWT, the session may not be attached yet—try again, or confirm NEXT_PUBLIC_SUPABASE_* keys match your project.`;
    }
    return (
      `No profile row where id matches your auth user (${user.id}). ` +
      "In Table Editor, profiles.id must equal that UUID from Authentication → Users. " +
      "Apply migration `0008_ensure_auth_user_profile_rpc.sql` to auto-create the row on login, or insert the row manually."
    );
  }
  let profile = profileResult.profile;

  if (profile.role === "leader" && !effectiveLeaderCellSlug(profile)) {
    await ensureLeaderCellForCurrentUser(supabase);
    const again = await fetchAppProfileOrFail(supabase, user.id);
    profile = again.ok ? again.profile : profile;
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  const slug = effectiveLeaderCellSlug(profile);
  if (!slug) {
    return (
      "Could not attach a cell to this leader account. Run migration `0003_ensure_leader_cell_rpc.sql` in Supabase (SQL editor), then try again."
    );
  }
  redirect(`/cell?cell=${encodeURIComponent(slug)}`);
}

export type PasswordUpdateState = { error?: string; success?: boolean };

export async function updatePassword(
  _prev: PasswordUpdateState,
  formData: FormData,
): Promise<PasswordUpdateState> {
  const password = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (password.length < 8) {
    return { error: "Use at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You are not signed in." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
