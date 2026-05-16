"use client";

import Link from "next/link";
import type { ActivityIcon, CellLeaderDashboardProps } from "./types";
import { HelpFab } from "./HelpFab";
import { cellMembersHref } from "@/lib/cell-leader-links";
import { HeaderProfileMenu } from "./HeaderProfileMenu";
import type { RoleSwitchMenuProps } from "@/lib/auth/role-switch-menu";
import {
  IconClipboard,
  IconFileText,
  IconLineChart,
  IconTrendUp,
  IconUser,
  IconUserPlus,
  IconUserX,
  IconUsers,
} from "./icons";

function ActivityIcon({ kind }: { kind: ActivityIcon }) {
  const cls = "shrink-0 text-[#6B7280]";
  switch (kind) {
    case "member-add":
      return <IconUserPlus className={cls} />;
    case "attendance":
      return <IconClipboard className={cls} />;
    case "document":
      return <IconFileText className={cls} />;
    default:
      return <IconUser className={cls} />;
  }
}

const actionBtnClass =
  "flex min-h-[120px] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:bg-neutral-50 touch-manipulation sm:px-3 lg:min-h-[128px]";

export function CellLeaderDashboard({
  cellName,
  leaderName,
  stats,
  lastUpdatedLabel,
  activities,
  cellSlug,
  roleSwitch,
  onOpenProfile,
  addMemberHref,
  updateCellInfoHref,
  viewReportsHref,
  recordAttendanceHref,
  onAddMember,
  onRecordAttendance,
  onUpdateCellInfo,
  onViewReports,
  onHelp,
}: CellLeaderDashboardProps) {
  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden overscroll-none bg-[#0B0E14]">
      <HelpFab onClick={onHelp} />

      <header className="relative z-30 flex shrink-0 items-start justify-between gap-3 overflow-visible px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-6 lg:pt-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-white lg:text-xl">
            {cellName}
          </h1>
          <p className="mt-1 text-sm text-white/55">Led by {leaderName}</p>
        </div>
        <HeaderProfileMenu onProfile={onOpenProfile} roleSwitch={roleSwitch} />
      </header>

      <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-5 lg:px-8 lg:pb-10 lg:pt-6">
          <div className="space-y-6 lg:space-y-8">
            {/* Stats */}
            <section aria-label="Summary statistics">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <Link
                  href={cellMembersHref(cellSlug, "all")}
                  prefetch
                  className="relative block touch-manipulation rounded-lg border border-neutral-200 bg-white p-4 no-underline transition hover:opacity-95 active:opacity-90 lg:p-5"
                  aria-label="View all members"
                >
                  <IconUsers className="absolute right-3 top-3 text-black lg:right-4 lg:top-4" />
                  <p className="text-xs font-medium text-[#6B7280] lg:text-sm">
                    Total Members
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-black lg:text-3xl">
                    {stats.totalMembers}
                  </p>
                </Link>
                <Link
                  href={cellMembersHref(cellSlug, "active")}
                  prefetch
                  className="relative block touch-manipulation rounded-lg border border-emerald-200/90 bg-emerald-50/80 p-4 no-underline transition hover:opacity-95 active:opacity-90 lg:p-5"
                  aria-label="View active members"
                >
                  <IconTrendUp className="absolute right-3 top-3 text-emerald-600 lg:right-4 lg:top-4" />
                  <p className="text-xs font-medium text-emerald-800/70 lg:text-sm">Active</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-black lg:text-3xl">
                    {stats.active}
                  </p>
                </Link>
                <Link
                  href={cellMembersHref(cellSlug, "inactive")}
                  prefetch
                  className="relative block touch-manipulation rounded-lg border border-amber-200/90 bg-amber-50/70 p-4 no-underline transition hover:opacity-95 active:opacity-90 lg:p-5"
                  aria-label="View inactive members"
                >
                  <IconUser className="absolute right-3 top-3 text-amber-700 lg:right-4 lg:top-4" />
                  <p className="text-xs font-medium text-amber-900/65 lg:text-sm">Inactive</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-black lg:text-3xl">
                    {stats.inactive}
                  </p>
                </Link>
                <Link
                  href={cellMembersHref(cellSlug, "dormant")}
                  prefetch
                  className="relative block touch-manipulation rounded-lg border border-rose-200/90 bg-rose-50/70 p-4 no-underline transition hover:opacity-95 active:opacity-90 lg:p-5"
                  aria-label="View dormant members"
                >
                  <IconUserX className="absolute right-3 top-3 text-rose-600 lg:right-4 lg:top-4" />
                  <p className="text-xs font-medium text-rose-900/65 lg:text-sm">Dormant</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-black lg:text-3xl">
                    {stats.dormant}
                  </p>
                </Link>
              </div>
              <p className="mt-3 text-center text-xs text-[#6B7280] lg:mt-4 lg:text-sm">
                Last updated: {lastUpdatedLabel}
              </p>
            </section>

            {/* Quick actions */}
            <section>
              <h2 className="mb-3 text-base font-bold text-black lg:mb-4 lg:text-lg">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {addMemberHref ? (
                  <Link
                    href={addMemberHref}
                    prefetch
                    className={`${actionBtnClass} text-black no-underline`}
                  >
                    <IconUserPlus className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      Add Member
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={actionBtnClass}
                    onClick={() => onAddMember?.()}
                  >
                    <IconUserPlus className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      Add Member
                    </span>
                  </button>
                )}
                {recordAttendanceHref ? (
                  <Link
                    href={recordAttendanceHref}
                    prefetch
                    className={`${actionBtnClass} text-black no-underline`}
                  >
                    <IconClipboard className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      Record Attendance
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={actionBtnClass}
                    onClick={() => onRecordAttendance?.()}
                  >
                    <IconClipboard className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      Record Attendance
                    </span>
                  </button>
                )}
                {updateCellInfoHref ? (
                  <Link
                    href={updateCellInfoHref}
                    prefetch
                    className={`${actionBtnClass} text-black no-underline`}
                  >
                    <IconFileText className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      Update Cell Info
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={actionBtnClass}
                    onClick={() => onUpdateCellInfo?.()}
                  >
                    <IconFileText className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      Update Cell Info
                    </span>
                  </button>
                )}
                {viewReportsHref ? (
                  <Link
                    href={viewReportsHref}
                    prefetch
                    className={`${actionBtnClass} text-black no-underline`}
                  >
                    <IconLineChart className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      View Reports
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={actionBtnClass}
                    onClick={() => onViewReports?.()}
                  >
                    <IconLineChart className="text-black" />
                    <span className="text-center text-xs font-medium leading-snug text-black">
                      View Reports
                    </span>
                  </button>
                )}
              </div>
            </section>

            {/* Recent activity */}
            <section>
              <h2 className="mb-3 text-base font-bold text-black lg:mb-4 lg:text-lg">
                Recent Activity
              </h2>
              <div className="overflow-hidden rounded-none border border-neutral-200 bg-white">
                {activities.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-[#6B7280] lg:px-5">
                    No recent activity yet. Adding members or saving attendance will appear here.
                  </p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {activities.map((item) => (
                      <li key={item.id} className="flex gap-3 px-4 py-3.5 lg:px-5 lg:py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 lg:h-10 lg:w-10">
                          <ActivityIcon kind={item.icon} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug text-black lg:text-[15px]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6B7280] lg:text-sm">{item.subtext}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
