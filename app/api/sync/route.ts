import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { CellLeaderEditableInfo } from "@/lib/cell-info-store";
import {
  isSaveCellDetailsPayload,
  isUpdateCellNamePayload,
  type SyncQueueOp,
} from "@/lib/offline/sync-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applySaveCellLeaderDetails, applyUpdateMyCellName } from "@/lib/sync/apply-cell-mutations";

type SyncRequestBody = {
  op: SyncQueueOp;
  payload: unknown;
};

export async function POST(request: Request) {
  let body: SyncRequestBody;
  try {
    body = (await request.json()) as SyncRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.op !== "update_cell_name" && body.op !== "save_cell_details") {
    return NextResponse.json({ error: "Unknown op" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (body.op === "update_cell_name") {
    if (!isUpdateCellNamePayload(body.payload)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const r = await applyUpdateMyCellName(supabase, body.payload.name);
    if (!r.ok) {
      return NextResponse.json({ error: r.error }, { status: 400 });
    }
    revalidatePath("/account/profile");
    revalidatePath("/cell");
    revalidatePath("/cell/edit");
    return NextResponse.json({ ok: true });
  }

  if (!isSaveCellDetailsPayload(body.payload)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const r = await applySaveCellLeaderDetails(
    supabase,
    body.payload.cellSlug,
    body.payload.values as CellLeaderEditableInfo,
  );
  if (!r.ok) {
    return NextResponse.json({ error: r.error }, { status: 400 });
  }
  revalidatePath("/cell");
  revalidatePath("/cell/edit");
  revalidatePath("/account/profile");
  return NextResponse.json({ ok: true });
}
