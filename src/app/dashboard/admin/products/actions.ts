"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteProductSubmission, updateProductSubmissionStatus } from "@/lib/product-submissions";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { notifyProductModeration } from "@/lib/notifications";

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

/**
 * Result of a moderation action. Returned rather than thrown so the admin sees
 * the real reason a decision failed: Next redacts server action errors in
 * production, which turns a failure into a button that appears to do nothing.
 */
export type ProductModerationResult = { ok: true } | { ok: false; error: string };

async function moderateProduct(
  id: string,
  status: "approved" | "rejected",
): Promise<ProductModerationResult> {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });

  let submission;
  try {
    submission = await updateProductSubmissionStatus(id, status);
  } catch (error) {
    console.error(`Product ${status} failed for submission ${id}`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to update this product.",
    };
  }

  await notifyProductModeration({
    vendorSlug: submission.vendorSlug,
    productName: submission.name,
    approved: status === "approved",
    refId: submission.slug,
  }).catch(() => {}); // Ignore notification failures

  revalidatePath("/dashboard/admin/products");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/vendor");
  revalidatePath("/catalog");
  revalidatePath("/");
  revalidatePath(`/products/${submission.slug}`);

  return { ok: true };
}

/** `id` is the submission's MongoDB _id, not its human-readable submissionId. */
export async function approveProductAction(id: string) {
  return moderateProduct(id, "approved");
}

/** `id` is the submission's MongoDB _id, not its human-readable submissionId. */
export async function rejectProductAction(id: string) {
  return moderateProduct(id, "rejected");
}
