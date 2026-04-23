import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { hasMongoConfig } from "@/lib/integrations";

type HiddenItemType = "product" | "vendor" | "category";

interface HiddenItem {
  type: HiddenItemType;
  slug: string;
}

const COLLECTION = "hidden_items";

export async function hideItem(type: HiddenItemType, slug: string) {
  const db = await getDatabase();
  await db.collection<HiddenItem>(COLLECTION).updateOne(
    { type, slug },
    { $set: { type, slug } },
    { upsert: true },
  );
}

export async function unhideItem(type: HiddenItemType, slug: string) {
  const db = await getDatabase();
  await db.collection<HiddenItem>(COLLECTION).deleteOne({ type, slug });
}

export async function getHiddenSlugs(type: HiddenItemType): Promise<Set<string>> {
  if (!hasMongoConfig()) return new Set();
  try {
    const db = await getDatabase();
    const docs = await db.collection<HiddenItem>(COLLECTION).find({ type }).toArray();
    return new Set(docs.map((d) => d.slug));
  } catch {
    return new Set();
  }
}
