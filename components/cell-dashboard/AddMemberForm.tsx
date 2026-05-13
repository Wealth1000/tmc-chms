"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { createMemberAction } from "@/app/members/actions";
import { HelpFab } from "./HelpFab";
import { IconChevronLeft } from "./icons";
import { MemberFormFields } from "./MemberFormFields";
import { EMPTY_MEMBER_FORM, type MemberFormValues } from "./member-form-values";

export type AddMemberFormProps = {
  cellSlug: string;
  /** Defaults to `/` — cell flows should pass e.g. `/cell?cell=…` from the page */
  homeHref?: string;
  onCancel?: () => void;
  onHelp?: () => void;
};

function validateMemberForm(v: MemberFormValues): string | null {
  if (!v.fullName.trim()) return "Please enter the member’s full name.";
  if (!v.email.trim()) return "Please enter an email address.";
  if (!v.email.includes("@")) return "Please enter a valid email address.";
  if (!v.dateOfBirth.trim()) return "Please enter date of birth.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.dateOfBirth.trim())) {
    return "Please choose date of birth using the calendar.";
  }
  if (!v.area.trim()) return "Please enter area / residence.";
  if (!v.occupation.trim()) return "Please enter occupation.";
  return null;
}

export function AddMemberForm({
  cellSlug,
  homeHref = "/",
  onCancel,
  onHelp,
}: AddMemberFormProps) {
  const router = useRouter();
  const submitLockRef = useRef(false);
  const [values, setValues] = useState<MemberFormValues>(EMPTY_MEMBER_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const patch = useCallback((p: Partial<MemberFormValues>) => {
    setValues((v) => ({ ...v, ...p }));
    setFormError(null);
  }, []);

  const handleSubmit = async () => {
    if (submitLockRef.current) return;
    const err = validateMemberForm(values);
    if (err) {
      setFormError(err);
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    const result = await createMemberAction(cellSlug, {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      dateOfBirth: values.dateOfBirth.trim(),
      area: values.area.trim(),
      isStudent: values.isStudent,
      occupation: values.occupation.trim(),
      foundationStatus: values.foundationStatus,
      memberStatus: values.memberStatus,
    });

    if (!result.ok) {
      submitLockRef.current = false;
      setSubmitting(false);
      setFormError(result.error);
      return;
    }

    router.push(homeHref);
    router.refresh();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-none bg-white font-sans text-black">
      <HelpFab onClick={onHelp} />

      <header className="shrink-0 bg-[#0B0E14] px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-6 lg:pt-5">
        <div className="flex w-full max-w-full items-start gap-3">
          <Link
            href={homeHref}
            className={`mt-0.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 ${submitting ? "pointer-events-none opacity-50" : ""}`}
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
        {formError ? (
          <p className="mb-4 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 lg:mt-6">
            {formError}
          </p>
        ) : null}

        <fieldset disabled={submitting} className="min-w-0 border-0 p-0">
          <MemberFormFields formInstanceId="add" values={values} onChange={patch} />
        </fieldset>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-neutral-200 bg-white/95 px-4 pb-[max(6.5rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] pt-4 backdrop-blur-sm lg:-mx-8 lg:px-8">
          <div className="flex w-full max-w-full gap-3">
            <Link
              href={homeHref}
              onClick={() => onCancel?.()}
              className={`flex h-12 min-h-12 flex-1 touch-manipulation items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 ${submitting ? "pointer-events-none opacity-50" : ""}`}
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={submitting}
              className="flex h-12 min-h-12 flex-1 touch-manipulation items-center justify-center rounded-lg bg-[#0B0E14] text-sm font-bold text-white transition hover:bg-[#141922] disabled:pointer-events-none disabled:opacity-60"
              onClick={() => void handleSubmit()}
            >
              {submitting ? "Adding…" : "Add Member"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
