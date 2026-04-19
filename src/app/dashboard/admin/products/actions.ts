"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteProductSubmission } from "@/lib/product-submissions";

export async function deleteProductAction(id: string) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });
  await deleteProductSubmission(id);
  revalidatePath("/dashboard/admin/products");
}
