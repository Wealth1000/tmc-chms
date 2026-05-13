"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconFilter,
  IconHeart,
  IconSearch,
  IconUserCheck,
  IconUserMinus,
  IconUserX,
  IconUsers,
} from "@/components/cell-dashboard/icons";
import { adminMembersHref } from "@/lib/admin-members-links";
import { ADMIN_CELLS_DIRECTORY_PATH } from "@/lib/admin-cells-links";
import {
  aggregateAdminStats,
  type AdminActivityItem,
  type CellGroupRow,
} from "@/lib/admin-cells-store";

function ActivityIcon({ item }: { item: AdminActivityItem }) {
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-white";
  if (item.type === "attendance") {
    return (
      <div className={`${base} border-sky-200 bg-sky-500`} aria-hidden>
        <span className="text-xs font-bold">A</span>
      </div>
    );
  }
  if (item.type === "member") {
    return (
      <div className={`${base} border-emerald-200 bg-emerald-500`} aria-hidden>
        <span className="text-xs font-bold">M</span>
      </div>
    );
  }
  return (
    <div className={`${base} border-violet-200 bg-violet-500`} aria-hidden>
      <span className="text-xs font-bold">R</span>
    </div>
  );
}

type StatusScope = "all" | "inactive" | "dormant";

export function AdminDashboardHome({
  cellRows,
  activityItems,
}: {
  cellRows: CellGroupRow[];
  activityItems: AdminActivityItem[];
}) {
  const rows = cellRows;
  const stats = aggregateAdminStats(rows);

  const [search, setSearch] = useState("");
  const [cellScope, setCellScope] = useState<string>("all");
  const [statusScope, setStatusScope] = useState<StatusScope>("all");

  const filteredRows = useMemo(() => {
    let out = rows;
    if (cellScope !== "all") {
      out = out.filter((r) => r.id === cellScope);
    }
    if (statusScope === "inactive") {
      out = out.filter((r) => r.inactive > 0);
    } else if (statusScope === "dormant") {
      out = out.filter((r) => r.dormant > 0);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.leader.toLowerCase().includes(q),
      );
    }
    return [...out].sort((a, b) => {
      if (b.active !== a.active) return b.active - a.active;
      if (b.total !== a.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    });
  }, [rows, cellScope, statusScope, search]);

  return (
    <div className="w-full min-w-0 max-w-full px-3 py-5 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full min-w-0 max-w-[1400px]">
        <h1 className="text-xl font-bold tracking-tight text-black sm:text-2xl lg:text-3xl">
          Church Group Administration
        </h1>
        <p className="mt-1 text-sm text-neutral-600 lg:text-base">
          Overview and management of all cell groups
        </p>

        <section className="mt-5 lg:mt-8" aria-label="Summary statistics">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            <Link
              href={ADMIN_CELLS_DIRECTORY_PATH}
              prefetch
              className="flex min-h-[100px] min-w-0 flex-col rounded-lg border border-neutral-200 bg-white p-3 no-underline shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-neutral-300 sm:min-h-0 sm:p-4 touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium leading-snug text-neutral-500 sm:text-xs">
                  Total Cells
                </p>
                <IconUsers className="h-4 w-4 shrink-0 text-neutral-700 sm:h-5 sm:w-5" />
              </div>
              <p className="mt-auto pt-2 text-xl font-semibold tabular-nums text-black sm:mt-3 sm:text-2xl">
                {stats.totalCells}
              </p>
            </Link>
            <Link
              href={adminMembersHref("all")}
              prefetch
              className="flex min-h-[100px] min-w-0 flex-col rounded-lg border border-neutral-200 bg-white p-3 no-underline shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-neutral-300 sm:min-h-0 sm:p-4 touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium leading-snug text-neutral-500 sm:text-xs">
                  Total Members
                </p>
                <IconHeart className="h-4 w-4 shrink-0 text-neutral-700 sm:h-5 sm:w-5" />
              </div>
              <p className="mt-auto pt-2 text-xl font-semibold tabular-nums text-black sm:mt-3 sm:text-2xl">
                {stats.totalMembers}
              </p>
            </Link>
            <Link
              href={adminMembersHref("active")}
              prefetch
              className="flex min-h-[100px] min-w-0 flex-col rounded-lg border border-emerald-200/80 bg-emerald-50/90 p-3 no-underline shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:opacity-95 sm:min-h-0 sm:p-4 touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium leading-snug text-emerald-900/80 sm:text-xs">
                  Active Members
                </p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-2 sm:w-2" aria-hidden />
                  <IconUserCheck className="h-4 w-4 text-emerald-700 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="mt-auto pt-2 text-xl font-semibold tabular-nums text-black sm:mt-3 sm:text-2xl">
                {stats.active}
              </p>
            </Link>
            <Link
              href={adminMembersHref("inactive")}
              prefetch
              className="flex min-h-[100px] min-w-0 flex-col rounded-lg border border-amber-200/80 bg-amber-50/90 p-3 no-underline shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:opacity-95 sm:min-h-0 sm:p-4 touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium leading-snug text-amber-950/75 sm:text-xs">
                  Inactive Members
                </p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 sm:h-2 sm:w-2" aria-hidden />
                  <IconUserX className="h-4 w-4 text-amber-800 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="mt-auto pt-2 text-xl font-semibold tabular-nums text-black sm:mt-3 sm:text-2xl">
                {stats.inactive}
              </p>
            </Link>
            <Link
              href={adminMembersHref("dormant")}
              prefetch
              className="col-span-2 flex min-h-[100px] min-w-0 flex-col rounded-lg border border-rose-200/80 bg-rose-50/90 p-3 no-underline shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:opacity-95 md:col-span-1 sm:min-h-0 sm:p-4 touch-manipulation"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium leading-snug text-rose-950/75 sm:text-xs">
                  Dormant Members
                </p>
                <div className="flex shrink-0 items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 sm:h-2 sm:w-2" aria-hidden />
                  <IconUserMinus className="h-4 w-4 text-rose-700 sm:h-5 sm:w-5" />
                </div>
              </div>
              <p className="mt-auto pt-2 text-xl font-semibold tabular-nums text-black sm:mt-3 sm:text-2xl">
                {stats.dormant}
              </p>
            </Link>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-neutral-200 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-4 lg:mt-8 lg:p-5">
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <IconSearch />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cells..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-1 focus:ring-neutral-900/10"
              autoComplete="off"
              aria-label="Search cells"
            />
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <IconFilter className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
              <select
                value={cellScope}
                onChange={(e) => setCellScope(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
                aria-label="Filter by cell"
              >
                <option value="all">All Cells</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusScope}
              onChange={(e) => setStatusScope(e.target.value as StatusScope)}
              className="w-full cursor-pointer rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-neutral-900 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10 sm:w-auto sm:min-w-[160px]"
              aria-label="Filter by member status mix"
            >
              <option value="all">All Status</option>
              <option value="inactive">Has inactive members</option>
              <option value="dormant">Has dormant members</option>
            </select>
          </div>
        </section>

        <section className="mt-5 lg:mt-8" id="cells-table">
          <h2 className="mb-1 text-base font-bold text-black sm:text-lg">Cell Overview</h2>
          <p className="mb-3 text-xs text-neutral-500 sm:text-sm lg:text-sm">
            Rows ordered by active members (highest first), then total roster.
          </p>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-3 py-3 font-semibold text-neutral-800 lg:px-4">Cell Name</th>
                  <th className="px-3 py-3 font-semibold text-neutral-800 lg:px-4">Cell Leader</th>
                  <th className="px-3 py-3 font-semibold text-neutral-800 lg:px-4">Total</th>
                  <th className="px-3 py-3 font-semibold text-neutral-800 lg:px-4">
                    <span className="flex flex-col gap-0.5 sm:inline sm:whitespace-nowrap">
                      <span>Status</span>
                      <span
                        className="text-[10px] font-normal text-emerald-700 sm:text-xs"
                        title="Table sorted by active count"
                      >
                        <span className="sm:hidden">Active ↓</span>
                        <span className="hidden sm:inline">(by active ↓)</span>
                      </span>
                    </span>
                  </th>
                  <th className="px-3 py-3 font-semibold text-neutral-800 lg:px-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <CellTableRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
            {filteredRows.length === 0 ? (
              <p className="px-4 py-8 text-center text-neutral-500">No cells match your filters.</p>
            ) : null}
          </div>
          </div>
        </section>

        <section className="mt-6 lg:mt-10">
          <h2 className="mb-3 text-base font-bold text-black sm:text-lg">Recent Updates from Cells</h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <ul className="divide-y divide-neutral-200">
              {activityItems.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-neutral-500">
                  No recent activity yet. As you add members and record attendance, summaries will appear here.
                </li>
              ) : (
                activityItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:gap-4 sm:px-4 sm:py-4 lg:px-5 lg:py-4"
                  >
                    <ActivityIcon item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-neutral-900">
                        {item.categoryLabel}
                        <span className="font-normal text-neutral-400"> · </span>
                        <span className="font-medium">{item.cellName}</span>
                      </p>
                      <p className="mt-1 break-words text-sm text-neutral-700">{item.description}</p>
                      <p className="mt-1.5 text-xs text-neutral-500">{item.timeLabel}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function CellTableRow({ row }: { row: CellGroupRow }) {
  return (
    <tr className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80">
      <td className="px-3 py-3 align-top lg:px-4">
        <Link
          href={`/admin/cells/${row.id}`}
          className="font-semibold text-black no-underline hover:underline touch-manipulation"
        >
          {row.name}
        </Link>
      </td>
      <td className="px-3 py-3 align-top break-words text-neutral-700 lg:px-4">{row.leader}</td>
      <td className="px-3 py-3 align-top tabular-nums text-neutral-900 lg:px-4">{row.total}</td>
      <td className="px-3 py-3 align-top lg:px-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
          <span className="inline-flex items-center gap-1.5 text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            {row.active}
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
            {row.inactive}
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-900">
            <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
            {row.dormant}
          </span>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 align-top text-neutral-600 lg:px-4">
        {row.updatedLabel}
      </td>
    </tr>
  );
}
