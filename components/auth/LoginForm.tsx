"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import { useOfflineContext } from "@/components/offline/offline-context";

const submitBtnClass =
  "min-h-12 w-full touch-manipulation rounded-lg bg-[#0B0E14] py-3 text-sm font-bold text-white transition hover:bg-[#141922] active:bg-[#141922] disabled:opacity-60";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, null);
  const { online } = useOfflineContext();

  return (
    <div className="flex min-h-0 min-h-[100dvh] flex-1 flex-col overflow-hidden overscroll-none bg-[#0B0E14] font-sans text-black">
      <div className="flex min-h-0 min-h-[100dvh] flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white px-6 py-8 shadow-xl shadow-black/20">
          <h1 className="text-center text-xl font-bold text-black">Sign in</h1>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Sign in with the email and password from your Supabase project (Auth → Users). Signing in requires an
            internet connection. After that, your session stays on this device so the app can open while offline until
            you sign out (sign out is online-only).
          </p>

          {!online ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-950">
              You are offline. Connect to the internet to sign in.
            </p>
          ) : null}

          <form action={formAction} className="mt-8 space-y-5">
            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {error}
              </p>
            ) : null}

            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-neutral-800">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                enterKeyHint="next"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-neutral-800">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                enterKeyHint="go"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
              />
            </div>

            <button type="submit" className={submitBtnClass} disabled={pending || !online}>
              {pending ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
