"use server";

import { revalidatePath } from "next/cache";
import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import { revalidateCellSlugPaths } from "@/lib/revalidate-cell-paths";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applySaveCellLeaderDetails } from "@/lib/sync/apply-cell-mutations";

export type SaveCellDetailsState = { error?: string; success?: boolean };

export async function saveCellLeaderDetails(
  cellSlug: string,
  values: CellLeaderEditableInfo,
): Promise<SaveCellDetailsState> {
  const supabase = await createSupabaseServerClient();
  const r = await applySaveCellLeaderDetails(supabase, cellSlug, values);
  if (!r.ok) {
    return { error: r.error };
  }

  revalidateCellSlugPaths(cellSlug);
  revalidatePath("/account/profile");
  return { success: true };
}
