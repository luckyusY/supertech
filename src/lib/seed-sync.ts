import "server-only";
import { products as seedProducts, vendors as seedVendors } from "@/lib/marketplace";
import { syncSeedProducts, markSeedSynced, getDeletedSeedSlugs } from "@/lib/mongodb-products";
import { getDatabase } from "@/lib/mongodb";
import type { Vendor } from "@/lib/marketplace";

type MongoVendorDoc = Omit<Vendor, "id"> & { source: "seed" | "application" };

/* ── Sync seed vendors → MongoDB ─────────────────────────────────────── */

async function syncSeedVendors(
  vendors: Vendor[],
): Promise<{ inserted: number; skipped: number }> {
  const db = await getDatabase();
  const deletedSlugs = await getDeletedSeedSlugs("vendor");

  let inserted = 0;
  let skipped = 0;

  for (const vendor of vendors) {
    if (deletedSlugs.has(vendor.slug)) {
      skipped++;
      continue;
    }

    const { id, ...rest } = vendor;
    const result = await db
      .collection<MongoVendorDoc>("vendors")
      .updateOne(
        { slug: vendor.slug },
        { $setOnInsert: { ...rest, source: "seed" as const } },
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

/* ── Full seed sync ──────────────────────────────────────────────────── */

export type SeedSyncResult = {
  products: { inserted: number; skipped: number };
  vendors: { inserted: number; skipped: number };
};

export async function runSeedSync(): Promise<SeedSyncResult> {
  const [productResult, vendorResult] = await Promise.all([
    syncSeedProducts(seedProducts),
    syncSeedVendors(seedVendors),
  ]);

  await markSeedSynced();

  return {
    products: productResult,
    vendors: vendorResult,
  };
}
