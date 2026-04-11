import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { getPublicCategories, getPublicProducts } from "@/lib/public-marketplace";

type CatalogPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse live marketplace inventory across approved sellers and seeded products.",
};

export const dynamic = "force-dynamic";

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
  ]);

  const selectedCategory = category && categories.includes(category) ? category : "All";
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <SectionHeading
            eyebrow="Marketplace catalog"
            title="Approved seller products now show up in the live storefront automatically."
            description="The catalog is no longer seed-only. Admin-approved seller submissions are merged into the customer-facing inventory alongside the original starter products."
          />
          <div className="min-w-[240px] rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Current view
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              {filteredProducts.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              products shown in {selectedCategory === "All" ? "all categories" : selectedCategory}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((item) => {
            const isActive = item === selectedCategory;
            const href =
              item === "All" ? "/catalog" : `/catalog?category=${encodeURIComponent(item)}`;

            return (
              <Link
                key={item}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[var(--foreground)] text-white"
                    : "border border-[var(--line)] bg-white/70 text-[var(--muted)]"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 rounded-[1.75rem] border border-[var(--line)] bg-white/72 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Next milestone
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              Add search, price sorting, and richer vendor storefront filters.
            </p>
          </div>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal)]"
          >
            View vendor directory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
