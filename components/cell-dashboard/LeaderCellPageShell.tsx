"use client";

import type { ReactNode } from "react";
import { LeaderCellDataProvider } from "@/components/offline/leader-cell-data-provider";
import { OfflineSnapshotHint } from "@/components/offline/offline-snapshot-hint";
import type { LeaderCellServerPayload } from "@/lib/offline/cell-snapshot-types";

export function LeaderCellPageShell({
  cellSlug,
  server,
  children,
}: {
  cellSlug: string;
  server?: LeaderCellServerPayload;
  children: ReactNode;
}) {
  return (
    <LeaderCellDataProvider cellSlug={cellSlug} server={server}>
      <OfflineSnapshotHint />
      {children}
    </LeaderCellDataProvider>
  );
}
