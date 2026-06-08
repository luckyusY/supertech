import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Store, Tag } from "lucide-react";
import { BlogContent } from "@/components/blog-content";
import { hasMongoConfig } from "@/lib/integrations";
import { getBlogBySlug } from "@/lib/blogs";
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
    </div>
  );
}
