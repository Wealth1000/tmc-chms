"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  IconCalendar,
  IconClipboard,
  IconDollar,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from "@/components/cell-dashboard/icons";
import type {
  AttendanceSessionListRow,
  DayAttendanceReport,
} from "@/lib/attendance-results-models";
import { aggregateEventSearchRows } from "@/lib/attendance-results-models";
import {
  lastSundayIsoLocal,
  localIsoDate,
  todayIsoLocal,
  yesterdayIsoLocal,
} from "@/lib/admin-attendance-date-helpers";

const cardClass =
  "rounded-lg border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]";

const EXAMPLE_EVENT_CHIPS = [
  "Sunday Miracle Night",
  "Youth Service",
  "Prayer Night",
  "Midweek Service",
];

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatRecordedAt(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatMeetingDateLabel(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function SummaryStat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-black">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-neutral-500">{sub}</p> : null}
      </div>
    </div>
  );
}

function SessionCard({ row }: { row: AttendanceSessionListRow }) {
  return (
    <div className={`${cardClass} p-4 sm:p-5`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Cell group</p>
          <p className="text-lg font-bold text-black">{row.cellName}</p>
          <p className="mt-1 text-sm text-neutral-600">
            Meeting date{" "}
            <span className="font-semibold text-neutral-900">{formatMeetingDateLabel(row.meetingDate)}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
            {row.memberPresentCount} members present
          </span>
          {row.inviteeCount > 0 ? (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">
              {row.inviteeCount} invitee{row.inviteeCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>
      {row.eventTitle.trim() ? (
        <p className="mt-3 text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">Event:</span> {row.eventTitle}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <IconClipboard className="h-3.5 w-3.5 shrink-0" />
          Recorded {formatRecordedAt(row.recordedAt)}
        </span>
        {row.offeringAmount != null ? (
          <span className="inline-flex items-center gap-1 font-medium text-neutral-800">
            <IconDollar className="h-3.5 w-3.5 shrink-0" />
            Offering {formatUsd(row.offeringAmount)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-neutral-400">No offering on file</span>
        )}
      </div>
    </div>
  );
}

export type AdminAttendanceResultsClientProps = {
  dateParam: string;
  dateValid: boolean;
  eventParam: string;
  dayReport: DayAttendanceReport | null;
  eventRows: AttendanceSessionListRow[];
};

export function AdminAttendanceResultsClient({
  dateParam,
  dateValid,
  eventParam,
  dayReport,
  eventRows,
}: AdminAttendanceResultsClientProps) {
  const router = useRouter();
  const [dateDraft, setDateDraft] = useState(dateValid ? dateParam : "");
  const [eventDraft, setEventDraft] = useState(eventParam);

  useEffect(() => {
    setDateDraft(dateValid ? dateParam : "");
  }, [dateParam, dateValid]);

  useEffect(() => {
    setEventDraft(eventParam);
  }, [eventParam]);

  const eventAgg = useMemo(() => aggregateEventSearchRows(eventRows), [eventRows]);

  const pushQuery = useCallback(
    (next: { date?: string; event?: string }) => {
      const p = new URLSearchParams();
      if (next.date) p.set("date", next.date);
      if (next.event) p.set("event", next.event);
      const qs = p.toString();
      router.push(qs ? `/admin/attendance-results?${qs}` : "/admin/attendance-results");
    },
    [router],
  );

  const applyDate = useCallback(() => {
    const trimmed = dateDraft.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return;
    pushQuery({ date: trimmed, event: undefined });
  }, [dateDraft, pushQuery]);

  const applyEvent = useCallback(() => {
    const t = eventDraft.trim();
    if (t.length < 2) return;
    pushQuery({ event: t, date: undefined });
  }, [eventDraft, pushQuery]);

  const quickDate = useCallback(
    (iso: string) => {
      setDateDraft(iso);
      pushQuery({ date: iso, event: undefined });
    },
    [pushQuery],
  );

  const chipIdle =
    "rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200/80 touch-manipulation";
  const chipActive =
    "rounded-lg border border-sky-300 bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-950 touch-manipulation";
  const quickSelected = useCallback((iso: string) => dateValid && dateParam === iso, [dateValid, dateParam]);

  return (
    <div className="w-full min-w-0 max-w-full px-3 py-6 pb-10 sm:px-4 md:px-6 lg:mx-auto lg:max-w-6xl lg:px-8 lg:py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-black md:text-2xl">Attendance & event results</h1>
          <p className="mt-1 text-sm text-neutral-600 md:text-base">
            Answer questions like “last Sunday, what was our total attendance?” or “how much was recorded for{' '}
            <span className="font-medium text-neutral-800">Sunday Miracle Night</span>?” — by meeting date across all
            cells, or by event title once leaders tag sessions.
          </p>
        </div>

        {/* Quick date filters — template-style row */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Quick dates</p>
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <button type="button" className={quickSelected(todayIsoLocal()) ? chipActive : chipIdle} onClick={() => quickDate(todayIsoLocal())}>
              Today
            </button>
            <button type="button" className={quickSelected(yesterdayIsoLocal()) ? chipActive : chipIdle} onClick={() => quickDate(yesterdayIsoLocal())}>
              Yesterday
            </button>
            <button type="button" className={quickSelected(lastSundayIsoLocal()) ? chipActive : chipIdle} onClick={() => quickDate(lastSundayIsoLocal())}>
              Last Sunday
            </button>
            <button
              type="button"
              className={chipIdle}
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                quickDate(localIsoDate(d));
              }}
            >
              Same day last week
            </button>
          </div>
        </div>

        {/* Filters grid — template */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={`${cardClass} p-4`}>
            <label className="mb-2 block text-sm font-semibold text-neutral-900" htmlFor="meeting-date-filter">
              By meeting date
            </label>
            <p className="mb-3 text-xs text-neutral-500">
              Totals every cell attendance session saved for that calendar date (cell group meetings).
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id="meeting-date-filter"
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
                className="min-h-11 w-full min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/15 sm:max-w-[220px] [color-scheme:light]"
              />
              <button
                type="button"
                onClick={() => void applyDate()}
                className="min-h-11 shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 touch-manipulation"
              >
                View results
              </button>
            </div>
            {dateParam && !dateValid ? (
              <p className="mt-2 text-xs text-rose-700">That date format is not valid. Use the date picker.</p>
            ) : null}
          </div>

          <div className={`${cardClass} p-4`}>
            <label className="mb-2 block text-sm font-semibold text-neutral-900" htmlFor="event-name-filter">
              By event name
            </label>
            <p className="mb-3 text-xs text-neutral-500">
              Matches the optional <strong className="font-medium">event title</strong> stored on a session (e.g.
              Sunday Miracle Night). Offering totals sum only rows that have an amount saved.
            </p>
            <div className="relative mb-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <IconSearch className="h-4 w-4" />
              </span>
              <input
                id="event-name-filter"
                type="search"
                value={eventDraft}
                onChange={(e) => setEventDraft(e.target.value)}
                placeholder="Search events…"
                className="w-full min-h-11 rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/15"
                autoComplete="off"
              />
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {EXAMPLE_EVENT_CHIPS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-800 transition hover:bg-neutral-100 touch-manipulation"
                  onClick={() => {
                    setEventDraft(label);
                    pushQuery({ event: label, date: undefined });
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void applyEvent()}
              className="min-h-11 w-full rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 touch-manipulation sm:w-auto"
            >
              Search by title
            </button>
          </div>
        </div>

        {/* Day report */}
        {dateValid && dayReport ? (
          <section className="space-y-4" aria-labelledby="day-results-heading">
            <h2 id="day-results-heading" className="text-lg font-bold text-black">
              Results for {formatMeetingDateLabel(dayReport.meetingDate)}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryStat
                label="Members present (total)"
                value={String(dayReport.totalMemberPresent)}
                sub="Sum across all cell sessions that day"
                icon={<IconUsers className="h-5 w-5" />}
              />
              <SummaryStat
                label="Invitees (total)"
                value={String(dayReport.totalInvitees)}
                sub="Visitors recorded with attendance"
                icon={<IconUserPlus className="h-5 w-5" />}
              />
              <SummaryStat
                label="Offering (total)"
                value={formatUsd(dayReport.totalOffering)}
                sub="Only sessions with an amount saved"
                icon={<IconDollar className="h-5 w-5" />}
              />
              <SummaryStat
                label="Cells reporting"
                value={String(dayReport.sessionCount)}
                sub="Distinct attendance saves"
                icon={<IconClipboard className="h-5 w-5" />}
              />
            </div>
            {dayReport.rows.length === 0 ? (
              <div className="py-12 text-center">
                <IconCalendar className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                <p className="text-neutral-600">No attendance was recorded for this date yet.</p>
                <p className="mt-1 text-sm text-neutral-500">Try another quick date or pick a different day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-500">
                  {dayReport.rows.length} session{dayReport.rows.length === 1 ? "" : "s"}
                </p>
                {dayReport.rows.map((row) => (
                  <SessionCard key={row.id} row={row} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* Event search results */}
        {eventParam.length >= 2 ? (
          <section className="space-y-4" aria-labelledby="event-results-heading">
            <h2 id="event-results-heading" className="text-lg font-bold text-black">
              Sessions matching “{eventParam}”
            </h2>
            {eventRows.length === 0 ? (
              <div className={`${cardClass} py-12 text-center`}>
                <IconSearch className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                <p className="text-neutral-600">No sessions use that event title yet.</p>
                <p className="mt-1 max-w-md px-4 text-sm text-neutral-500">
                  When cell leaders save attendance with an event name and optional offering, those rows will show
                  here. You can still use <strong className="font-medium">meeting date</strong> above for totals by
                  Sunday.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryStat
                    label="Members present (total)"
                    value={String(eventAgg.totalMemberPresent)}
                    icon={<IconUsers className="h-5 w-5" />}
                  />
                  <SummaryStat
                    label="Invitees (total)"
                    value={String(eventAgg.totalInvitees)}
                    icon={<IconUserPlus className="h-5 w-5" />}
                  />
                  <SummaryStat
                    label="Offering (total)"
                    value={formatUsd(eventAgg.totalOffering)}
                    icon={<IconDollar className="h-5 w-5" />}
                  />
                  <SummaryStat
                    label="Sessions"
                    value={String(eventAgg.sessionCount)}
                    icon={<IconClipboard className="h-5 w-5" />}
                  />
                </div>
                <div className="space-y-3">
                  {eventRows.map((row) => (
                    <SessionCard key={row.id} row={row} />
                  ))}
                </div>
              </>
            )}
          </section>
        ) : null}

        {!dateValid && eventParam.length < 2 ? (
          <div className={`${cardClass} py-10 text-center`}>
            <IconCalendar className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
            <p className="font-medium text-neutral-800">Choose a meeting date or search an event</p>
            <p className="mx-auto mt-1 max-w-lg text-sm text-neutral-500">
              Use <strong className="font-medium">Last Sunday</strong> for a typical check, or pick any date to see
              church-wide totals from cell submissions.
            </p>
            <Link
              href="/admin/reports"
              className="mt-4 inline-block text-sm font-semibold text-neutral-900 underline-offset-2 hover:underline"
            >
              ← Back to reports overview
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
