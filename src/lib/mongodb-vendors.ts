import "server-only";
import { hasMongoConfig } from "@/lib/integrations";
import { getDatabase } from "@/lib/mongodb";
import type { Vendor } from "@/lib/marketplace";

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
    categories: [input.category],
    activeProducts: 0,
    fulfillmentRate: "—",
    joined: new Date().toISOString().slice(0, 7),
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
      categories: doc.categories,
      activeProducts: doc.activeProducts,
      fulfillmentRate: doc.fulfillmentRate,
      joined: doc.joined,
    };
  } catch {
    return null;
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
      categories: doc.categories,
      activeProducts: doc.activeProducts,
      fulfillmentRate: doc.fulfillmentRate,
      joined: doc.joined,
    }));
  } catch {
    return [];
  }
}
