"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applyUpdateMyCellName } from "@/lib/sync/apply-cell-mutations";

export type CellNameState = { error?: string; success?: boolean };

export async function updateMyCellName(
  _prev: CellNameState,
  formData: FormData,
): Promise<CellNameState> {
  const name = String(formData.get("cellName") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const r = await applyUpdateMyCellName(supabase, name);
  if (!r.ok) {
    return { error: r.error };
  }

  revalidatePath("/account/profile");
  revalidatePath("/cell");
  revalidatePath("/cell/edit");
  revalidatePath("/admin");
  revalidatePath("/admin/cells");
  revalidatePath("/admin/reports");
  return { success: true };
}
