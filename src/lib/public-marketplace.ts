import { cache } from "react";
import { hasMongoConfig } from "@/lib/integrations";
import {
  getVendorBySlug as getSeedVendorBySlug,
  products as seedProducts,
  vendors as seedVendors,
  type Product,
  type Vendor,
} from "@/lib/marketplace";
import { getCustomCategories } from "@/lib/mongodb-categories";
import { getMongoVendors } from "@/lib/mongodb-vendors";
import { PRODUCT_LISTING_CATEGORIES } from "@/lib/product-listing-options";
import {
  getProductSubmissionBySlug,
  getProductSubmissions,
  type ProductSubmissionSummary,
} from "@/lib/product-submissions";
import { getHiddenSlugs } from "@/lib/hidden-items";

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

export const getPublicProducts = cache(async () => {
  const [approvedSubmissions, hiddenProductSlugs, hiddenVendorSlugs, mongoVendors] = await Promise.all([
    getApprovedSubmissions(),
    getHiddenSlugs("product"),
    getHiddenSlugs("vendor"),
    getMongoVendors(),
  ]);
  const vendorMap = new Map<string, Vendor>();
  const productMap = new Map<string, Product>();

  for (const vendor of [...seedVendors, ...mongoVendors]) {
    vendorMap.set(vendor.slug, vendor);
  }

  for (const product of seedProducts) {
    if (!hiddenProductSlugs.has(product.slug) && !hiddenVendorSlugs.has(product.vendorSlug)) {
      productMap.set(product.slug, product);
    }
  }

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
  const listedProduct = products.find((product) => product.slug === slug);

  if (listedProduct) {
    return listedProduct;
  }

  if (!hasMongoConfig()) {
    return undefined;
  }

  try {
    const [submission, hiddenProductSlugs, hiddenVendorSlugs, mongoVendors] = await Promise.all([
      getProductSubmissionBySlug(slug, "approved"),
      getHiddenSlugs("product"),
      getHiddenSlugs("vendor"),
      getMongoVendors(),
    ]);

    if (
      !submission ||
      hiddenProductSlugs.has(submission.slug) ||
      hiddenVendorSlugs.has(submission.vendorSlug)
    ) {
      return undefined;
    }

    const vendor = [...seedVendors, ...mongoVendors].find(
      (item) => item.slug === submission.vendorSlug,
    );

    return mapApprovedSubmissionToProduct(submission, vendor);
  } catch {
    return undefined;
  }
}

export async function getPublicVendorProducts(vendorSlug: string) {
  const products = await getPublicProducts();

  return products.filter((product) => product.vendorSlug === vendorSlug);
}

export const getPublicVendors = cache(async () => {
  const [approvedSubmissions, mongoVendors, hiddenSlugs] = await Promise.all([
    getApprovedSubmissions(),
    getMongoVendors(),
    getHiddenSlugs("vendor"),
  ]);

  const seedWithSubmissions = seedVendors.filter((v) => !hiddenSlugs.has(v.slug)).map((vendor) => {
    const approvedForVendor = approvedSubmissions.filter(
      (submission) => submission.vendorSlug === vendor.slug,
    );
    const categories = new Set([
      ...vendor.categories,
      ...approvedForVendor.map((submission) => submission.category),
    ]);

    return {
      ...vendor,
      activeProducts: vendor.activeProducts + approvedForVendor.length,
      categories: Array.from(categories),
    } satisfies Vendor;
  });

  // Merge MongoDB-created vendors (approved applications), excluding seed slugs and hidden ones
  const seedSlugs = new Set(seedVendors.map((v) => v.slug));
  const newVendors = mongoVendors.filter((v) => !seedSlugs.has(v.slug) && !hiddenSlugs.has(v.slug));

  return [...seedWithSubmissions, ...newVendors];
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
  const featuredSeedProducts = seedProducts.filter((product) => product.featured);
  const featuredMap = new Map<string, Product>();

  for (const product of approvedProducts) {
    featuredMap.set(product.slug, product);
  }

  for (const product of featuredSeedProducts) {
    if (!featuredMap.has(product.slug)) {
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
  const [mongoVendors, hiddenSlugs] = await Promise.all([
    getMongoVendors(),
    getHiddenSlugs("vendor"),
  ]);
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
