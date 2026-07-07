import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { VendorBlogStudio } from "@/components/vendor-blog-studio";
import { getBlogActivityForVendor, getBlogsForVendor } from "@/lib/blogs";
import { hasMongoConfig } from "@/lib/integrations";
import { getPublicVendorProducts } from "@/lib/public-marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "AI SEO Studio — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorAiPage() {
  const { currentVendor } = await loadVendorContext("/dashboard/vendor/ai");

  const [vendorProducts, publishedBlogs, blogActivity] = await Promise.all([
    getPublicVendorProducts(currentVendor.slug).catch(() => []),
    hasMongoConfig() ? getBlogsForVendor(currentVendor.slug, 20).catch(() => []) : Promise.resolve([]),
    hasMongoConfig()
      ? getBlogActivityForVendor(currentVendor.slug).catch(() => ({
          total: 0,
          today: 0,
          last7Days: 0,
          daily: [],
        }))
      : Promise.resolve({ total: 0, today: 0, last7Days: 0, daily: [] }),
  ]);

  const blogStudioProducts = vendorProducts.slice(0, 24).map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    heroImage: product.heroImage,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Sparkles}
        eyebrow="Marketing"
        title="AI SEO Studio"
        description="Generate Google-ready blog articles for your products to attract shoppers in Kigali and across Rwanda."
      />

      <div className="mt-6">
        <VendorBlogStudio products={blogStudioProducts} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Blogs today", value: blogActivity.today },
          { label: "Last 7 days", value: blogActivity.last7Days },
          { label: "Total published", value: blogActivity.total },
        ].map((item) => (
          <div key={item.label} className="soft-card p-5">
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{item.value}</p>
          </div>
        ))}
      </div>

      {blogActivity.daily.length > 0 ? (
        <div className="mt-4 soft-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.04em]">Daily blog activity</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Track how many product stories were published each day.
              </p>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              Recent 7 days
            </span>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {blogActivity.daily.map((day) => {
              const height = Math.max(12, Math.min(88, day.count * 18));
              const label = new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "short",
              });
              return (
                <div key={day.date} className="flex min-w-0 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end justify-center rounded-xl bg-[rgba(15,23,42,0.04)] px-1 pb-1">
                    <div
                      className="w-full rounded-lg bg-[var(--accent)]"
                      style={{ height }}
                      aria-label={`${day.count} blogs on ${day.date}`}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">{label}</p>
                  <p className="text-xs font-bold">{day.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Published blogs */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-[-0.04em]">Your published blogs</h2>
        {publishedBlogs.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No published blogs yet. Pick a product above and publish your first SEO article.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {publishedBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                target="_blank"
                className="group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white p-3 transition-shadow hover:shadow-md"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">
                  <Image src={blog.heroImage} alt={blog.productName} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{blog.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)]">
                    {blog.metaDescription || blog.excerpt}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
