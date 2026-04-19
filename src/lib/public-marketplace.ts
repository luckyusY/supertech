import { cache } from "react";
import { hasMongoConfig } from "@/lib/integrations";
import {
  getVendorBySlug as getSeedVendorBySlug,
  products as seedProducts,
  vendors as seedVendors,
  type Product,
  type Vendor,
} from "@/lib/marketplace";
import { getMongoVendors } from "@/lib/mongodb-vendors";
import { getProductSubmissions, type ProductSubmissionSummary } from "@/lib/product-submissions";
import { getHiddenSlugs } from "@/lib/hidden-items";

function mapApprovedSubmissionToProduct(submission: ProductSubmissionSummary): Product {
  const vendor = getSeedVendorBySlug(submission.vendorSlug);

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
    accent: vendor?.accent ?? "#102019",
    heroImage: submission.heroImage,
    gallery: submission.gallery.length > 0 ? submission.gallery : [submission.heroImage],
    features: submission.features,
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
  const [approvedProducts, hiddenSlugs] = await Promise.all([
    getApprovedSubmissions().then((s) => s.map(mapApprovedSubmissionToProduct)),
    getHiddenSlugs("product"),
  ]);
  const productMap = new Map<string, Product>();

  for (const product of seedProducts) {
    if (!hiddenSlugs.has(product.slug)) productMap.set(product.slug, product);
  }

  for (const product of approvedProducts) {
    if (!hiddenSlugs.has(product.slug)) productMap.set(product.slug, product);
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

export async function getPublicCategories() {
  const products = await getPublicProducts();

  return ["All", ...new Set(products.map((product) => product.category))];
}

export async function getPublicFeaturedProducts() {
  const approvedProducts = (await getApprovedSubmissions())
    .slice(0, 2)
    .map(mapApprovedSubmissionToProduct);
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
