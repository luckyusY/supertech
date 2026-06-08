import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PenLine, Sparkles } from "lucide-react";
import { hasMongoConfig } from "@/lib/integrations";
import { getPublishedBlogs } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "SuperTech Blog — Product stories & buying guides",
  description:
    "Buying guides, product stories, and tips for shoppers in Kigali, Rwanda. Discover the best tech, beauty, and home products on SuperTech.",
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const blogs = hasMongoConfig() ? await getPublishedBlogs(60).catch(() => []) : [];

  return (
    <div className="marketplace-campaign-bg py-6 sm:py-10">
      <div className="page-shell">
        <div className="soft-card overflow-hidden">
          <div className="border-b border-[var(--line)] bg-[#fff8ef] p-5 sm:p-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              SuperTech Blog
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
              Product stories &amp; buying guides
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              SEO-optimized guides written for shoppers in Kigali and across Rwanda — find the
              right product and buy it from a verified SuperTech seller.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <PenLine className="h-8 w-8 text-[var(--muted)] opacity-40" />
              <p className="text-lg font-bold text-[var(--foreground)]">No articles published yet</p>
              <p className="max-w-md text-sm text-[var(--muted)]">
                Vendors and admins can generate an SEO blog for any product and publish it here.
              </p>
              <Link
                href="/blog/write"
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white"
              >
                <PenLine className="h-4 w-4" />
                Write a blog
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-[#f7f7f7]">
                    <Image
                      src={blog.heroImage}
                      alt={blog.productName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] shadow-sm">
                      {blog.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em] text-[var(--foreground)]">
                      {blog.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                      {blog.excerpt || blog.metaDescription}
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 text-xs text-[var(--muted)]">
                      <span className="font-semibold">{blog.vendorName}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]">
                        Read
                        <ArrowRight className="h-3 w-3 -translate-x-0.5 transition-transform group-hover:translate-x-0" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
