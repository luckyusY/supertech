"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, PenLine, Search, Sparkles } from "lucide-react";

export type BlogStudioProduct = {
  slug: string;
  name: string;
  category: string;
  heroImage: string;
};

type VendorBlogStudioProps = {
  products: BlogStudioProduct[];
};

export function VendorBlogStudio({ products }: VendorBlogStudioProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(products[0]?.slug ?? "");

  const hasProducts = products.length > 0;

  return (
    <section className="soft-card overflow-hidden">
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[#b45309] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-44 w-44 rounded-full bg-white/5" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
            <Sparkles className="h-4 w-4" />
            AI SEO Studio
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
            Write an SEO blog for your products
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
            Pick a product and generate a search-optimized article — complete with meta title,
            description, slug, and keywords — to rank on Google and pull shoppers to your store.
          </p>

          {hasProducts ? (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <select
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  className="h-11 w-full appearance-none rounded-md border border-white/30 bg-white pl-10 pr-4 text-sm font-medium text-[var(--foreground)] outline-none"
                >
                  {products.map((product) => (
                    <option key={product.slug} value={product.slug}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  router.push(`/blog/write?product=${encodeURIComponent(selected)}`)
                }
                disabled={!selected}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--foreground)] px-5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
              >
                <PenLine className="h-4 w-4" />
                Write SEO blog
              </button>
            </div>
          ) : (
            <p className="mt-5 inline-flex rounded-md bg-white/15 px-4 py-2 text-sm font-medium text-white">
              Get a product approved first — then generate SEO blogs for it here.
            </p>
          )}
        </div>
      </div>

      {hasProducts ? (
        <div className="scroll-x gap-3 p-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/blog/write?product=${encodeURIComponent(product.slug)}`}
              className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-white transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-[#f7f7f7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.heroImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {product.category}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-[var(--foreground)]">
                  {product.name}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
                  Write blog
                  <ArrowRight className="h-3 w-3 -translate-x-0.5 transition-transform group-hover:translate-x-0" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
