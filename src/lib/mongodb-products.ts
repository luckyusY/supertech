import "server-only";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import type { Product } from "@/lib/marketplace";

export type MongoProduct = Product & { source: "seed" | "submission" };

const COLLECTION = "products";
const DELETED_SEEDS = "deleted_seeds";

/* ── Read ────────────────────────────────────────────────────────────── */

export async function getMongoProducts(): Promise<Product[]> {
  if (!hasMongoConfig()) return [];
  try {
    const db = await getDatabase();
    const docs = await db.collection<MongoProduct>(COLLECTION).find().toArray();
    return docs.map(({ _id, source, ...rest }) => rest as Product);
  } catch {
    return [];
  }
}

export async function getMongoProductBySlug(slug: string): Promise<Product | null> {
  if (!hasMongoConfig()) return null;
  try {
    const db = await getDatabase();
    const doc = await db.collection<MongoProduct>(COLLECTION).findOne({ slug });
    if (!doc) return null;
    const { _id, source, ...rest } = doc;
    return rest as Product;
  } catch {
    return null;
  }
}

/* ── Delete (permanent) ──────────────────────────────────────────────── */

export async function deleteMongoProduct(slug: string): Promise<void> {
  const db = await getDatabase();
  await db.collection<MongoProduct>(COLLECTION).deleteOne({ slug });
  // Record the slug so a future re-sync will NOT re-insert it
  await db.collection(DELETED_SEEDS).updateOne(
    { type: "product", slug },
    { $set: { type: "product", slug, deletedAt: new Date() } },
    { upsert: true },
  );
}

/* ── Deleted-seed tracking ───────────────────────────────────────────── */

export async function getDeletedSeedSlugs(
  type: "product" | "vendor",
): Promise<Set<string>> {
  if (!hasMongoConfig()) return new Set();
  try {
    const db = await getDatabase();
    const docs = await db.collection(DELETED_SEEDS).find({ type }).toArray();
    return new Set(docs.map((d) => d.slug as string));
  } catch {
    return new Set();
  }
}

/* ── Seed sync flag ──────────────────────────────────────────────────── */

export async function isSeedSynced(): Promise<boolean> {
  if (!hasMongoConfig()) return false;
  try {
    const db = await getDatabase();
    const flag = await db.collection("config").findOne({ key: "seed_synced" });
    return !!flag;
  } catch {
    return false;
  }
}

export async function markSeedSynced(): Promise<void> {
  const db = await getDatabase();
  await db.collection("config").updateOne(
    { key: "seed_synced" },
    { $set: { key: "seed_synced", syncedAt: new Date() } },
    { upsert: true },
  );
}

/* ── Sync seed products → MongoDB ────────────────────────────────────── */

export async function syncSeedProducts(
  products: Product[],
): Promise<{ inserted: number; skipped: number }> {
  const db = await getDatabase();
  const deletedSlugs = await getDeletedSeedSlugs("product");

  let inserted = 0;
  let skipped = 0;

  for (const product of products) {
    if (deletedSlugs.has(product.slug)) {
      skipped++;
      continue;
    }

    const result = await db
      .collection<MongoProduct>(COLLECTION)
      .updateOne(
        { slug: product.slug },
        { $setOnInsert: { ...product, source: "seed" as const } },
        { upsert: true },
      );

    if (result.upsertedCount > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return { inserted, skipped };
}
