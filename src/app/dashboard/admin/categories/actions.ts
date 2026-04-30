"use server";

import { revalidatePath } from "next/cache";
import { requirePageSession } from "@/lib/auth";
import { hideItem, unhideItem } from "@/lib/hidden-items";
import { createCustomCategory, renameCategory } from "@/lib/mongodb-categories";

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

export async function createCategoryAction(name: string): Promise<{ error?: string } | void> {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/categories" });

  try {
    await createCustomCategory(name);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create category." };
  }

  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
}

export async function renameCategoryAction(
  oldName: string,
  newName: string,
): Promise<{ error?: string } | void> {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/categories" });

  try {
    await renameCategory(oldName, newName);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to rename category." };
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/vendors");
}
