import Dexie, { type Table } from "dexie";
import type { SyncQueueOp, SyncQueueRecord } from "@/lib/offline/sync-types";

class TmcOfflineDexie extends Dexie {
  syncQueue!: Table<SyncQueueRecord, string>;

  constructor() {
    super("tmc-chms-offline");
    this.version(1).stores({
      syncQueue: "id, createdAt, op",
    });
  }
}

let _offlineDb: TmcOfflineDexie | null | undefined;

export function getOfflineDb(): TmcOfflineDexie | null {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return null;
  if (_offlineDb === undefined) {
    _offlineDb = new TmcOfflineDexie();
  }
  return _offlineDb;
}

export async function enqueueSyncMutation(op: SyncQueueOp, payload: unknown): Promise<void> {
  const offlineDb = getOfflineDb();
  if (!offlineDb) return;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await offlineDb.syncQueue.add({
    id,
    op,
    payload,
    createdAt: Date.now(),
  });
}

export async function syncQueueCount(): Promise<number> {
  const offlineDb = getOfflineDb();
  if (!offlineDb) return 0;
  return offlineDb.syncQueue.count();
}

export async function listSyncQueueOrdered(): Promise<SyncQueueRecord[]> {
  const offlineDb = getOfflineDb();
  if (!offlineDb) return [];
  return offlineDb.syncQueue.orderBy("createdAt").toArray();
}

export async function removeSyncMutation(id: string): Promise<void> {
  const offlineDb = getOfflineDb();
  if (!offlineDb) return;
  await offlineDb.syncQueue.delete(id);
}

/** Clears all queued offline mutations (e.g. after sign-out). */
export async function clearOfflineSyncQueue(): Promise<void> {
  const offlineDb = getOfflineDb();
  if (!offlineDb) return;
  await offlineDb.syncQueue.clear();
}
