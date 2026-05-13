import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";

export type SyncQueueOp = "update_cell_name" | "save_cell_details";

export type SyncQueueRecord = {
  id: string;
  op: SyncQueueOp;
  payload: unknown;
  createdAt: number;
};

export type UpdateCellNamePayload = { name: string };

export type SaveCellDetailsPayload = {
  cellSlug: string;
  values: CellLeaderEditableInfo;
};

export function isUpdateCellNamePayload(p: unknown): p is UpdateCellNamePayload {
  return (
    typeof p === "object" &&
    p !== null &&
    "name" in p &&
    typeof (p as { name: unknown }).name === "string"
  );
}

export function isSaveCellDetailsPayload(p: unknown): p is SaveCellDetailsPayload {
  if (typeof p !== "object" || p === null) return false;
  const o = p as { cellSlug?: unknown; values?: unknown };
  return typeof o.cellSlug === "string" && typeof o.values === "object" && o.values !== null;
}
