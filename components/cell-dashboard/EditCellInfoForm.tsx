"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { HelpFab } from "./HelpFab";
import {
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconClock,
  IconMapPin,
  IconUsers,
} from "./icons";
import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import { MEETING_DAY_OPTIONS } from "@/lib/cell-info-store";
import { saveCellLeaderDetails } from "@/app/cell/actions";
import { useOfflineContext } from "@/components/offline/offline-context";
import { enqueueSyncMutation } from "@/lib/offline/offline-db";

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-neutral-800">
      {children}
      {required ? <span className="text-red-600"> *</span> : null}
    </label>
  );
}

function InputShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-900/10 ${className}`}
    >
      {children}
    </div>
  );
}

export type EditCellInfoFormProps = {
  cellId: string;
  initial: CellLeaderEditableInfo;
  homeHref: string;
  onCancel?: () => void;
  onHelp?: () => void;
};

export function EditCellInfoForm({
  cellId,
  initial,
  homeHref,
  onCancel,
  onHelp,
}: EditCellInfoFormProps) {
  const router = useRouter();
  const { online, refreshPendingCount } = useOfflineContext();
  const [values, setValues] = useState<CellLeaderEditableInfo>(initial);
  const [saveError, setSaveError] = useState<string | null>(null);

  const patch = useCallback((p: Partial<CellLeaderEditableInfo>) => {
    setValues((v) => ({ ...v, ...p }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    const lastUpdatedLabel = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const payload: CellLeaderEditableInfo = {
      cellName: values.cellName.trim(),
      leaderName: values.leaderName.trim(),
      description: values.description.trim(),
      meetingLocation: values.meetingLocation.trim(),
      meetingDay: values.meetingDay,
      meetingTime: values.meetingTime.trim(),
      lastUpdatedLabel,
    };

    if (!online) {
      await enqueueSyncMutation("save_cell_details", { cellSlug: cellId, values: payload });
      await refreshPendingCount();
      router.refresh();
      router.push(homeHref);
      return;
    }

    const res = await saveCellLeaderDetails(cellId, payload);
    if (res.error) {
      setSaveError(res.error);
      return;
    }
    router.refresh();
    router.push(homeHref);
  }, [cellId, homeHref, online, refreshPendingCount, router, values]);

  const days = MEETING_DAY_OPTIONS();

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none bg-white font-sans text-black">
      <HelpFab onClick={onHelp} />

      <header className="shrink-0 bg-[#0B0E14] px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-6 lg:pt-5">
        <div className="flex w-full max-w-full items-start gap-3">
          <Link
            href={homeHref}
            className="mt-0.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
            aria-label="Back"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-lg font-bold text-white lg:text-xl">Update Cell Info</h1>
            <p className="mt-0.5 text-sm text-white/55">Edit cell group details</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 lg:px-8">
        <div className="w-full max-w-full py-6 pb-8 lg:py-8 lg:pb-10">
          {saveError ? (
            <p className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              {saveError}
            </p>
          ) : null}
          <section className="mb-10">
            <div className="mb-6 flex items-center gap-2 text-base font-semibold text-neutral-900">
              <IconUsers className="h-5 w-5 shrink-0 text-[#0B0E14]" />
              Basic Information
            </div>
            <div className="space-y-5">
              <div>
                <FieldLabel required>Cell Name</FieldLabel>
                <input
                  type="text"
                  value={values.cellName}
                  onChange={(e) => patch({ cellName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
                  autoComplete="organization"
                />
              </div>
              <div>
                <FieldLabel required>Cell Leader Name</FieldLabel>
                <input
                  type="text"
                  value={values.leaderName}
                  onChange={(e) => patch({ leaderName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
                  autoComplete="name"
                />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={values.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
                />
              </div>
            </div>
          </section>

          <section className="mb-2">
            <div className="mb-6 flex items-center gap-2 text-base font-semibold text-neutral-900">
              <IconCalendar className="h-5 w-5 shrink-0 text-[#0B0E14]" />
              Meeting Details
            </div>
            <div className="space-y-5">
              <div>
                <FieldLabel required>Meeting Location</FieldLabel>
                <InputShell>
                  <span className="flex shrink-0 items-center border-r border-neutral-200 px-3 text-neutral-400">
                    <IconMapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <input
                    type="text"
                    value={values.meetingLocation}
                    onChange={(e) => patch({ meetingLocation: e.target.value })}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                    autoComplete="street-address"
                  />
                </InputShell>
              </div>
              <div>
                <FieldLabel required>Meeting Day</FieldLabel>
                <div className="relative">
                  <select
                    value={values.meetingDay}
                    onChange={(e) => patch({ meetingDay: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2.5 pl-3 pr-10 text-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <IconChevronDown className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div>
                <FieldLabel required>Meeting Time</FieldLabel>
                <InputShell>
                  <span className="flex shrink-0 items-center border-r border-neutral-200 px-3 text-neutral-400">
                    <IconClock className="h-4 w-4" aria-hidden />
                  </span>
                  <input
                    type="text"
                    value={values.meetingTime}
                    onChange={(e) => patch({ meetingTime: e.target.value })}
                    placeholder="07:00 PM"
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </InputShell>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="shrink-0 border-t border-neutral-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 lg:px-8">
        <div className="flex w-full max-w-full gap-3">
          <Link
            href={homeHref}
            onClick={() => onCancel?.()}
            className="flex h-12 min-h-12 flex-1 touch-manipulation items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            className="flex h-12 min-h-12 flex-1 touch-manipulation items-center justify-center rounded-lg bg-[#0B0E14] text-sm font-bold text-white transition hover:bg-[#141922]"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </footer>
    </div>
  );
}
