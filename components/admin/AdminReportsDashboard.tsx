"use client";

import Link from "next/link";
import {
  IconBarChart,
  IconCalendar,
  IconDollar,
  IconLineChart,
  IconTrendUp,
  IconUserCheck,
  IconUsers,
} from "@/components/cell-dashboard/icons";
import { buildReportsSnapshot, type GivingTimelineRow } from "@/lib/admin-reports-data";
import type { CellGroupRow } from "@/lib/admin-cells-store";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function givingTagClass(cat: GivingTimelineRow["category"]) {
  switch (cat) {
    case "Tithe":
      return "border-sky-200 bg-sky-100 text-sky-800";
    case "Offering":
      return "border-emerald-200 bg-emerald-100 text-emerald-900";
    case "Missions":
      return "border-violet-200 bg-violet-100 text-violet-900";
    case "Special":
      return "border-pink-200 bg-pink-100 text-pink-900";
    default:
      return "border-orange-200 bg-orange-100 text-orange-900";
  }
}

function WeeklyAttendanceChart({
  data,
}: {
  data: { week: number; total: number; avgPerCell: number }[];
}) {
  const maxY =
    data.length === 0 ? 1 : Math.max(...data.flatMap((d) => [d.total, d.avgPerCell]), 1) * 1.08;
  const chartH = 176;
  return (
    <div className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-[min(100%,520px)] flex-col">
        <div className="flex h-52 items-end justify-between gap-1.5 border-b border-neutral-200 px-1 pb-0 pt-2 sm:h-56 sm:gap-2">
          {data.map((d) => (
            <div
              key={d.week}
              className="flex min-w-0 flex-1 items-end justify-center gap-0.5 sm:gap-1"
            >
              <div
                className="w-full max-w-[28px] rounded-t bg-sky-500 sm:max-w-[36px]"
                style={{ height: `${Math.max(6, (d.total / maxY) * chartH)}px` }}
                title={`Week ${d.week} total: ${d.total}`}
              />
              <div
                className="w-full max-w-[28px] rounded-t bg-violet-500 sm:max-w-[36px]"
                style={{ height: `${Math.max(6, (d.avgPerCell / maxY) * chartH)}px` }}
                title={`Week ${d.week} avg/cell: ${d.avgPerCell}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between gap-1 text-[10px] font-medium text-neutral-500 sm:text-xs">
          {data.map((d) => (
            <span key={d.week} className="min-w-0 flex-1 text-center">
              W{d.week}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" aria-hidden />
            Total Attendance
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" aria-hidden />
            Avg per Cell
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusDistribution({
  active,
  inactive,
  dormant,
}: {
  active: number;
  inactive: number;
  dormant: number;
}) {
  const sum = active + inactive + dormant || 1;
  const pA = (active / sum) * 100;
  const pI = (inactive / sum) * 100;
  const pD = (dormant / sum) * 100;
  const activePct = Math.round(pA * 10) / 10;
  const inactivePct = Math.round(pI * 10) / 10;
  const dormantPct = Math.round(pD * 10) / 10;

  return (
    <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
      <div className="relative mx-auto h-44 w-44 shrink-0 sm:h-48 sm:w-48">
        <div
          className="h-full w-full rounded-full shadow-inner"
          style={{
            background: `conic-gradient(#22c55e 0deg ${pA * 3.6}deg, #f97316 ${pA * 3.6}deg ${(pA + pI) * 3.6}deg, #f43f5e ${(pA + pI) * 3.6}deg 360deg)`,
          }}
        />
        <div className="absolute inset-[20%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm ring-1 ring-neutral-100">
          <span className="text-2xl font-bold tabular-nums text-emerald-700">{activePct}%</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Active
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3 text-sm">
        <div className="flex items-center justify-between gap-8 sm:min-w-[200px]">
          <span className="inline-flex items-center gap-2 font-medium text-emerald-800">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
            Active
          </span>
          <span className="tabular-nums text-neutral-900">
            {active} <span className="text-neutral-500">({activePct}%)</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="inline-flex items-center gap-2 font-medium text-amber-900">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
            Inactive
          </span>
          <span className="tabular-nums text-neutral-900">
            {inactive} <span className="text-neutral-500">({inactivePct}%)</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="inline-flex items-center gap-2 font-medium text-rose-900">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden />
            Dormant
          </span>
          <span className="tabular-nums text-neutral-900">
            {dormant} <span className="text-neutral-500">({dormantPct}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function GrowthLineChart({
  data,
}: {
  data: { label: string; totalMembers: number; activeMembers: number; avgAttendance: number }[];
}) {
  const n = data.length;
  const w = 560;
  const h = 200;
  const pad = 36;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  if (n === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-10 text-center text-sm text-neutral-500">
        No historical growth data yet.
      </div>
    );
  }
  const allVals = data.flatMap((d) => [d.totalMembers, d.activeMembers, d.avgAttendance]);
  const minV = Math.min(...allVals) * 0.92;
  const maxV = Math.max(...allVals) * 1.05;
  const scaleY = (v: number) => pad + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;
  const scaleX = (i: number) => pad + (i / Math.max(1, n - 1)) * innerW;

  const line = (key: "totalMembers" | "activeMembers" | "avgAttendance") => {
    return data
      .map((d, i) => `${scaleX(i)},${scaleY(d[key])}`)
      .join(" ");
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        className="mx-auto h-auto w-full max-w-full"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Growth trends over time"
      >
        <line
          x1={pad}
          y1={pad + innerH}
          x2={pad + innerW}
          y2={pad + innerH}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line("totalMembers")}
        />
        <polyline
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line("activeMembers")}
        />
        <polyline
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={line("avgAttendance")}
        />
        {data.map((d, i) => (
          <text
            key={d.label}
            x={scaleX(i)}
            y={h - 8}
            textAnchor="middle"
            fill="#737373"
            fontSize="11"
            fontWeight="600"
          >
            {d.label}
          </text>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-neutral-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 bg-blue-500" aria-hidden />
          Total Members
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 bg-emerald-500" aria-hidden />
          Active Members
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 bg-violet-500" aria-hidden />
          Avg Attendance
        </span>
      </div>
    </div>
  );
}

export function AdminReportsDashboard({ cellRows }: { cellRows: CellGroupRow[] }) {
  const d = buildReportsSnapshot(cellRows);
  const growthDisplay =
    d.growthRatePct === 0 ? "—" : `${d.growthRatePct >= 0 ? "+" : ""}${d.growthRatePct.toFixed(1)}%`;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1400px] space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black lg:text-3xl">
          Church Administration Reports
        </h1>
        <p className="mt-1 text-sm text-neutral-600 lg:text-base">
          Comprehensive analytics and insights across all cell groups
        </p>
        <Link
          href="/admin/attendance-results"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-950 no-underline transition hover:bg-sky-100 touch-manipulation"
        >
          <IconCalendar className="h-4 w-4 shrink-0" />
          Look up attendance by date or event name →
        </Link>
      </div>

      {/* Summary strip */}
      <section aria-label="Summary metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-neutral-500">Total Members</p>
            <IconUsers className="h-5 w-5 shrink-0 text-sky-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-black lg:text-3xl">
            {d.totalMembers}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-neutral-500">Growth Rate</p>
            <IconTrendUp className="h-5 w-5 shrink-0 text-emerald-600" />
          </div>
          <p
            className={`mt-3 text-2xl font-semibold tabular-nums lg:text-3xl ${d.growthRatePct === 0 ? "text-neutral-400" : "text-emerald-700"}`}
          >
            {growthDisplay}
          </p>
          {d.growthRatePct === 0 ? (
            <p className="mt-1 text-xs text-neutral-500">Connect historical roster data to show change.</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-neutral-500">Active Rate</p>
            <IconBarChart className="h-5 w-5 shrink-0 text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-violet-700 lg:text-3xl">
            {d.activeRatePct}%
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-neutral-500">Total Giving</p>
            <IconDollar className="h-5 w-5 shrink-0 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-black lg:text-3xl">
            {formatMoney(d.totalGiving)}
          </p>
        </div>
      </section>

      {/* Attendance + status */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-6">
          <h2 className="text-base font-bold text-black lg:text-lg">
            Attendance Trends Across All Cells
          </h2>
          <p className="mt-1 text-xs text-neutral-500 lg:text-sm">
            Weekly totals when attendance is stored in the database
          </p>
          <div className="mt-5">
            <WeeklyAttendanceChart data={d.attendanceByWeek} />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-6">
          <h2 className="text-base font-bold text-black lg:text-lg">Member Status Distribution</h2>
          <p className="mt-1 text-xs text-neutral-500 lg:text-sm">Live counts from roster</p>
          <div className="mt-6">
            <StatusDistribution active={d.active} inactive={d.inactive} dormant={d.dormant} />
          </div>
        </div>
      </section>

      {/* Growth line */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-6">
        <h2 className="text-base font-bold text-black lg:text-lg">Growth Trends Over Time</h2>
        <p className="mt-1 text-xs text-neutral-500 lg:text-sm">
          Current roster size by month label (no historical import yet)
        </p>
        <div className="mt-6">
          <GrowthLineChart data={d.growthByMonth} />
        </div>
      </section>

      {/* Top cells */}
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🏆
          </span>
          <h2 className="text-base font-bold text-black lg:text-lg">Top Performing Cells</h2>
        </div>
        <p className="mb-4 text-xs text-neutral-500 lg:text-sm">
          Ranked by engagement and attendance (combined), then active roster size.
        </p>
        <ul className="flex flex-col gap-3">
          {d.topCells.length === 0 ? (
            <li className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-8 text-center text-sm text-neutral-500">
              No cells yet. Create leader accounts to see them listed here.
            </li>
          ) : (
            d.topCells.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/cells/${c.id}`}
                  className="flex flex-col gap-4 rounded-lg border border-neutral-100 bg-neutral-50/80 p-4 no-underline transition hover:border-neutral-200 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between touch-manipulation"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-900 ring-1 ring-orange-200/80"
                      aria-hidden
                    >
                      #{c.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-black">{c.name}</p>
                      <p className="mt-0.5 text-sm text-neutral-600">Leader: {c.leader}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
                    <div className="flex items-center gap-2 text-sm">
                      <IconUserCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      <span className="font-semibold text-emerald-800">{c.engagement}%</span>
                      <span className="text-neutral-500">Engagement</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <IconLineChart className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                      <span className="font-semibold text-sky-800">{c.attendance}%</span>
                      <span className="text-neutral-500">Attendance</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Partnership */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-6">
          <div className="mb-4 flex items-center gap-2">
            <IconDollar className="h-5 w-5 text-emerald-600" aria-hidden />
            <h2 className="text-base font-bold text-emerald-900 lg:text-lg">Partnership Overview</h2>
          </div>
          <p className="text-xs text-neutral-500">Total Contributions</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-emerald-700 lg:text-4xl">
            {formatMoney(d.totalGiving)}
          </p>
          <div className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">By Type</p>
            {d.partnershipTypes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-6 text-center text-sm text-neutral-500">
                No giving data yet. This section will populate when contributions are stored in the database.
              </p>
            ) : (
              d.partnershipTypes.map((row) => (
                <div key={row.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-800">{row.label}</span>
                    <span className="tabular-nums text-neutral-700">
                      {formatMoney(row.amount)}{" "}
                      <span className="text-neutral-400">({row.pct}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${row.barClass}`}
                      style={{ width: `${Math.min(100, row.pct)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-sky-600" aria-hidden />
              <h2 className="text-base font-bold text-black lg:text-lg">Giving Timeline</h2>
            </div>
            <span className="text-xs text-neutral-500">
              {d.givingTimeline.length === 0
                ? "No contributions logged"
                : `Last ${d.givingTimeline.length} contributions`}
            </span>
          </div>
          <ul className="max-h-[min(60vh,28rem)] space-y-3 overflow-y-auto overscroll-contain pr-1">
            {d.givingTimeline.length === 0 ? (
              <li className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-8 text-center text-sm text-neutral-500">
                No giving timeline entries yet.
              </li>
            ) : (
              d.givingTimeline.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-100 bg-neutral-50/60 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${givingTagClass(row.category)}`}
                    >
                      {row.category}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{row.cellName}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                        <IconCalendar className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        {row.dateLabel}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-sm font-bold tabular-nums text-emerald-700 sm:pl-4">
                    {formatMoney(row.amount)}
                  </p>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-4 text-sm">
            <span className="inline-flex items-center gap-2 text-neutral-500">
              <IconLineChart className="h-4 w-4" aria-hidden />
              Showing recent activity
            </span>
            <span className="font-bold tabular-nums text-neutral-900">
              Total: {formatMoney(d.totalGiving)}
            </span>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-neutral-400">
        Demo charts and giving rows scale with live roster counts. Replace with API-backed analytics when
        ready.{" "}
        <Link href="/admin" className="font-medium text-neutral-600 underline touch-manipulation">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
