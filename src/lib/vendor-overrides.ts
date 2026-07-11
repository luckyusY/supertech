import "server-only";

import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import type { Vendor } from "@/lib/marketplace";
import { resolveWhatsAppNumber } from "@/lib/whatsapp";

const COLLECTION = "vendor_overrides";

export type VendorOverride = {
  slug: string;
  name?: string;
  headline?: string;
  location?: string;
  whatsappNumber?: string;
  categories?: string[];
  coverImage?: string;
  logoMark?: string;
  accent?: string;
  responseTime?: string;
  momoMerchantCode?: string;
  momoBusinessName?: string;
  updatedAt?: Date;
  updatedBy?: string;
};

export async function getVendorOverride(slug: string): Promise<VendorOverride | null> {
  if (!hasMongoConfig()) return null;
  try {
    const db = await getDatabase();
    const doc = await db.collection<VendorOverride>(COLLECTION).findOne({ slug });
    return doc ?? null;
  } catch {
    return null;
  }
}

export async function getVendorOverridesMap(
  slugs: string[],
): Promise<Map<string, VendorOverride>> {
  const map = new Map<string, VendorOverride>();
  if (!hasMongoConfig() || slugs.length === 0) return map;
  try {
    const db = await getDatabase();
    const docs = await db
      .collection<VendorOverride>(COLLECTION)
      .find({ slug: { $in: slugs } })
      .toArray();
    for (const doc of docs) {
      map.set(doc.slug, doc);
    }
  } catch {
    // ignore
  }
  return map;
}

export async function upsertVendorOverride(
  slug: string,
  input: Omit<VendorOverride, "slug" | "updatedAt"> & { updatedBy?: string },
): Promise<VendorOverride> {
  const db = await getDatabase();
  const set: VendorOverride = {
    slug,
    updatedAt: new Date(),
    updatedBy: input.updatedBy,
  };

  if (typeof input.name === "string") set.name = input.name.trim().slice(0, 80);
  if (typeof input.headline === "string") set.headline = input.headline.trim().slice(0, 160);
  if (typeof input.location === "string") set.location = input.location.trim().slice(0, 80);
  if (typeof input.whatsappNumber === "string") {
    set.whatsappNumber = resolveWhatsAppNumber(input.whatsappNumber);
  }
  if (Array.isArray(input.categories)) {
    set.categories = Array.from(
      new Set(input.categories.map((c) => c.trim()).filter(Boolean)),
    ).slice(0, 8);
  }
  if (typeof input.coverImage === "string") set.coverImage = input.coverImage.trim();
  if (typeof input.logoMark === "string") set.logoMark = input.logoMark.trim().slice(0, 3);
  if (typeof input.accent === "string") set.accent = input.accent.trim().slice(0, 20);
  if (typeof input.responseTime === "string") {
    set.responseTime = input.responseTime.trim().slice(0, 40);
  }
  if (typeof input.momoMerchantCode === "string") {
    set.momoMerchantCode = input.momoMerchantCode.replace(/[^\d]/g, "").slice(0, 12);
  }
  if (typeof input.momoBusinessName === "string") {
    set.momoBusinessName = input.momoBusinessName.trim().slice(0, 60);
  }

  await db.collection<VendorOverride>(COLLECTION).updateOne(
    { slug },
    { $set: set },
    { upsert: true },
  );

  return (await getVendorOverride(slug)) ?? set;
}

export function mergeVendorWithOverride<T extends Vendor>(
  vendor: T,
  override: VendorOverride | null | undefined,
): T {
  if (!override) return vendor;
  return {
    ...vendor,
    name: override.name ?? vendor.name,
    headline: override.headline ?? vendor.headline,
    location: override.location ?? vendor.location,
    whatsappNumber: override.whatsappNumber ?? vendor.whatsappNumber,
    categories: override.categories ?? vendor.categories,
    coverImage: override.coverImage ?? vendor.coverImage,
    logoMark: override.logoMark ?? vendor.logoMark,
    accent: override.accent ?? vendor.accent,
    responseTime: override.responseTime ?? vendor.responseTime,
    momoMerchantCode: override.momoMerchantCode ?? vendor.momoMerchantCode,
    momoBusinessName: override.momoBusinessName ?? vendor.momoBusinessName,
  };
}
