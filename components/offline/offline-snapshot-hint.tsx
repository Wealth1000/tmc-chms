"use client";

import { useLeaderCellDataOptional } from "@/components/offline/leader-cell-data-provider";

function formatSnapshotAge(fetchedAt: number): string {
  try {
    return new Date(fetchedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "unknown time";
  }
}

/** Shown on leader screens when data is served from the on-device snapshot. */
export function OfflineSnapshotHint() {
  const data = useLeaderCellDataOptional();
  if (!data?.usingLocalSnapshot || !data.snapshotFetchedAt) return null;

  return (
    <p className="shrink-0 border-b border-amber-100 bg-amber-50/95 px-3 py-1.5 text-center text-[11px] font-medium text-amber-950 sm:text-xs">
      {data.online ? (
        <>Showing saved copy from {formatSnapshotAge(data.snapshotFetchedAt)} while the page refreshes.</>
      ) : (
        <>
          Offline · showing data saved {formatSnapshotAge(data.snapshotFetchedAt)}. Edits queue until you
          reconnect.
        </>
      )}
    </p>
  );
}
