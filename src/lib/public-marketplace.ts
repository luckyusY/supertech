import { cache } from "react";
import { hasMongoConfig } from "@/lib/integrations";
import {
  categoryHighlights,
  getVendorBySlug as getSeedVendorBySlug,
  products as seedProducts,
  vendors as seedVendors,
  type Product,
  type Vendor,
} from "@/lib/marketplace";
import { getCustomCategories } from "@/lib/mongodb-categories";
import { getMongoVendors } from "@/lib/mongodb-vendors";
import { PRODUCT_LISTING_CATEGORIES } from "@/lib/product-listing-options";
import { getProductSubmissions, type ProductSubmissionSummary } from "@/lib/product-submissions";
import { getHiddenSlugs } from "@/lib/hidden-items";
import {
  getMongoProducts,
  isSeedSynced,
  getDeletedSeedSlugs,
} from "@/lib/mongodb-products";

export type PublicCategorySummary = {
  name: string;
  productCount: number;
  vendorCount: number;
  hidden: boolean;
};

function mapApprovedSubmissionToProduct(
  submission: ProductSubmissionSummary,
  vendor?: Vendor,
): Product {
  const sourceVendor = vendor ?? getSeedVendorBySlug(submission.vendorSlug);

  return {
    id: `approved-${submission.id}`,
    slug: submission.slug,
    vendorSlug: submission.vendorSlug,
    name: submission.name,
    category: submission.category,
    badge: submission.badge,
    description: submission.description,
    price: submission.price,
    compareAt: submission.compareAt,
    rating: 0,
    reviewCount: 0,
    stockLabel: submission.stockLabel,
    shipWindow: submission.shipWindow,
    accent: sourceVendor?.accent ?? "#102019",
    heroImage: submission.heroImage,
    gallery: submission.gallery.length > 0 ? submission.gallery : [submission.heroImage],
    features: submission.features,
    vendorWhatsAppNumber: sourceVendor?.whatsappNumber,
    featured: false,
  };
}

const getApprovedSubmissions = cache(async () => {
  if (!hasMongoConfig()) {
    return [] as ProductSubmissionSummary[];
  }

  try {
    return await getProductSubmissions({
      status: "approved",
      limit: 100,
    });
  } catch {
    return [] as ProductSubmissionSummary[];
  }
});

/**
 * Check whether seed data has been pushed to MongoDB.
 * When synced, we read products from the `products` collection
 * instead of the hardcoded arrays — so deletes are permanent.
 */
const checkSeedSynced = cache(async () => {
  return isSeedSynced();
});

export const getPublicProducts = cache(async () => {
  const synced = await checkSeedSynced();

  const [
    approvedSubmissions,
    hiddenProductSlugs,
    hiddenVendorSlugs,
    mongoVendors,
    mongoProducts,
  ] = await Promise.all([
    getApprovedSubmissions(),
    getHiddenSlugs("product"),
    getHiddenSlugs("vendor"),
    getMongoVendors(),
    synced ? getMongoProducts() : Promise.resolve([]),
  ]);

  const vendorMap = new Map<string, Vendor>();
  const productMap = new Map<string, Product>();

  for (const vendor of [...seedVendors, ...mongoVendors]) {
    vendorMap.set(vendor.slug, vendor);
  }

  if (synced) {
    // ── Synced mode: MongoDB is the source of truth for seed products ──
    // Products that were deleted from MongoDB are simply gone — no need
    // to check hidden_items for them.
    for (const product of mongoProducts) {
      if (!hiddenProductSlugs.has(product.slug) && !hiddenVendorSlugs.has(product.vendorSlug)) {
        productMap.set(product.slug, product);
      }
    }
  } else {
    // ── Legacy mode: read from hardcoded seed arrays + hidden_items ──
    for (const product of seedProducts) {
      if (!hiddenProductSlugs.has(product.slug) && !hiddenVendorSlugs.has(product.vendorSlug)) {
        productMap.set(product.slug, product);
      }
    }
  }

  // Always merge approved vendor submissions on top
  const approvedProducts = approvedSubmissions.map((submission) =>
    mapApprovedSubmissionToProduct(submission, vendorMap.get(submission.vendorSlug)),
  );

  for (const product of approvedProducts) {
    if (!hiddenProductSlugs.has(product.slug) && !hiddenVendorSlugs.has(product.vendorSlug)) {
      productMap.set(product.slug, product);
    }
  }

  return Array.from(productMap.values());
});

export async function getPublicProductBySlug(slug: string) {
  const products = await getPublicProducts();

  return products.find((product) => product.slug === slug);
}

export async function getPublicVendorProducts(vendorSlug: string) {
  const products = await getPublicProducts();

  return products.filter((product) => product.vendorSlug === vendorSlug);
}

export const getPublicVendors = cache(async () => {
  const synced = await checkSeedSynced();
  const [approvedSubmissions, mongoVendors, hiddenSlugs, deletedVendorSlugs] = await Promise.all([
    getApprovedSubmissions(),
    getMongoVendors(),
    getHiddenSlugs("vendor"),
    synced ? getDeletedSeedSlugs("vendor") : Promise.resolve(new Set<string>()),
  ]);

  const vendorMap = new Map<string, Vendor>();

  if (synced) {
    // Synced mode: MongoDB vendors are the source of truth
    for (const v of mongoVendors) {
      if (!hiddenSlugs.has(v.slug)) {
        vendorMap.set(v.slug, v);
      }
    }
  } else {
    // Legacy mode: start with seed vendors, merge mongo vendors
    for (const v of seedVendors) {
      if (!hiddenSlugs.has(v.slug)) {
        vendorMap.set(v.slug, v);
      }
    }
    const seedSlugs = new Set(seedVendors.map((v) => v.slug));
    for (const v of mongoVendors) {
      if (!seedSlugs.has(v.slug) && !hiddenSlugs.has(v.slug)) {
        vendorMap.set(v.slug, v);
      }
    }
  }

  // Enrich with approved submission counts
  for (const [slug, vendor] of vendorMap) {
    const approvedForVendor = approvedSubmissions.filter(
      (s) => s.vendorSlug === slug,
    );
    if (approvedForVendor.length > 0) {
      const categories = new Set([
        ...vendor.categories,
        ...approvedForVendor.map((s) => s.category),
      ]);
      vendorMap.set(slug, {
        ...vendor,
        activeProducts: vendor.activeProducts + approvedForVendor.length,
        categories: Array.from(categories),
      });
    }
  }

  return Array.from(vendorMap.values());
});

export async function getPublicVendorBySlug(slug: string) {
  const vendors = await getPublicVendors();

  return vendors.find((vendor) => vendor.slug === slug);
}

export const getPublicCategorySummaries = cache(async () => {
  const [products, vendors, hiddenCategories, customCats] = await Promise.all([
    getPublicProducts(),
    getPublicVendors(),
    getHiddenSlugs("category"),
    getCustomCategories(),
  ]);

  // Build a map: builtIn original name → display name (for renames)
  const builtInToDisplay = new Map<string, string>();
  for (const cat of customCats) {
    if (cat.replacesBuiltIn) {
      builtInToDisplay.set(cat.replacesBuiltIn, cat.name);
    }
  }

  // Full ordered category list: built-ins (with renames applied) + admin-added extras
  const allCategoryNames: string[] = [];
  for (const builtIn of PRODUCT_LISTING_CATEGORIES) {
    allCategoryNames.push(builtInToDisplay.get(builtIn) ?? builtIn);
  }
  for (const cat of customCats) {
    if (!cat.replacesBuiltIn && !allCategoryNames.includes(cat.name)) {
      allCategoryNames.push(cat.name);
    }
  }

  // Count products — seed products may still use the old built-in name, map them to display name
  const productCountByCategory = new Map<string, number>(
    allCategoryNames.map((name) => [name, 0]),
  );
  for (const product of products) {
    const displayName = builtInToDisplay.get(product.category) ?? product.category;
    if (productCountByCategory.has(displayName)) {
      productCountByCategory.set(displayName, (productCountByCategory.get(displayName) ?? 0) + 1);
    }
  }

  return allCategoryNames.map((name) => ({
    name,
    productCount: productCountByCategory.get(name) ?? 0,
    vendorCount: vendors.filter((vendor) => vendor.categories.includes(name)).length,
    hidden: hiddenCategories.has(name),
  })) satisfies PublicCategorySummary[];
});

export async function getPublicCategories() {
  const categories = await getPublicCategorySummaries();

  return ["All", ...categories.filter((category) => !category.hidden).map((category) => category.name)];
}

export async function getProductListingCategories() {
  const categories = await getPublicCategorySummaries().catch(() => []);
  return categories.map((c) => c.name);
}

export async function getPublicFeaturedProducts() {
  const [approvedSubmissions, mongoVendors] = await Promise.all([
    getApprovedSubmissions(),
    getMongoVendors(),
  ]);
  const vendorMap = new Map<string, Vendor>();

  for (const vendor of [...seedVendors, ...mongoVendors]) {
    vendorMap.set(vendor.slug, vendor);
  }

  const approvedProducts = approvedSubmissions
    .slice(0, 2)
    .map((submission) =>
      mapApprovedSubmissionToProduct(submission, vendorMap.get(submission.vendorSlug)),
    );

  // Use full public products list for featured selection (respects synced mode)
  const allProducts = await getPublicProducts();
  const featuredMap = new Map<string, Product>();

  for (const product of approvedProducts) {
    featuredMap.set(product.slug, product);
  }

  for (const product of allProducts) {
    if (product.featured && !featuredMap.has(product.slug)) {
      featuredMap.set(product.slug, product);
    }
  }

  return Array.from(featuredMap.values()).slice(0, 8);
}

export async function getPublicTopVendors() {
  const vendors = await getPublicVendors();

  return vendors.slice(0, 4);
}

export async function getAdminVendors() {
  const synced = await checkSeedSynced();
  const [mongoVendors, hiddenSlugs] = await Promise.all([
    getMongoVendors(),
    getHiddenSlugs("vendor"),
  ]);

  if (synced) {
    // In synced mode, all vendors live in MongoDB
    return mongoVendors.map((v) => ({
      ...v,
      isSeed: false as const,
      disabled: hiddenSlugs.has(v.slug),
    }));
  }

  // Legacy mode
  const seedSlugs = new Set(seedVendors.map((v) => v.slug));
  return [
    ...seedVendors.map((v) => ({ ...v, isSeed: true as const, disabled: hiddenSlugs.has(v.slug) })),
    ...mongoVendors
      .filter((v) => !seedSlugs.has(v.slug))
      .map((v) => ({ ...v, isSeed: false as const, disabled: false })),
  ];
}

export async function getAdminProductHiddenSlugs() {
  return getHiddenSlugs("product");
}

export async function getAdminSeedSyncStatus() {
  return checkSeedSynced();
}
