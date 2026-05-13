"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconUsers,
} from "@/components/cell-dashboard/icons";
import { type CellGroupRow } from "@/lib/admin-cells-store";

function sortedByActiveDesc(rows: CellGroupRow[]) {
  return [...rows].sort((a, b) => {
    if (b.active !== a.active) return b.active - a.active;
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name);
  });
}

export function AdminCellsDirectory({ rows }: { rows: CellGroupRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.leader.toLowerCase().includes(q),
      );
    }
    return sortedByActiveDesc(out);
  }, [rows, search]);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden overscroll-none bg-[#0B0E14]">
      <header className="shrink-0 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-5 lg:pt-5">
        <div className="mb-4 flex items-start gap-3">
          <Link
            href="/admin"
            className="mt-0.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
            aria-label="Back to admin dashboard"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white lg:text-xl">All cells</h1>
            <p className="mt-0.5 text-sm text-white/55">
              {filtered.length} cell group{filtered.length === 1 ? "" : "s"} · highest active first
            </p>
          </div>
        </div>
        <label className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <IconSearch />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cell or leader…"
            className="w-full rounded-lg border-0 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:bg-white/15 focus:ring-white/25"
            autoComplete="off"
            aria-label="Search cells"
          />
        </label>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 lg:px-8 lg:pb-6 lg:pt-5">
          <ul className="flex flex-col gap-3">
            {filtered.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/cells/${row.id}`}
                  prefetch
                  className="flex touch-manipulation gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm no-underline transition hover:border-neutral-300 hover:shadow-md active:bg-neutral-50/80"
                  aria-label={`Open ${row.name}`}
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                    <IconUsers className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-black">{row.name}</p>
                      <IconChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-neutral-300" />
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">Led by {row.leader}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-neutral-700">
                      <span>
                        <span className="font-medium text-neutral-900">{row.total}</span> total
                      </span>
                      <span className="text-emerald-800">
                        <span className="font-semibold">{row.active}</span> active
                      </span>
                      <span className="text-amber-900">
                        <span className="font-semibold">{row.inactive}</span> inactive
                      </span>
                      <span className="text-rose-900">
                        <span className="font-semibold">{row.dormant}</span> dormant
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">Updated {row.updatedLabel}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              {rows.length === 0 ? "No cells yet. Invite leaders from Supabase Auth — each leader gets a cell row automatically." : "No cells match your search."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
