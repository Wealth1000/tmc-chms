"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACTIVE_ROLE_COOKIE,
  activeRoleCookieOptions,
  type ActiveRole,
  postLoginPath,
  resolveActiveRole,
} from "@/lib/auth/active-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchAppProfile,
  profileHasAdminAccess,
  profileHasLeaderAccess,
} from "@/lib/supabase/profile";

export async function switchActiveRole(target: ActiveRole): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const profile = await fetchAppProfile(supabase, user.id);
  if (!profile) {
    redirect("/");
  }

  if (target === "admin" && !profileHasAdminAccess(profile)) {
    redirect("/");
  }
  if (target === "leader" && !profileHasLeaderAccess(profile)) {
    redirect("/account/profile?cell_slug=required");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ROLE_COOKIE, target, activeRoleCookieOptions());

  const active = resolveActiveRole(profile, target);
  redirect(postLoginPath(profile, active));
}
