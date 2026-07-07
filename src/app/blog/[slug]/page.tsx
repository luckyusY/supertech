import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, PenLine, Store, Tag } from "lucide-react";
import { BlogContent } from "@/components/blog-content";
import { ProductCard } from "@/components/product-card";
import { hasMongoConfig } from "@/lib/integrations";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/blogs";
import { getPublicProducts } from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadBlog(slug: string) {
  if (!hasMongoConfig()) return null;
  return getBlogBySlug(slug).catch(() => null);
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await loadBlog(slug);

  if (!blog) {
    return { title: "Blog post not found" };
  }

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.keywords,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      type: "article",
      images: blog.heroImage ? [{ url: blog.heroImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: blog.heroImage ? [blog.heroImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const blog = await loadBlog(slug);

  if (!blog) {
    notFound();
  }

  // Related products (same category, excluding the featured product) + related blogs.
  const [allProducts, relatedBlogs] = await Promise.all([
    getPublicProducts().catch(() => []),
    getRelatedBlogs(blog.slug, blog.category, 3).catch(() => []),
  ]);

  const relatedProducts = allProducts
    .filter(
      (product) => product.category === blog.category && product.slug !== blog.productSlug,
    )
    .slice(0, 5);

  const publishedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const galleryImages = blog.gallery.length > 0 ? blog.gallery : [blog.heroImage];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.heroImage ? [blog.heroImage] : undefined,
    datePublished: new Date(blog.createdAt).toISOString(),
    dateModified: new Date(blog.updatedAt).toISOString(),
    author: { "@type": "Organization", name: blog.vendorName },
    publisher: { "@type": "Organization", name: "SuperTech Marketplace" },
    keywords: blog.keywords.join(", "),
  };

  return (
    <div className="bg-[var(--background)] py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
        >
          ← All articles
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-semibold text-[var(--accent)]">
            <Tag className="h-3 w-3" />
            {blog.category}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5" />
            {blog.vendorName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {publishedDate}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
          {blog.title}
        </h1>
        {blog.excerpt ? (
          <p className="mt-3 text-lg leading-8 text-[var(--muted)]">{blog.excerpt}</p>
        ) : null}

        {/* Hero product image */}
        <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl bg-[#f7f7f7]">
          <Image
            src={blog.heroImage}
            alt={blog.productName}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>

        {/* Article body */}
        <BlogContent markdown={blog.body} />

        {/* Real product image gallery */}
        {galleryImages.length > 1 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold tracking-[-0.02em]">Product gallery</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-[#f7f7f7]"
                >
                  <Image
                    src={image}
                    alt={`${blog.productName} photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 240px, 45vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Buy CTA */}
        <aside className="mt-10 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7]">
              <Image src={blog.heroImage} alt={blog.productName} fill className="object-cover" sizes="96px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Featured product
              </p>
              <p className="mt-1 text-lg font-bold tracking-[-0.02em]">{blog.productName}</p>
              <p className="mt-0.5 text-xl font-black text-[var(--accent)]">{formatPrice(blog.price)}</p>
            </div>
            <Link
              href={`/products/${blog.productSlug}`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        {blog.keywords.length ? (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--line)] pt-6">
            {blog.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]"
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      {/* Related products */}
      {relatedProducts.length > 0 ? (
        <section className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-black tracking-[-0.03em] text-[var(--foreground)] sm:text-2xl">
              Related products in {blog.category}
            </h2>
            <Link
              href={`/catalog?category=${encodeURIComponent(blog.category)}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              See all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Related blogs */}
      {relatedBlogs.length > 0 ? (
        <section className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-black tracking-[-0.03em] text-[var(--foreground)] sm:text-2xl">
              More blogs to read
            </h2>
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              All articles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/10] bg-[#f7f7f7]">
                  <Image
                    src={related.heroImage}
                    alt={related.productName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-[var(--foreground)]">
                    {related.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                    {related.excerpt || related.metaDescription}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                    Read article
                    <ArrowRight className="h-3 w-3 -translate-x-0.5 transition-transform group-hover:translate-x-0" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-5 py-6 text-center">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Selling on SuperTech? Turn your products into SEO blogs.
            </p>
            <Link
              href="/blog/write"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              <PenLine className="h-4 w-4" />
              Write a blog
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
