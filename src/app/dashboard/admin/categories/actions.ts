"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { hideItem, unhideItem } from "@/lib/hidden-items";

export async function toggleCategoryVisibilityAction(category: string, hidden: boolean) {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/categories" });

  if (hidden) {
    await unhideItem("category", category);
  } else {
    await hideItem("category", category);
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/vendors");
}
