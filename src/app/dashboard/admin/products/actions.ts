"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteProductSubmission } from "@/lib/product-submissions";
import { hideItem, unhideItem } from "@/lib/hidden-items";

export async function deleteProductAction(id: string, isSeed: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });
  if (isSeed) {
    await hideItem("product", id); // id is the slug for seed products
  } else {
    await deleteProductSubmission(id);
  }
  revalidatePath("/dashboard/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function toggleProductAction(slug: string, currentlyDisabled: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });
  if (currentlyDisabled) {
    await unhideItem("product", slug);
  } else {
    await hideItem("product", slug);
  }
  revalidatePath("/dashboard/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/");
}
