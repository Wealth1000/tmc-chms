"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { HelpFab } from "./HelpFab";
import { IconChevronLeft } from "./icons";
import { MemberFormFields } from "./MemberFormFields";
import { EMPTY_MEMBER_FORM, type MemberFormValues } from "./member-form-values";

export type AddMemberFormProps = {
  /** Defaults to `/` — cell flows should pass e.g. `/cell?cell=…` from the page */
  homeHref?: string;
  onCancel?: () => void;
  /** TODO: persist new member — wire validation + Supabase insert here */
  onSubmit?: () => void;
  onHelp?: () => void;
};

export function AddMemberForm({
  homeHref = "/",
  onCancel,
  onSubmit,
  onHelp,
}: AddMemberFormProps) {
  const [values, setValues] = useState<MemberFormValues>(EMPTY_MEMBER_FORM);
  const patch = useCallback((p: Partial<MemberFormValues>) => {
    setValues((v) => ({ ...v, ...p }));
  }, []);

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
            <h1 className="text-lg font-bold text-white lg:text-xl">Add New Member</h1>
            <p className="mt-0.5 text-sm text-white/55">Fill in member details</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-none bg-white px-4 lg:px-8">
        <MemberFormFields formInstanceId="add" values={values} onChange={patch} />
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
            onClick={() => onSubmit?.()}
          >
            Add Member
          </button>
        </div>
      </footer>
    </div>
  );
}
