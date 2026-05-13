/**
 * Recent activity for cell leader dashboard — client-side until backed by Supabase.
 */

import type { ActivityIcon, ActivityListItem } from "@/components/cell-dashboard/types";

const STORAGE_KEY = "tmc-chms-cell-activity-v1";

type StoredActivity = {
  id: string;
  cellId: string;
  icon: ActivityIcon;
  title: string;
  subtext: string;
  createdAt: number;
};

let memoryCache: StoredActivity[] | null = null;

function loadAll(): StoredActivity[] {
  if (typeof window === "undefined") return [];
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    memoryCache = Array.isArray(parsed) ? (parsed as StoredActivity[]) : [];
  } catch {
    memoryCache = [];
  }
  return memoryCache;
}

function persistCache(): void {
  if (typeof window === "undefined" || memoryCache === null) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
  } catch {
    /* ignore */
  }
}

export function appendCellActivity(
  cellId: string,
  entry: { icon: ActivityIcon; title: string; subtext: string },
): void {
  loadAll();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  memoryCache!.push({
    id,
    cellId,
    icon: entry.icon,
    title: entry.title,
    subtext: entry.subtext,
    createdAt: Date.now(),
  });
  persistCache();
}

export function listCellActivities(cellId: string, limit = 25): ActivityListItem[] {
  loadAll();
  return memoryCache!
    .filter((a) => a.cellId === cellId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map((a) => ({
      id: a.id,
      icon: a.icon,
      title: a.title,
      subtext: a.subtext,
    }));
}
