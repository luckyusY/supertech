import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { hasMongoConfig } from "@/lib/integrations";
import { PRODUCT_LISTING_CATEGORIES } from "@/lib/product-listing-options";

const COLLECTION = "custom_categories";

export interface CustomCategory {
  name: string;
  /** Set when this entry renames a built-in category. */
  replacesBuiltIn?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCustomCategories(): Promise<CustomCategory[]> {
  if (!hasMongoConfig()) return [];
  try {
    const db = await getDatabase();
    return await db.collection<CustomCategory>(COLLECTION).find().sort({ name: 1 }).toArray();
  } catch {
    return [];
  }
}

export async function createCustomCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name is required.");

  const builtIns = PRODUCT_LISTING_CATEGORIES as readonly string[];
  if (builtIns.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error(`"${trimmed}" already exists as a built-in category.`);
  }

  const db = await getDatabase();
  const existing = await db
    .collection<CustomCategory>(COLLECTION)
    .findOne({ name: { $regex: new RegExp(`^${trimmed}$`, "i") } });
  if (existing) throw new Error(`Category "${trimmed}" already exists.`);

  await db.collection<CustomCategory>(COLLECTION).insertOne({
    name: trimmed,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function renameCategory(oldName: string, newName: string) {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Category name is required.");
  if (trimmed === oldName) return;

  const db = await getDatabase();
  const builtIns = PRODUCT_LISTING_CATEGORIES as readonly string[];

  if (builtIns.includes(oldName)) {
    // Store an override entry so the new name replaces the built-in in all lists
    await db.collection<CustomCategory>(COLLECTION).updateOne(
      { replacesBuiltIn: oldName },
      {
        $set: { name: trimmed, replacesBuiltIn: oldName, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  } else {
    await db
      .collection<CustomCategory>(COLLECTION)
      .updateOne({ name: oldName }, { $set: { name: trimmed, updatedAt: new Date() } });
  }

  // Keep product submissions consistent with the new name
  await db
    .collection("product_submissions")
    .updateMany({ category: oldName }, { $set: { category: trimmed, updatedAt: new Date() } });

  // Keep hidden_items consistent
  await db
    .collection("hidden_items")
    .updateMany({ type: "category", slug: oldName }, { $set: { slug: trimmed } });
}
