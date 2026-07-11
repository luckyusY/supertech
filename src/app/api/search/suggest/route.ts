import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceMode } from "@/lib/product-rules";
import {
  getPublicCategories,
  getPublicProducts,
  getPublicVendors,
} from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

const POPULAR_LIMIT = 6;
const SECTION_LIMIT = 5;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const [products, vendors, categories] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicVendors().catch(() => []),
    getPublicCategories().catch(() => [] as string[]),
  ]);

  if (!q) {
    return NextResponse.json({
      query: "",
      products: products.slice(0, POPULAR_LIMIT).map(toProductHit),
      vendors: vendors.slice(0, 4).map(toVendorHit),
      categories: categories
        .filter((c) => c !== "All")
        .slice(0, 6)
        .map((name) => ({
          name,
          href: `/catalog?category=${encodeURIComponent(name)}`,
          mode: getMarketplaceMode(name),
        })),
    });
  }

  const productHits = products
    .filter((product) => {
      const haystack = [
        product.name,
        product.category,
        product.badge,
        product.description,
        product.vendorSlug,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, SECTION_LIMIT)
    .map(toProductHit);

  const vendorHits = vendors
    .filter((vendor) => {
      const haystack = [vendor.name, vendor.headline, vendor.location, ...vendor.categories]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, SECTION_LIMIT)
    .map(toVendorHit);

  const categoryHits = categories
    .filter((name) => name !== "All" && name.toLowerCase().includes(q))
    .slice(0, SECTION_LIMIT)
    .map((name) => ({
      name,
      href: `/catalog?category=${encodeURIComponent(name)}`,
      mode: getMarketplaceMode(name),
    }));

  return NextResponse.json({
    query: q,
    products: productHits,
    vendors: vendorHits,
    categories: categoryHits,
  });
}

function toProductHit(product: {
  slug: string;
  name: string;
  category: string;
  price: number;
  heroImage: string;
  vendorSlug: string;
}) {
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    heroImage: product.heroImage,
    vendorSlug: product.vendorSlug,
    href: `/products/${product.slug}`,
    mode: getMarketplaceMode(product.category),
  };
}

function toVendorHit(vendor: {
  slug: string;
  name: string;
  headline: string;
  activeProducts: number;
}) {
  return {
    slug: vendor.slug,
    name: vendor.name,
    headline: vendor.headline,
    activeProducts: vendor.activeProducts,
    href: `/vendors/${vendor.slug}`,
  };
}
