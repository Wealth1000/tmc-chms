"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HelpFab } from "./HelpFab";
import {
  IconActivity,
  IconBarChart,
  IconCalendar,
  IconChevronLeft,
  IconLineChart,
  IconUser,
  IconUserPlus,
  IconUsers,
} from "./icons";
import type { CellStats } from "./types";
import {
  applyPeriodToOverview,
  buildCellReportsOverview,
  type CellReportPeriod,
} from "@/lib/cell-reports-data";

function DonutPct({ pct }: { pct: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      className="shrink-0 text-black"
      aria-hidden
    >
      <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="#059669"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="29"
        textAnchor="middle"
        fill="currentColor"
        className="text-[11px] font-bold tabular-nums"
      >
        {pct}%
      </text>
    </svg>
  );
}

const periodTabs: { id: CellReportPeriod; label: string }[] = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "quarter", label: "Quarter" },
];

type CellReportsViewProps = {
  cellSlug: string;
  stats: CellStats;
  homeHref: string;
  onHelp?: () => void;
};

export function CellReportsView({ cellSlug, stats, homeHref, onHelp }: CellReportsViewProps) {
  const [period, setPeriod] = useState<CellReportPeriod>("month");

  const base = useMemo(() => buildCellReportsOverview(stats, cellSlug), [stats, cellSlug]);
  const data = useMemo(() => applyPeriodToOverview(base, period), [base, period]);

  const total = Math.max(stats.totalMembers, 1);
  const activePct = Math.round((stats.active / total) * 100);
  const inactivePct = Math.round((stats.inactive / total) * 100);
  const dormantPct = Math.round((stats.dormant / total) * 100);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none bg-white font-sans text-black">
      <HelpFab onClick={onHelp} />

      <header className="relative z-20 shrink-0 bg-[#0B0E14] px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-6 lg:pt-5">
        <div className="flex w-full max-w-full items-start gap-3">
          <Link
            href={homeHref}
            className="mt-0.5 inline-flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-lg font-bold text-white lg:text-xl">Cell Reports</h1>
            <p className="mt-0.5 text-sm text-white/55">View statistics and insights</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-none px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-5 lg:px-8 lg:pb-10 lg:pt-6">
        <div className="mx-auto w-full min-w-0 max-w-[720px] space-y-6 lg:max-w-[840px] lg:space-y-8">
          <div className="relative z-10 isolate flex rounded-lg border border-neutral-200 bg-neutral-50/80 p-1">
            {periodTabs.map((tab) => {
              const on = period === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPeriod(tab.id)}
                  className={`min-h-11 min-w-0 flex-1 touch-manipulation rounded-md px-2 py-2.5 text-center text-xs font-semibold transition sm:text-sm ${
                    on ? "bg-[#0B0E14] text-white shadow-sm" : "text-neutral-700 hover:bg-white/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <section aria-labelledby="overview-heading">
            <h2
              id="overview-heading"
              className="mb-3 flex items-center gap-2 text-base font-bold text-black lg:mb-4 lg:text-lg"
            >
              <IconBarChart className="h-5 w-5 shrink-0 text-neutral-700" />
              Overview
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="relative rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
                <IconLineChart className="absolute right-3 top-3 h-5 w-5 text-emerald-600 lg:right-4 lg:top-4" />
                <p className="text-xs font-medium text-neutral-500 lg:text-sm">Avg Attendance</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-black lg:text-3xl">
                  {data.avgAttendance}
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-600">↑ 8% from last period</p>
              </div>
              <div className="relative rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
                <IconActivity className="absolute right-3 top-3 h-5 w-5 text-neutral-500 lg:right-4 lg:top-4" />
                <p className="text-xs font-medium text-neutral-500 lg:text-sm">Attendance Rate</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-black lg:text-3xl">
                  {data.attendanceRatePct}%
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Based on {stats.totalMembers} members
                </p>
              </div>
              <div className="relative rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
                <IconUserPlus className="absolute right-3 top-3 h-5 w-5 text-emerald-700 lg:right-4 lg:top-4" />
                <p className="text-xs font-medium text-emerald-900/70 lg:text-sm">New Members</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-black lg:text-3xl">
                  {data.newMembers}
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-600">↑ 8% from last period</p>
              </div>
              <div className="relative rounded-lg border border-amber-200/80 bg-amber-50/50 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
                <IconUser className="absolute right-3 top-3 h-5 w-5 text-amber-800 lg:right-4 lg:top-4" />
                <p className="text-xs font-medium text-amber-900/70 lg:text-sm">Inactive</p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-black lg:text-3xl">
                  {data.inactive}
                </p>
                <p className="mt-2 text-xs text-neutral-600">
                  Based on {stats.totalMembers} members
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="recent-att-heading">
            <h2
              id="recent-att-heading"
              className="mb-3 flex items-center gap-2 text-base font-bold text-black lg:mb-4 lg:text-lg"
            >
              <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700" />
              Recent Attendance
            </h2>
            <ul className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {data.rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 border-b border-neutral-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-black">{row.dateLabel}</p>
                    <p className="mt-0.5 text-sm text-neutral-500">
                      {row.totalMembers} total members
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                    <div className="text-sm">
                      <span className="font-semibold text-emerald-600">{row.present} present</span>
                      <span className="mx-2 text-neutral-300">·</span>
                      <span className="text-neutral-500">{row.absent} absent</span>
                    </div>
                    <DonutPct pct={row.ratePct} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="status-dist-heading" className="pb-4">
            <h2
              id="status-dist-heading"
              className="mb-3 flex items-center gap-2 text-base font-bold text-black lg:mb-4 lg:text-lg"
            >
              <IconUsers className="h-5 w-5 shrink-0 text-neutral-700" />
              Member Status Distribution
            </h2>
            <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-neutral-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {stats.active} ({activePct}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width]"
                    style={{ width: `${activePct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-neutral-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Inactive
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {stats.inactive} ({inactivePct}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-[width]"
                    style={{ width: `${inactivePct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-neutral-800">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Dormant
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    {stats.dormant} ({dormantPct}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-red-500 transition-[width]"
                    style={{ width: `${dormantPct}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
