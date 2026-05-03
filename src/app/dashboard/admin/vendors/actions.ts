"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteMongoVendor } from "@/lib/mongodb-vendors";
import { hideItem, unhideItem } from "@/lib/hidden-items";

export async function deleteVendorAction(slug: string, isSeed: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  if (isSeed) {
    await hideItem("vendor", slug);
  } else {
    await deleteMongoVendor(slug);
  }
  revalidatePath("/dashboard/admin/vendors");
  revalidatePath("/vendors");
  revalidatePath("/");
}

export async function toggleVendorAction(slug: string, currentlyDisabled: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  if (currentlyDisabled) {
    await unhideItem("vendor", slug);
  } else {
    await hideItem("vendor", slug);
  }
  revalidatePath("/dashboard/admin/vendors");
  revalidatePath("/vendors");
  revalidatePath("/");
}
