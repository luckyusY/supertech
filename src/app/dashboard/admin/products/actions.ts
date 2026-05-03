"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteProductSubmission } from "@/lib/product-submissions";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { deleteMongoProduct } from "@/lib/mongodb-products";
import { isSeedSynced } from "@/lib/mongodb-products";

export async function deleteProductAction(id: string, isSeed: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });

  const synced = await isSeedSynced();

  if (synced) {
    // Synced mode: delete from MongoDB permanently (tracks slug so re-sync won't restore it)
    await deleteMongoProduct(id);
  } else if (isSeed) {
    // Legacy mode: hide the seed product
    await hideItem("product", id);
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
