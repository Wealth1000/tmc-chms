"use client";

import { useOfflineContext } from "@/components/offline/offline-context";

export function OfflineBanner() {
  const { online, pendingSyncCount } = useOfflineContext();

  if (online && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div
      role="status"
      className="pointer-events-none fixed left-0 right-0 top-0 z-[200] px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-0"
    >
      <div
        className={`mx-auto max-w-2xl rounded-b-lg border px-3 py-2 text-center text-xs font-medium shadow-lg sm:text-sm ${
          online
            ? "border-amber-200/80 bg-amber-50 text-amber-950"
            : "border-rose-200/80 bg-rose-50 text-rose-950"
        }`}
      >
        {!online ? (
          <>
            You are offline. Changes you save are stored on this device only and{" "}
            <span className="font-semibold">will sync to Supabase when you are back online</span>.
          </>
        ) : pendingSyncCount > 0 ? (
          <>
            Back online. Syncing {pendingSyncCount} pending change{pendingSyncCount === 1 ? "" : "s"}…
          </>
        ) : null}
      </div>
    </div>
  );
}
