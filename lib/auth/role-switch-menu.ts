import { cookies } from "next/headers";
import type { ActiveRole } from "@/lib/auth/active-role";
import { ACTIVE_ROLE_COOKIE, resolveActiveRole } from "@/lib/auth/active-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchAppProfile,
  profileHasAdminAccess,
  profileHasLeaderAccess,
} from "@/lib/supabase/profile";

export type RoleSwitchMenuProps = {
  label: string;
  target: ActiveRole;
};

export async function getRoleSwitchMenuProps(
  currentView: ActiveRole,
): Promise<RoleSwitchMenuProps | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await fetchAppProfile(supabase, user.id);
  if (!profile) return null;
  if (!profileHasAdminAccess(profile) || !profileHasLeaderAccess(profile)) return null;

  const cookieStore = await cookies();
  const active = resolveActiveRole(profile, cookieStore.get(ACTIVE_ROLE_COOKIE)?.value);
  if (active !== currentView) return null;

  if (currentView === "admin") {
    return { label: "My cell dashboard", target: "leader" };
  }
  return { label: "Admin console", target: "admin" };
}
