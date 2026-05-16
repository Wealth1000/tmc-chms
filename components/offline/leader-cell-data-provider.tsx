"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CellLeaderSnapshotDashboard } from "@/lib/offline/cell-snapshot-types";
import type { LeaderCellServerPayload } from "@/lib/offline/cell-snapshot-types";
import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import { getCellSnapshot } from "@/lib/offline/cell-snapshot-store";
import { pullCellSnapshot } from "@/lib/offline/pull-cell-snapshot";
import type { MemberRecord } from "@/lib/members-store";
import { useOfflineContext } from "@/components/offline/offline-context";

type LeaderCellDataContextValue = {
  cellSlug: string;
  online: boolean;
  /** When showing data from IndexedDB rather than a live server render */
  usingLocalSnapshot: boolean;
  snapshotFetchedAt: number | null;
  dashboard: CellLeaderSnapshotDashboard | null;
  members: MemberRecord[];
  editable: CellLeaderEditableInfo | null;
  getMemberById: (id: string) => MemberRecord | null;
  refreshSnapshot: () => Promise<void>;
};

const LeaderCellDataContext = createContext<LeaderCellDataContextValue | null>(null);

export function LeaderCellDataProvider({
  cellSlug,
  server,
  children,
}: {
  cellSlug: string;
  server?: LeaderCellServerPayload;
  children: ReactNode;
}) {
  const { online } = useOfflineContext();
  const [localSnapshot, setLocalSnapshot] = useState<Awaited<ReturnType<typeof getCellSnapshot>>>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCellSnapshot(cellSlug).then((s) => {
      if (!cancelled) {
        setLocalSnapshot(s);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cellSlug]);

  const refreshSnapshot = useCallback(async () => {
    if (!online) return;
    const fresh = await pullCellSnapshot(cellSlug);
    if (fresh) setLocalSnapshot(fresh);
  }, [cellSlug, online]);

  useEffect(() => {
    if (!online) return;
    void refreshSnapshot();
  }, [online, refreshSnapshot]);

  useEffect(() => {
    const onRefresh = () => {
      void refreshSnapshot();
    };
    window.addEventListener("tmc-cell-snapshot-refresh", onRefresh);
    return () => window.removeEventListener("tmc-cell-snapshot-refresh", onRefresh);
  }, [refreshSnapshot]);

  const usingLocalSnapshot =
    !online || (hydrated && Boolean(localSnapshot?.dashboard) && !server?.dashboard);

  const dashboard = useMemo((): CellLeaderSnapshotDashboard | null => {
    if (online && server?.dashboard) return server.dashboard;
    return localSnapshot?.dashboard ?? server?.dashboard ?? null;
  }, [online, server?.dashboard, localSnapshot?.dashboard]);

  const members = useMemo((): MemberRecord[] => {
    if (online && server?.members?.length) return server.members;
    if (localSnapshot?.members?.length) return localSnapshot.members;
    return server?.members ?? [];
  }, [online, server?.members, localSnapshot?.members]);

  const editable = useMemo((): CellLeaderEditableInfo | null => {
    if (online && server?.editable) return server.editable;
    return localSnapshot?.editable ?? server?.editable ?? null;
  }, [online, server?.editable, localSnapshot?.editable]);

  const getMemberById = useCallback(
    (id: string) => {
      const fromServer = server?.member?.id === id ? server.member : null;
      if (online && fromServer) return fromServer;
      return members.find((m) => m.id === id) ?? fromServer;
    },
    [members, online, server?.member],
  );

  const value = useMemo(
    (): LeaderCellDataContextValue => ({
      cellSlug,
      online,
      usingLocalSnapshot: usingLocalSnapshot && hydrated,
      snapshotFetchedAt: localSnapshot?.fetchedAt ?? null,
      dashboard,
      members,
      editable,
      getMemberById,
      refreshSnapshot,
    }),
    [
      cellSlug,
      online,
      usingLocalSnapshot,
      hydrated,
      localSnapshot?.fetchedAt,
      dashboard,
      members,
      editable,
      getMemberById,
      refreshSnapshot,
    ],
  );

  return <LeaderCellDataContext.Provider value={value}>{children}</LeaderCellDataContext.Provider>;
}

export function useLeaderCellData(): LeaderCellDataContextValue {
  const ctx = useContext(LeaderCellDataContext);
  if (!ctx) {
    throw new Error("useLeaderCellData must be used within LeaderCellDataProvider");
  }
  return ctx;
}

/** Optional hook for pages outside provider (returns null). */
export function useLeaderCellDataOptional(): LeaderCellDataContextValue | null {
  return useContext(LeaderCellDataContext);
}
