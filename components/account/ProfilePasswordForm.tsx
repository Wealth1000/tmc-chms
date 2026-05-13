"use client";

import { useActionState, useEffect, useRef } from "react";
import { updatePassword } from "@/app/auth/actions";
import { useOfflineContext } from "@/components/offline/offline-context";

export function ProfilePasswordForm() {
  const { online } = useOfflineContext();
  const [state, formAction, pending] = useActionState(updatePassword, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 max-w-md space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Password updated.
        </p>
      ) : null}

      {!online ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Connect to the internet to change your password. Password updates are not stored offline.
        </p>
      ) : null}

      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-neutral-800">
          New password
        </label>
        <input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-neutral-800">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
        />
      </div>
      <button
        type="submit"
        disabled={pending || !online}
        className="min-h-11 touch-manipulation rounded-lg bg-[#0B0E14] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#141922] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
