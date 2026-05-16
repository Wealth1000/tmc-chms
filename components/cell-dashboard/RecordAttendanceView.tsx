"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconCalendar,
  IconChevronLeft,
  IconClose,
  IconSearch,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
} from "./icons";
import { useLeaderCellData } from "@/components/offline/leader-cell-data-provider";
import { isCellLeaderRosterEntry, type MemberRosterStatus } from "@/lib/members-store";
import { saveAttendanceAction } from "@/app/members/actions";

export type AttendanceMemberRow = {
  id: string;
  fullName: string;
  memberStatus: MemberRosterStatus;
};

type InviteeDraft = {
  id: string;
  name: string;
  phone: string;
};

function newInviteeId() {
  return `inv-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Some Android browsers deliver native :active on <button> but never fire a bubbling
 * click that reaches React's root listener (nested overflow scrollers / touch heuristics).
 * DOM listeners on the node itself still see touchend + click reliably.
 */
function useNativeTapButton<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T | null>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let suppressNextClick = false;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const onTouchEnd = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handlerRef.current();
      suppressNextClick = true;
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        suppressNextClick = false;
        resetTimer = undefined;
      }, 450);
    };

    const onClick = () => {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      handlerRef.current();
    };

    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("click", onClick);

    return () => {
      if (resetTimer !== undefined) clearTimeout(resetTimer);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("click", onClick);
    };
  }, []);

  return ref;
}

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

type InviteeRowProps = {
  row: InviteeDraft;
  onRemove: () => void;
  onPatch: (patch: Partial<Pick<InviteeDraft, "name" | "phone">>) => void;
};

function InviteeRow({ row, onRemove, onPatch }: InviteeRowProps) {
  const removeRef = useNativeTapButton<HTMLButtonElement>(onRemove);

  return (
    <li className="relative rounded-xl border border-sky-200/80 bg-sky-50/70 p-3 sm:p-4">
      <button
        ref={removeRef}
        type="button"
        className="absolute right-2 top-2 z-20 min-h-11 min-w-11 touch-manipulation rounded-lg text-rose-600 sm:right-3 sm:top-3"
        aria-label="Remove invitee"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center">
          <IconClose className="h-5 w-5" />
        </span>
      </button>
      <div className="grid grid-cols-1 gap-3 pr-10 sm:grid-cols-2 sm:gap-4 sm:pr-12">
        <div>
          <label htmlFor={`inv-name-${row.id}`} className="mb-1 block text-xs font-medium text-sky-950/80">
            Invitee Name *
          </label>
          <input
            id={`inv-name-${row.id}`}
            type="text"
            value={row.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            placeholder="Enter name"
            className="w-full min-h-11 rounded-lg border border-sky-200/80 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20"
          />
        </div>
        <div>
          <label htmlFor={`inv-phone-${row.id}`} className="mb-1 block text-xs font-medium text-sky-950/80">
            Phone Number
          </label>
          <input
            id={`inv-phone-${row.id}`}
            type="tel"
            value={row.phone}
            onChange={(e) => onPatch({ phone: e.target.value })}
            placeholder="Enter phone number"
            className="w-full min-h-11 rounded-lg border border-sky-200/80 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500/20"
          />
        </div>
      </div>
    </li>
  );
}

type RecordAttendanceViewProps = {
  homeHref: string;
};

export function RecordAttendanceView({ homeHref }: RecordAttendanceViewProps) {
  const { cellSlug, members: roster } = useLeaderCellData();
  const members = useMemo((): AttendanceMemberRow[] => {
    return roster
      .filter((m) => !isCellLeaderRosterEntry(m))
      .map((m) => ({
        id: m.id,
        fullName: m.fullName,
        memberStatus: m.memberStatus,
      }));
  }, [roster]);
  const router = useRouter();
  const saveLockRef = useRef(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [meetingDate, setMeetingDate] = useState(() => {
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      return "2026-05-12";
    }
  });
  const [search, setSearch] = useState("");
  const [presentIds, setPresentIds] = useState<Set<string>>(() => new Set());
  const [invitees, setInvitees] = useState<InviteeDraft[]>([]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...members].sort((a, b) => a.fullName.localeCompare(b.fullName));
    if (!q) return list;
    return list.filter((m) => m.fullName.toLowerCase().includes(q));
  }, [members, search]);

  const presentCount = presentIds.size;
  const inviteeCount = invitees.length;
  const headcountTotal = presentCount + inviteeCount;

  function toggleMember(id: string) {
    if (saveLockRef.current) return;
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllActive() {
    if (saveLockRef.current) return;
    const ids = members.filter((m) => m.memberStatus === "active").map((m) => m.id);
    setPresentIds(new Set(ids));
  }

  function clearAll() {
    if (saveLockRef.current) return;
    setPresentIds(new Set());
    setInvitees([]);
  }

  function addInvitee() {
    if (saveLockRef.current) return;
    setInvitees((rows) => [...rows, { id: newInviteeId(), name: "", phone: "" }]);
  }

  function removeInvitee(id: string) {
    if (saveLockRef.current) return;
    setInvitees((rows) => rows.filter((r) => r.id !== id));
  }

  function patchInvitee(id: string, patch: Partial<Pick<InviteeDraft, "name" | "phone">>) {
    if (saveLockRef.current) return;
    setInvitees((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const selectAllRef = useNativeTapButton<HTMLButtonElement>(selectAllActive);
  const clearAllRef = useNativeTapButton<HTMLButtonElement>(clearAll);
  const addInviteeRef = useNativeTapButton<HTMLButtonElement>(addInvitee);

  const handleSaveAttendance = useCallback(async () => {
    if (saveLockRef.current) return;
    saveLockRef.current = true;
    setSavingAttendance(true);

    const inviteePayload = invitees.map((r) => ({
      name: r.name,
      phone: r.phone,
    }));

    const result = await saveAttendanceAction(
      cellSlug,
      meetingDate,
      Array.from(presentIds),
      inviteePayload,
    );

    if (!result.ok) {
      saveLockRef.current = false;
      setSavingAttendance(false);
      window.alert(result.error);
      return;
    }

    router.push(homeHref);
  }, [cellSlug, homeHref, invitees, meetingDate, presentIds, router]);

  const saveRef = useNativeTapButton<HTMLButtonElement>(handleSaveAttendance);

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none bg-white font-sans text-black">
      <header className="relative z-20 shrink-0 bg-[#0B0E14] px-3 pb-5 pt-[max(1rem,env(safe-area-inset-top,0px))] sm:px-6 lg:px-8 lg:pb-6 lg:pt-5">
        <div className="mx-auto flex w-full max-w-3xl items-start gap-3">
          <Link
            href={homeHref}
            className={`mt-0.5 inline-flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 ${savingAttendance ? "pointer-events-none opacity-50" : ""}`}
            aria-label="Back"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-lg font-bold text-white lg:text-xl">Record Attendance</h1>
            <p className="mt-0.5 text-sm text-white/55">Mark present members</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto min-h-0 w-full min-w-0 max-w-3xl flex-1 overflow-y-auto overscroll-none px-3 pb-40 pt-5 sm:px-6 lg:px-8 lg:pb-40 lg:pt-6">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 sm:p-4">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-800">
            <IconCalendar className="h-4 w-4 shrink-0 text-neutral-600" />
            <label htmlFor="meeting-date">Meeting Date *</label>
          </div>
          <div className="relative">
            <input
              id="meeting-date"
              type="date"
              value={meetingDate}
              disabled={savingAttendance}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full min-h-12 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 p-3 sm:p-4">
            <p className="text-xs font-medium text-emerald-900/80">Present</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-black">{presentCount}</p>
          </div>
          <div className="rounded-xl border border-sky-200/90 bg-sky-50/90 p-3 sm:p-4">
            <p className="text-xs font-medium text-sky-900/80">Invitees</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-black">{inviteeCount}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-100/90 p-3 sm:p-4">
            <p className="text-xs font-medium text-neutral-600">Total</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-black">{headcountTotal}</p>
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <IconSearch className="h-4 w-4" />
            </span>
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={search}
              disabled={savingAttendance}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="w-full min-h-12 rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10 disabled:opacity-60"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-stretch sm:gap-3">
          <button
            ref={selectAllRef}
            type="button"
            disabled={savingAttendance}
            className="min-h-12 w-full touch-manipulation rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100/80 active:bg-emerald-200/80 disabled:pointer-events-none disabled:opacity-50 sm:flex-1"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <IconUserCheck className="h-4 w-4 shrink-0" aria-hidden />
              Select All Active
            </span>
          </button>
          <button
            ref={clearAllRef}
            type="button"
            disabled={savingAttendance}
            className="min-h-12 w-full touch-manipulation rounded-lg border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 active:bg-neutral-100 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:shrink-0 sm:px-5"
          >
            Clear All
          </button>
        </div>

        <section className="mt-6 sm:mt-8" aria-labelledby="members-heading">
          <h2
            id="members-heading"
            className="mb-3 flex items-center gap-2 text-base font-bold text-black lg:text-lg"
          >
            <IconUsers className="h-5 w-5 shrink-0 text-neutral-700" />
            Members ({members.length})
          </h2>
          <ul className="space-y-2">
            {filteredMembers.map((m) => {
              const checked = presentIds.has(m.id);
              return (
                <li key={m.id}>
                  <label className="flex min-h-[52px] cursor-pointer touch-manipulation items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 active:bg-neutral-50 sm:px-4">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={savingAttendance}
                      onChange={() => toggleMember(m.id)}
                      className="h-5 w-5 shrink-0 rounded border-neutral-300 text-black focus:ring-neutral-900 disabled:opacity-50"
                    />
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${rosterDotClass(m.memberStatus)}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-black">{m.fullName}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {filteredMembers.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">No members match your search.</p>
          ) : null}
        </section>

        <section className="mt-8 sm:mt-10" aria-labelledby="invitees-heading">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="invitees-heading"
              className="flex items-center gap-2 text-base font-bold text-black lg:text-lg"
            >
              <IconUserPlus className="h-5 w-5 shrink-0 text-sky-700" />
              Invitees ({inviteeCount})
            </h2>
            <button
              ref={addInviteeRef}
              type="button"
              disabled={savingAttendance}
              className="min-h-12 w-full touch-manipulation rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-center text-sm font-semibold text-sky-800 transition hover:bg-sky-100/80 active:bg-sky-200/80 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:self-start"
            >
              + Add Invitee
            </button>
          </div>
          {invitees.length === 0 ? (
            <p className="rounded-xl border border-dashed border-sky-200/80 bg-sky-50/40 px-4 py-6 text-center text-sm text-sky-950/70">
              No invitees yet. Use <span className="font-semibold text-sky-950">+ Add Invitee</span> to record
              visitors.
            </p>
          ) : (
            <ul className="space-y-3">
              {invitees.map((row) => (
                <InviteeRow
                  key={row.id}
                  row={row}
                  onRemove={() => removeInvitee(row.id)}
                  onPatch={(patch) => patchInvitee(row.id, patch)}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white px-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 sm:flex-row sm:gap-3">
          <Link
            href={homeHref}
            className={`block min-h-12 w-full touch-manipulation rounded-lg border border-neutral-300 bg-white py-3 text-center text-sm font-semibold text-neutral-900 no-underline transition hover:bg-neutral-50 active:bg-neutral-100 sm:flex-1 ${savingAttendance ? "pointer-events-none opacity-50" : ""}`}
          >
            Cancel
          </Link>
          <button
            ref={saveRef}
            type="button"
            disabled={savingAttendance}
            className="block min-h-12 w-full touch-manipulation rounded-lg bg-[#0B0E14] py-3 text-center text-sm font-bold text-white transition hover:bg-[#141922] active:bg-[#141922] disabled:pointer-events-none disabled:opacity-60 sm:flex-1"
          >
            {savingAttendance ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </footer>
    </div>
  );
}
