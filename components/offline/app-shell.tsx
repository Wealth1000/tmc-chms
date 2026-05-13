"use client";

import { OfflineBanner } from "@/components/offline/offline-banner";
import { OfflineProvider, useOfflineContext } from "@/components/offline/offline-context";
import { PwaRegister } from "@/components/offline/pwa-register";

function PaddedMain({ children }: { children: React.ReactNode }) {
  const { online, pendingSyncCount } = useOfflineContext();
  const reserve = !online || pendingSyncCount > 0;
  return (
    <div
      className={`flex min-h-0 min-h-[100dvh] flex-1 flex-col overflow-hidden overscroll-none ${reserve ? "pt-11 sm:pt-12" : ""}`}
    >
      {children}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OfflineProvider>
      <OfflineBanner />
      <PaddedMain>{children}</PaddedMain>
      <PwaRegister />
    </OfflineProvider>
  );
}
