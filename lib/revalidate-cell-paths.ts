import { revalidatePath } from "next/cache";

/** Invalidate leader + admin surfaces that read this cell slug or aggregates. */
export function revalidateCellSlugPaths(cellSlug: string) {
  revalidatePath("/cell");
  revalidatePath(`/cell?cell=${encodeURIComponent(cellSlug)}`);
  revalidatePath("/cell/edit");
  revalidatePath(`/cell/edit?cell=${encodeURIComponent(cellSlug)}`);
  revalidatePath("/cell-members");
  revalidatePath(`/cell-members?cell=${encodeURIComponent(cellSlug)}`);
  revalidatePath("/add-member");
  revalidatePath(`/add-member?cell=${encodeURIComponent(cellSlug)}`);
  revalidatePath("/cell/attendance");
  revalidatePath(`/cell/attendance?cell=${encodeURIComponent(cellSlug)}`);
  revalidatePath("/admin");
  revalidatePath("/admin/members");
  revalidatePath("/admin/cells");
  revalidatePath(`/admin/cells/${encodeURIComponent(cellSlug)}`);
  revalidatePath("/admin/reports");
  revalidatePath("/admin/attendance-results");
}
