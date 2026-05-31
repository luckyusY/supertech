import "server-only";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import type { Vendor } from "@/lib/marketplace";
import { resolveWhatsAppNumber } from "@/lib/whatsapp";
import {
  DEFAULT_MOMO_BUSINESS_NAME,
  DEFAULT_MOMO_MERCHANT_CODE,
} from "@/lib/payment-methods";

export type MongoVendor = Omit<Vendor, "id"> & { email: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createMongoVendor(input: {
  businessName: string;
  email: string;
  location: string;
  category: string;
  description: string;
  whatsappNumber: string;
}): Promise<{ slug: string }> {
  const db = await getDatabase();

  // Generate a unique slug
  const base = slugify(input.businessName);
  let slug = base;
  let attempt = 1;
  while (await db.collection<MongoVendor>("vendors").findOne({ slug })) {
    slug = `${base}-${attempt++}`;
  }

  const vendor: MongoVendor = {
    slug,
    email: input.email.trim().toLowerCase(),
    name: input.businessName.trim(),
    headline: input.description.trim().slice(0, 120),
    location: input.location.trim(),
    responseTime: "Within 24 hours",
    rating: 0,
    reviewCount: 0,
    accent: "#102019",
    coverImage: "",
    logoMark: "",
    whatsappNumber: resolveWhatsAppNumber(input.whatsappNumber),
    categories: [input.category],
    activeProducts: 0,
    fulfillmentRate: "—",
    joined: new Date().toISOString().slice(0, 7),
    momoMerchantCode: DEFAULT_MOMO_MERCHANT_CODE,
    momoBusinessName: DEFAULT_MOMO_BUSINESS_NAME,
  };

  await db.collection<MongoVendor>("vendors").insertOne(vendor);
  return { slug };
}

export async function getMongoVendorBySlug(slug: string): Promise<Vendor | null> {
  if (!hasMongoConfig()) return null;
  try {
    const db = await getDatabase();
    const doc = await db.collection<MongoVendor>("vendors").findOne({ slug });
    if (!doc) return null;
    return {
      id: doc.slug,
      slug: doc.slug,
      name: doc.name,
      headline: doc.headline,
      location: doc.location,
      responseTime: doc.responseTime,
      rating: doc.rating,
      reviewCount: doc.reviewCount,
      accent: doc.accent,
      coverImage: doc.coverImage,
      logoMark: doc.logoMark,
      whatsappNumber: doc.whatsappNumber,
      categories: doc.categories,
      activeProducts: doc.activeProducts,
      fulfillmentRate: doc.fulfillmentRate,
      joined: doc.joined,
      momoMerchantCode: doc.momoMerchantCode,
      momoBusinessName: doc.momoBusinessName,
    };
  } catch {
    return null;
  }
}

export async function updateMongoVendorProfile(
  slug: string,
  input: {
    coverImage?: string;
    logoMark?: string;
    headline?: string;
    momoMerchantCode?: string;
    momoBusinessName?: string;
  },
): Promise<Vendor | null> {
  if (!hasMongoConfig()) return null;
  const db = await getDatabase();

  const set: Partial<MongoVendor> = {};
  if (typeof input.coverImage === "string") {
    set.coverImage = input.coverImage.trim();
  }
  if (typeof input.logoMark === "string") {
    set.logoMark = input.logoMark.trim().slice(0, 3);
  }
  if (typeof input.headline === "string") {
    set.headline = input.headline.trim().slice(0, 160);
  }
  if (typeof input.momoMerchantCode === "string") {
    // Keep digits only — MoMoPay merchant codes are numeric.
    set.momoMerchantCode =
      input.momoMerchantCode.replace(/[^\d]/g, "").slice(0, 12) ||
      DEFAULT_MOMO_MERCHANT_CODE;
  }
  if (typeof input.momoBusinessName === "string") {
    set.momoBusinessName =
      input.momoBusinessName.trim().slice(0, 60) || DEFAULT_MOMO_BUSINESS_NAME;
  }

  if (Object.keys(set).length === 0) {
    return getMongoVendorBySlug(slug);
  }

  const doc = await db
    .collection<MongoVendor>("vendors")
    .findOneAndUpdate({ slug }, { $set: set }, { returnDocument: "after" });

  if (!doc) return null;

  return {
    id: doc.slug,
    slug: doc.slug,
    name: doc.name,
    headline: doc.headline,
    location: doc.location,
    responseTime: doc.responseTime,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    accent: doc.accent,
    coverImage: doc.coverImage,
    logoMark: doc.logoMark,
    whatsappNumber: doc.whatsappNumber,
    categories: doc.categories,
    activeProducts: doc.activeProducts,
    fulfillmentRate: doc.fulfillmentRate,
    joined: doc.joined,
    momoMerchantCode: doc.momoMerchantCode,
    momoBusinessName: doc.momoBusinessName,
  };
}

export async function deleteMongoVendor(slug: string): Promise<void> {
  const db = await getDatabase();
  const result = await db.collection<MongoVendor>("vendors").deleteOne({ slug });
  if (result.deletedCount === 0) {
    throw new Error("Vendor not found.");
  }
}

export async function getMongoVendors(): Promise<Vendor[]> {
  if (!hasMongoConfig()) return [];
  try {
    const db = await getDatabase();
    const docs = await db.collection<MongoVendor>("vendors").find().toArray();
    return docs.map((doc) => ({
      id: doc.slug,
      slug: doc.slug,
      name: doc.name,
      headline: doc.headline,
      location: doc.location,
      responseTime: doc.responseTime,
      rating: doc.rating,
      reviewCount: doc.reviewCount,
      accent: doc.accent,
      coverImage: doc.coverImage,
      logoMark: doc.logoMark,
      whatsappNumber: doc.whatsappNumber,
      categories: doc.categories,
      activeProducts: doc.activeProducts,
      fulfillmentRate: doc.fulfillmentRate,
      joined: doc.joined,
      momoMerchantCode: doc.momoMerchantCode,
      momoBusinessName: doc.momoBusinessName,
    }));
  } catch {
    return [];
  }
}
