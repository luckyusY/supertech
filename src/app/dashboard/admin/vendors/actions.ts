"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { deleteMongoVendor } from "@/lib/mongodb-vendors";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { isSeedSynced, getDeletedSeedSlugs } from "@/lib/mongodb-products";
import { getDatabase } from "@/lib/mongodb";

export async function deleteVendorAction(slug: string, isSeed: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });

  const synced = await isSeedSynced();

  if (synced) {
    // Synced mode: delete from MongoDB permanently + track so re-sync won't restore
    await deleteMongoVendor(slug);
    const db = await getDatabase();
    await db.collection("deleted_seeds").updateOne(
      { type: "vendor", slug },
      { $set: { type: "vendor", slug, deletedAt: new Date() } },
      { upsert: true },
    );
  } else if (isSeed) {
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
