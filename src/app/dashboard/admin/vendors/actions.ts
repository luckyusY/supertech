"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteMongoVendor } from "@/lib/mongodb-vendors";
import { hideItem } from "@/lib/hidden-items";

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
