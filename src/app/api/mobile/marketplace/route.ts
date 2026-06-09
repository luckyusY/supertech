import { NextResponse } from "next/server";
import {
  getPublicCategories,
  getPublicFeaturedProducts,
  getPublicProducts,
  getPublicTopVendors,
} from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

export async function GET() {
  const [products, featuredProducts, vendors, categories] = await Promise.all([
    getPublicProducts(),
    getPublicFeaturedProducts(),
    getPublicTopVendors(),
    getPublicCategories(),
  ]);

  return NextResponse.json({
    products: products.map((product) => ({
      slug: product.slug,
      name: product.name,
      category: product.category,
      badge: product.badge,
      description: product.description,
      price: product.price,
      stockLabel: product.stockLabel,
      shipWindow: product.shipWindow,
      accent: product.accent,
      heroImage: product.heroImage,
      features: product.features,
      vendorSlug: product.vendorSlug,
      featured: Boolean(product.featured),
    })),
    featuredProducts: featuredProducts.map((product) => product.slug),
    vendors: vendors.map((vendor) => ({
      slug: vendor.slug,
      name: vendor.name,
      headline: vendor.headline,
      location: vendor.location,
      responseTime: vendor.responseTime,
      rating: vendor.rating,
      reviewCount: vendor.reviewCount,
      accent: vendor.accent,
      categories: vendor.categories,
      activeProducts: vendor.activeProducts,
      fulfillmentRate: vendor.fulfillmentRate,
    })),
    categories,
  });
}
