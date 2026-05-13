"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HelpFab } from "./HelpFab";
import {
  IconArrowUpDown,
  IconBriefcase,
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconMail,
  IconPhone,
  IconSearch,
} from "./icons";
import {
  cellDashboardHref,
  cellMemberEditHref,
  cellMembersHref,
} from "@/lib/cell-leader-links";
import {
  parseMemberListFilter,
  isCellLeaderRosterEntry,
  type MemberListFilter,
  type MemberRecord,
} from "@/lib/members-store";

function statusDotClass(status: MemberRecord["memberStatus"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500";
    case "inactive":
      return "bg-amber-500";
    default:
      return "bg-red-500";
  }
}

function leaderBadgeClass() {
  return "border-violet-700 bg-violet-700 text-white";
}

function statusBadgeClass(status: MemberRecord["memberStatus"]) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "inactive":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}

const filterDefs: { id: MemberListFilter; label: string; pillIdle: string }[] = [
  { id: "all", label: "All", pillIdle: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200/80" },
  {
    id: "active",
    label: "Active",
    pillIdle: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80",
  },
  {
    id: "inactive",
    label: "Inactive",
    pillIdle: "bg-amber-50 text-amber-900 hover:bg-amber-100/80",
  },
  {
    id: "dormant",
    label: "Dormant",
    pillIdle: "bg-rose-50 text-rose-900 hover:bg-rose-100/80",
  },
];

function filterHref(id: MemberListFilter, cellSlug: string) {
  return cellMembersHref(cellSlug, id);
}

export type CellMembersViewProps = {
  cellSlug: string;
  members: MemberRecord[];
};

export function CellMembersView({ cellSlug, members }: CellMembersViewProps) {
  const searchParams = useSearchParams();
  const filter: MemberListFilter = parseMemberListFilter(searchParams.get("filter"));
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = members.filter((m) => m.cellId === cellSlug);
    if (filter !== "all") {
      list = list.filter((m) => m.memberStatus === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q) ||
          m.occupation.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const al = isCellLeaderRosterEntry(a);
      const bl = isCellLeaderRosterEntry(b);
      if (al !== bl) return al ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [filter, search, cellSlug, members]);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden overscroll-none bg-[#0B0E14]">
      <HelpFab />

      <header className="shrink-0 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-5 lg:pt-5">
        <div className="mb-4 flex items-start gap-3">
          <Link
            href={cellDashboardHref(cellSlug)}
            className="mt-0.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
            aria-label="Back to dashboard"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white lg:text-xl">Cell Members</h1>
            <p className="mt-0.5 text-sm text-white/55">
              {filtered.length} member{filtered.length === 1 ? "" : "s"}
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
            placeholder="Search members..."
            className="w-full rounded-lg border-0 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/40 focus:bg-white/15 focus:ring-white/25"
            autoComplete="off"
            aria-label="Search members"
          />
        </label>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="shrink-0 border-b border-neutral-200 px-4 py-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-neutral-500" aria-hidden>
              <IconFilter className="h-[18px] w-[18px]" />
            </span>
            {filterDefs.map(({ id, label, pillIdle }) => {
              const selected = filter === id;
              return (
                <Link
                  key={id}
                  href={filterHref(id, cellSlug)}
                  scroll={false}
                  className={`touch-manipulation rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    selected ? "bg-black text-white" : pillIdle
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
            <IconArrowUpDown className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
            <span>
              Sort by: <span className="font-semibold text-black">Name</span>
            </span>
            {/* TODO: wire sort dropdown / other sort keys */}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 lg:px-8 lg:pb-6 lg:pt-5">
          <ul className="flex flex-col gap-3">
            {filtered.map((m) => {
              const isLeader = isCellLeaderRosterEntry(m);
              const href = isLeader ? "/account/profile" : cellMemberEditHref(cellSlug, m.id);
              const aria = isLeader ? `View profile for ${m.fullName}` : `Edit ${m.fullName}`;
              return (
                <li key={m.id}>
                  <Link
                    href={href}
                    prefetch={!isLeader}
                    className="flex touch-manipulation gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm no-underline transition hover:border-neutral-300 hover:shadow-md active:bg-neutral-50/80"
                    aria-label={aria}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusDotClass(m.memberStatus)}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-black">{m.fullName}</p>
                        <IconChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-neutral-300" />
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                        <IconMail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{m.email}</span>
                      </p>
                      {m.phone.trim() ? (
                        <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                          <IconPhone className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{m.phone}</span>
                        </p>
                      ) : null}
                      <p className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                        {m.occupation.startsWith("Student") ? (
                          <IconBriefcase className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <IconBuilding className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{m.occupation}</span>
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {isLeader ? (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${leaderBadgeClass()}`}
                          >
                            LEADER
                          </span>
                        ) : null}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusBadgeClass(m.memberStatus)}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDotClass(m.memberStatus)}`}
                          />
                          {m.memberStatus}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">No members match this view.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
