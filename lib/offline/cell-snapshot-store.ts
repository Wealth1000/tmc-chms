import type { CellLeaderSnapshot } from "@/lib/offline/cell-snapshot-types";
import { getOfflineDb } from "@/lib/offline/offline-db";

export async function getCellSnapshot(cellSlug: string): Promise<CellLeaderSnapshot | null> {
  const db = getOfflineDb();
  if (!db) return null;
  const row = await db.cellSnapshots.get(cellSlug);
  return row ?? null;
}

export async function saveCellSnapshot(snapshot: CellLeaderSnapshot): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.cellSnapshots.put(snapshot);
}

export async function clearCellSnapshots(): Promise<void> {
  const db = getOfflineDb();
  if (!db) return;
  await db.cellSnapshots.clear();
}
