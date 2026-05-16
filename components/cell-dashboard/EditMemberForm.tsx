"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLeaderCellDataOptional } from "@/components/offline/leader-cell-data-provider";
import { updateMemberAction } from "@/app/members/actions";
import { HelpFab } from "./HelpFab";
import { IconChevronLeft } from "./icons";
import { MemberFormFields } from "./MemberFormFields";
import { memberRecordToFormValues, type MemberFormValues } from "./member-form-values";
import type { MemberRecord } from "@/lib/members-store";

export type EditMemberFormProps = {
  memberId: string;
  /** Admin routes pass server-fetched member (no leader snapshot provider). */
  member?: MemberRecord;
  /** Defaults to `/cell-members` */
  listHref?: string;
  onCancel?: () => void;
  onSave?: () => void;
  onHelp?: () => void;
};

export function EditMemberForm({
  memberId,
  member: memberProp,
  listHref = "/cell-members",
  onCancel,
  onSave,
  onHelp,
}: EditMemberFormProps) {
  const leaderData = useLeaderCellDataOptional();
  const member = memberProp ?? leaderData?.getMemberById(memberId) ?? null;
  const router = useRouter();
  const saveLockRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [values, setValues] = useState<MemberFormValues>(() =>
    member ? memberRecordToFormValues(member) : memberRecordToFormValues({
      id: memberId,
      cellId: "",
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      area: "",
      isStudent: false,
      occupation: "",
      foundationStatus: "yet_to_start",
      memberStatus: "active",
    }),
  );

  useEffect(() => {
    if (member) setValues(memberRecordToFormValues(member));
  }, [member]);

  const patch = useCallback((p: Partial<MemberFormValues>) => {
    setValues((v) => ({ ...v, ...p }));
    setFormError(null);
  }, []);

  const handleSave = async () => {
    if (!member || saveLockRef.current) return;
    saveLockRef.current = true;
    setSubmitting(true);
    setFormError(null);

    const result = await updateMemberAction(member.id, {
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
      saveLockRef.current = false;
      setSubmitting(false);
      setFormError(result.error);
      return;
    }

    onSave?.();
    if (leaderData) void leaderData.refreshSnapshot();
    router.push(listHref);
    router.refresh();
  };

  if (!member) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white p-8 text-center text-sm text-neutral-600">
        <p>Member not found in saved data. Open members while online, then try again.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overscroll-none bg-white font-sans text-black">
      <HelpFab onClick={onHelp} />

      <header className="shrink-0 bg-[#0B0E14] px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top,0px))] lg:px-8 lg:pb-6 lg:pt-5">
        <div className="flex w-full max-w-full items-start gap-3">
          <Link
            href={listHref}
            className={`mt-0.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 ${submitting ? "pointer-events-none opacity-50" : ""}`}
            aria-label="Back to members"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-lg font-bold text-white lg:text-xl">Edit Member</h1>
            <p className="mt-0.5 text-sm text-white/55">Update member details</p>
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
          <MemberFormFields
            formInstanceId={`edit-${member.id}`}
            values={values}
            onChange={patch}
          />
        </fieldset>
      </main>

      <footer className="shrink-0 border-t border-neutral-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 lg:px-8">
        <div className="flex w-full max-w-full gap-3">
          <Link
            href={listHref}
            onClick={() => onCancel?.()}
            className={`flex h-12 min-h-12 flex-1 touch-manipulation items-center justify-center rounded-lg border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 ${submitting ? "pointer-events-none opacity-50" : ""}`}
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={submitting}
            className="flex h-12 min-h-12 flex-1 touch-manipulation items-center justify-center rounded-lg bg-[#0B0E14] text-sm font-bold text-white transition hover:bg-[#141922] disabled:pointer-events-none disabled:opacity-60"
            onClick={() => void handleSave()}
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </footer>
    </div>
  );
}
