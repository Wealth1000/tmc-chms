import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileCellNameForm } from "@/components/account/ProfileCellNameForm";
import { ProfilePasswordForm } from "@/components/account/ProfilePasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCellDbRow } from "@/lib/supabase/cells-queries";
import { ensureLeaderCellForCurrentUser } from "@/lib/supabase/ensure-leader-cell";
import { effectiveLeaderCellSlug, fetchAppProfile } from "@/lib/supabase/profile";

type PageProps = {
  searchParams: Promise<{ cell_slug?: string | string[] }>;
};

export default async function AccountProfilePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cellSlugNotice = sp.cell_slug === "required";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  await ensureLeaderCellForCurrentUser(supabase);

  let profile = await fetchAppProfile(supabase, user.id);
  const leaderSlug = effectiveLeaderCellSlug(profile);

  if (cellSlugNotice && leaderSlug) {
    redirect("/account/profile");
  }

  let cellDisplayName: string | null = null;
  if (leaderSlug) {
    const cellRow = await fetchCellDbRow(supabase, leaderSlug);
    cellDisplayName = cellRow?.name ?? "New cell group";
  }

  const dashboardHref =
    profile?.role === "admin"
      ? "/admin"
      : leaderSlug
        ? `/cell?cell=${encodeURIComponent(leaderSlug)}`
        : null;

  return (
    <div>
      {cellSlugNotice && profile?.role === "leader" && !leaderSlug ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Cell not assigned</p>
          <p className="mt-1 text-amber-900/90">
            The app just tried to create a cell automatically. If this message remains, run migration{" "}
            <code className="rounded bg-amber-100/80 px-1">0003_ensure_leader_cell_rpc.sql</code> in the Supabase SQL
            editor (adds the <code className="rounded bg-amber-100/80 px-1">ensure_leader_cell_for_current_user</code>{" "}
            function), then refresh this page.
          </p>
        </div>
      ) : null}

      <p className="text-sm">
        {dashboardHref ? (
          <Link href={dashboardHref} className="font-medium text-sky-700 no-underline hover:underline">
            ← Back to dashboard
          </Link>
        ) : (
          <span className="text-sm text-neutral-500">
            Set <code className="rounded bg-neutral-100 px-1 text-neutral-800">role</code> and cell assignment in
            Supabase for this account, then return here.
          </span>
        )}
      </p>
      <h1 className="mt-4 text-2xl font-bold text-black">Profile</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Signed in as <span className="font-medium text-neutral-900">{user.email ?? user.id}</span>
      </p>

      {profile?.role === "leader" && leaderSlug ? (
        <section className="mt-10 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-black">Cell</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Your cell URL uses slug <span className="font-mono text-neutral-900">{leaderSlug}</span>. Rename how it
            appears on dashboards below (password is in the next section).
          </p>
          <div className="mt-6">
            <ProfileCellNameForm initialName={cellDisplayName ?? "New cell group"} />
          </div>
        </section>
      ) : null}

      <section
        className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm ${profile?.role === "leader" && leaderSlug ? "mt-8" : "mt-10"}`}
      >
        <h2 className="text-lg font-semibold text-black">Change password</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Choose a new password for your Supabase Auth account (minimum 8 characters).
        </p>
        <ProfilePasswordForm />
      </section>
    </div>
  );
}
