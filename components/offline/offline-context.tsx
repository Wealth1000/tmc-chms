"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listSyncQueueOrdered, removeSyncMutation, syncQueueCount } from "@/lib/offline/offline-db";
import type { SyncQueueRecord } from "@/lib/offline/sync-types";

type OfflineContextValue = {
  online: boolean;
  pendingSyncCount: number;
  refreshPendingCount: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

function readNavigatorOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

async function postSyncRecord(record: SyncQueueRecord): Promise<boolean> {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ op: record.op, payload: record.payload }),
  });
  return res.ok;
}

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [online, setOnline] = useState(readNavigatorOnline);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const flushingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const n = await syncQueueCount();
    setPendingSyncCount(n);
  }, []);

  useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const flushQueue = useCallback(async () => {
    if (!readNavigatorOnline() || flushingRef.current) return;
    flushingRef.current = true;
    let didSync = false;
    try {
      const items = await listSyncQueueOrdered();
      if (items.length === 0) return;
      for (const item of items) {
        const ok = await postSyncRecord(item);
        if (!ok) break;
        await removeSyncMutation(item.id);
        didSync = true;
      }
      await refreshPendingCount();
      if (didSync) {
        window.dispatchEvent(new Event("tmc-cell-snapshot-refresh"));
        router.refresh();
      }
    } finally {
      flushingRef.current = false;
    }
  }, [refreshPendingCount, router]);

  useEffect(() => {
    if (!online) return;
    void flushQueue();
  }, [online, flushQueue]);

  const value = useMemo(
    () => ({ online, pendingSyncCount, refreshPendingCount }),
    [online, pendingSyncCount, refreshPendingCount],
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOfflineContext(): OfflineContextValue {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error("useOfflineContext must be used within OfflineProvider");
  }
  return ctx;
}
