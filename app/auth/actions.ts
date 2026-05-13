"use server";

import { redirect } from "next/navigation";
import { readSupabaseServerOrEdgeEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureLeaderCellForCurrentUser } from "@/lib/supabase/ensure-leader-cell";
import { effectiveLeaderCellSlug, fetchAppProfile } from "@/lib/supabase/profile";

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
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return "Invalid email or password.";
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return "Could not load your session.";
  }

  let profile = await fetchAppProfile(supabase, user.id);
  if (!profile) {
    return "No profile row for this user. Create one in Supabase (see supabase/migrations).";
  }

  if (profile.role === "leader" && !effectiveLeaderCellSlug(profile)) {
    await ensureLeaderCellForCurrentUser(supabase);
    profile = await fetchAppProfile(supabase, user.id);
  }

  if (!profile) {
    return "No profile row for this user. Create one in Supabase (see supabase/migrations).";
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
