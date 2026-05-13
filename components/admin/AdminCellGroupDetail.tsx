"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconCalendar,
  IconClock,
  IconFileText,
  IconGraduationCap,
  IconLineChart,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUsers,
} from "@/components/cell-dashboard/icons";
import {
  buildCellActivityTimeline,
  demoJoinedLabel,
  demoPhoneForMember,
  foundationCompletionRatePct,
  foundationSchoolBadge,
  getCellAttendanceDemo,
  getFoundationBreakdown,
} from "@/lib/admin-cell-detail";
import { adminMemberEditHref } from "@/lib/admin-members-links";
import type { CellGroupRow } from "@/lib/admin-cells-store";
import type { MemberListFilter, MemberRecord, MemberRosterStatus } from "@/lib/members-store";

const cardClass =
  "rounded-lg border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]";

function rosterDotClass(status: MemberRosterStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "inactive":
      return "bg-amber-500";
    default:
      return "bg-red-500";
  }
}

function rosterBadgeClass(status: MemberRosterStatus) {
  switch (status) {
    case "active":
      return "border-neutral-900 bg-neutral-900 text-white";
    case "inactive":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}

const filterDefs: { id: MemberListFilter; label: string }[] = [
  { id: "all", label: "All Members" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "dormant", label: "Dormant" },
];

type AdminCellGroupDetailProps = {
  cell: CellGroupRow;
  members: MemberRecord[];
};

export function AdminCellGroupDetail({ cell, members }: AdminCellGroupDetailProps) {
  const [filter, setFilter] = useState<MemberListFilter>("all");

  const filteredMembers = useMemo(() => {
    let list = [...members].sort((a, b) => a.fullName.localeCompare(b.fullName));
    if (filter !== "all") {
      list = list.filter((m) => m.memberStatus === filter);
    }
    return list;
  }, [members, filter]);

  const foundation = useMemo(() => getFoundationBreakdown(members), [members]);
  const completionPct = useMemo(() => foundationCompletionRatePct(members), [members]);
  const attendance = useMemo(() => getCellAttendanceDemo(cell), [cell]);
  const timeline = useMemo(() => buildCellActivityTimeline(cell), [cell]);

  const chartMax = useMemo(() => {
    const peak = Math.max(5, ...attendance.weeklyPresent, attendance.averagePresent);
    return Math.max(20, Math.ceil(peak / 5) * 5);
  }, [attendance]);

  const yTicks = useMemo(() => {
    const step = chartMax <= 20 ? 5 : 10;
    const ticks: number[] = [];
    for (let v = 0; v <= chartMax; v += step) ticks.push(v);
    return ticks;
  }, [chartMax]);

  return (
    <div className="w-full min-w-0 max-w-full px-3 py-5 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full min-w-0 max-w-[1400px]">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 underline-offset-2 hover:text-black hover:underline touch-manipulation"
        >
          ← Back to Dashboard
        </Link>

        <section className={`${cardClass} mt-4 p-4 sm:p-6 lg:p-8`}>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Cell group</p>
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-xl font-bold tracking-tight text-black sm:text-2xl lg:text-3xl">
              {cell.name}
            </h1>
            <p className="text-sm text-neutral-500">Last updated {cell.updatedLabel}</p>
          </div>

          <div className="mt-6 grid gap-6 border-t border-neutral-100 pt-6 lg:grid-cols-2 lg:gap-10">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Cell Leader
              </h2>
              <p className="mt-2 text-base font-semibold text-neutral-900">{cell.leader}</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                <li className="flex min-w-0 items-start gap-2">
                  <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <a
                    href={`mailto:${cell.leaderEmail}`}
                    className="min-w-0 break-all font-medium text-neutral-800 underline-offset-2 hover:underline"
                  >
                    {cell.leaderEmail}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="font-medium text-neutral-800">{cell.leaderPhone}</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Meeting Information
              </h2>
              <ul className="mt-3 space-y-3 text-sm text-neutral-700">
                <li className="flex gap-2">
                  <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="font-medium text-neutral-900">{cell.meetingSchedule}</span>
                </li>
                <li className="flex gap-2">
                  <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="font-medium text-neutral-900">{cell.meetingLocation}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-6 sm:grid-cols-4 sm:gap-4">
            <div className="flex items-start gap-2 rounded-lg bg-neutral-50/80 p-3">
              <IconUsers className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Total</p>
                <p className="text-lg font-bold tabular-nums text-black">{cell.total}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-neutral-50/80 p-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Active</p>
                <p className="text-lg font-bold tabular-nums text-black">{cell.active}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-neutral-50/80 p-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Inactive</p>
                <p className="text-lg font-bold tabular-nums text-black">{cell.inactive}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-neutral-50/80 p-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Dormant</p>
                <p className="text-lg font-bold tabular-nums text-black">{cell.dormant}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-2 lg:gap-6">
            <section className={cardClass}>
              <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <h2 className="text-lg font-bold text-black">Members</h2>
                <p className="text-sm tabular-nums text-neutral-600">
                  {filteredMembers.length} of {members.length}
                </p>
              </div>
              <div className="border-b border-neutral-100 px-4 py-3 sm:px-5">
                <label htmlFor="member-filter" className="sr-only">
                  Filter members by status
                </label>
                <select
                  id="member-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as MemberListFilter)}
                  className="w-full min-h-11 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/15"
                >
                  {filterDefs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <ul className="divide-y divide-neutral-100">
                {filteredMembers.map((m) => {
                  const fs = foundationSchoolBadge(m.foundationStatus);
                  return (
                    <li key={m.id} className="px-4 py-4 sm:px-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${rosterDotClass(m.memberStatus)}`}
                              aria-hidden
                            />
                            <Link
                              href={adminMemberEditHref(m.id, "all")}
                              className="text-base font-semibold text-black underline-offset-2 hover:underline"
                            >
                              {m.fullName}
                            </Link>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${rosterBadgeClass(m.memberStatus)}`}
                            >
                              {m.memberStatus === "active"
                                ? "Active"
                                : m.memberStatus === "inactive"
                                  ? "Inactive"
                                  : "Dormant"}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${fs.className}`}
                            >
                              {fs.label}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-col gap-1.5 text-sm text-neutral-600 sm:flex-row sm:flex-wrap sm:gap-x-4">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <IconMail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                              <span className="min-w-0 break-all">{m.email}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <IconPhone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                              {demoPhoneForMember(m.id)}
                            </span>
                          </div>
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                            <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                            {demoJoinedLabel(m.id)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {filteredMembers.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-neutral-500 sm:px-5">
                  No members in this filter.
                </p>
              )}
            </section>

            <section className={`${cardClass} p-4 sm:p-5`}>
              <div className="flex items-start gap-2">
                <IconLineChart className="mt-0.5 h-5 w-5 shrink-0 text-neutral-600" aria-hidden />
                <div>
                  <h2 className="text-lg font-bold text-black">Attendance Summary</h2>
                  <p className="mt-0.5 text-sm text-neutral-500">Recent gatherings (demo)</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-medium text-neutral-500">Average Attendance</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-black">
                    {attendance.averagePresent}
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-medium text-neutral-500">Attendance Rate</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-black">
                    {attendance.attendanceRatePct}%
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-medium text-neutral-500">Total Members</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-black">{cell.total}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <div className="flex h-36 w-8 shrink-0 flex-col justify-between py-1 text-right text-[10px] font-medium tabular-nums text-neutral-400 sm:h-40">
                  {[...yTicks].reverse().map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="min-w-0 flex-1 border-b border-l border-neutral-200 pl-2">
                  <div className="flex h-36 items-end justify-between gap-1.5 pb-1 pt-2 sm:h-40 sm:gap-2">
                    {attendance.weeklyPresent.map((v, i) => (
                      <div
                        key={i}
                        className="flex min-w-0 flex-1 flex-col items-center justify-end"
                        title={`Week ${i + 1}: ${v}`}
                      >
                        <div
                          className="w-full max-w-[28px] rounded-t bg-neutral-900 sm:max-w-[36px]"
                          style={{ height: `${Math.max(4, (v / chartMax) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
            <section className={`${cardClass} p-4 sm:p-5`}>
              <h2 className="text-lg font-bold text-black">Foundation School</h2>
              <p className="mt-0.5 text-sm text-neutral-500">Member training progress</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700">Completion rate</span>
                  <span className="font-bold tabular-nums text-black">{completionPct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-[width]"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-neutral-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <IconGraduationCap className="h-4 w-4" />
                    </span>
                    <span className="font-medium">Completed</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-black">
                    {foundation.completed}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-neutral-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700">
                      <IconFileText className="h-4 w-4" />
                    </span>
                    <span className="font-medium">In Progress</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-black">
                    {foundation.inProgress}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-neutral-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-500">
                      <IconClock className="h-4 w-4" />
                    </span>
                    <span className="font-medium">Not Started</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-black">
                    {foundation.notStarted}
                  </span>
                </li>
              </ul>
            </section>

            <section className={`${cardClass} p-4 sm:p-5`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Status overview
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                  <IconClock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Not Started</p>
                  <p className="text-2xl font-bold tabular-nums text-black">{foundation.notStarted}</p>
                </div>
              </div>
            </section>

            <section className={`${cardClass} p-4 sm:p-5`}>
              <h2 className="text-lg font-bold text-black">Recent Updates</h2>
              <p className="mt-0.5 text-sm text-neutral-500">Timeline of cell activities</p>
              <ul className="relative mt-5 space-y-0 pl-1">
                {timeline.map((item, idx) => (
                  <li key={item.id} className="relative pb-6 pl-6 last:pb-0">
                    {idx < timeline.length - 1 && (
                      <span
                        className="absolute left-[7px] top-2 h-[calc(100%-4px)] w-px bg-neutral-200"
                        aria-hidden
                      />
                    )}
                    <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-neutral-900 shadow-sm" />
                    <p className="text-sm font-semibold leading-snug text-neutral-900">{item.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <IconClock className="h-3 w-3 shrink-0" />
                        {item.timeLabel}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">{item.byLine}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin"
                className="mt-2 inline-block text-sm font-semibold text-neutral-900 underline-offset-2 hover:underline"
              >
                View complete activity log →
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
