import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/site-url";
import { getPublishedBlogs } from "@/lib/blogs";
import { hasMongoConfig } from "@/lib/integrations";
import {
  getPublicCategorySummaries,
  getPublicProducts,
  getPublicVendors,
} from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

const staticRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/catalog", priority: 0.95, changeFrequency: "daily" },
  { path: "/blog", priority: 0.85, changeFrequency: "daily" },
  { path: "/vendors", priority: 0.8, changeFrequency: "daily" },
  { path: "/request-product", priority: 0.6, changeFrequency: "weekly" },
  { path: "/become-vendor", priority: 0.55, changeFrequency: "weekly" },
  { path: "/track-order", priority: 0.4, changeFrequency: "monthly" },
  { path: "/phases", priority: 0.35, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, vendors, categories, blogs] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicVendors().catch(() => []),
    getPublicCategorySummaries().catch(() => []),
    hasMongoConfig() ? getPublishedBlogs(200).catch(() => []) : Promise.resolve([]),
  ]);

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: getAbsoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const category of categories) {
    if (category.hidden || category.productCount === 0) continue;

    routes.push({
      url: getAbsoluteUrl(`/catalog?category=${encodeURIComponent(category.name)}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    });
  }

  for (const product of products) {
    routes.push({
      url: getAbsoluteUrl(`/products/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: product.featured ? 0.9 : 0.8,
    });
  }

  for (const vendor of vendors) {
    routes.push({
      url: getAbsoluteUrl(`/vendors/${vendor.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    });
  }

  for (const blog of blogs) {
    routes.push({
      url: getAbsoluteUrl(`/blog/${blog.slug}`),
      lastModified: new Date(blog.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return routes;
}

