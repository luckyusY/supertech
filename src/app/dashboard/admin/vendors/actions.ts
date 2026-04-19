"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteMongoVendor } from "@/lib/mongodb-vendors";

export async function deleteVendorAction(slug: string) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  await deleteMongoVendor(slug);
  revalidatePath("/dashboard/admin/vendors");
}
