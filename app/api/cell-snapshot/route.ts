import { NextResponse } from "next/server";
import { buildCellLeaderSnapshot } from "@/lib/offline/build-cell-snapshot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  effectiveLeaderCellSlug,
  fetchAppProfile,
  profileHasAdminAccess,
} from "@/lib/supabase/profile";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cellSlug = url.searchParams.get("cell")?.trim() ?? "";
  if (!cellSlug) {
    return NextResponse.json({ error: "Missing cell" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await fetchAppProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 403 });
  }

  if (!profileHasAdminAccess(profile)) {
    const slug = effectiveLeaderCellSlug(profile);
    if (!slug || slug !== cellSlug) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const snapshot = await buildCellLeaderSnapshot(supabase, cellSlug);
  if (!snapshot) {
    return NextResponse.json({ error: "Cell not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
