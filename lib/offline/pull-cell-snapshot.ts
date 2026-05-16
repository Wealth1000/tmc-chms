import type { CellLeaderSnapshot } from "@/lib/offline/cell-snapshot-types";
import { saveCellSnapshot } from "@/lib/offline/cell-snapshot-store";

/** Download latest leader cell data from the server into IndexedDB. */
export async function pullCellSnapshot(cellSlug: string): Promise<CellLeaderSnapshot | null> {
  const res = await fetch(`/api/cell-snapshot?cell=${encodeURIComponent(cellSlug)}`, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as CellLeaderSnapshot;
  if (!data?.cellSlug) return null;
  await saveCellSnapshot(data);
  return data;
}
