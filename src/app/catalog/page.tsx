import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getPublicCategories, getPublicProducts } from "@/lib/public-marketplace";

type CatalogPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export const metadata: Metadata = {
  title: "Catalog — SuperTech",
  description: "Shop premium tech from verified sellers across home, mobile, audio, gaming, and wearables.",
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
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="page-shell py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          {selectedCategory === "All" ? "All products" : selectedCategory}
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {selectedCategory === "All" ? "Browse the catalog" : selectedCategory}
          </h1>
          <p className="hidden text-sm text-[var(--muted)] sm:block">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </span>
        <div className="mx-2 h-4 w-px bg-[var(--line)]" />
        {categories.map((item) => {
          const isActive = item === selectedCategory;
          const href = item === "All" ? "/catalog" : `/catalog?category=${encodeURIComponent(item)}`;
          return (
            <Link
              key={item}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[var(--foreground)] text-white"
                  : "border border-[var(--line)] bg-white/80 text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {item}
            </Link>
          );
        })}
        <p className="ml-auto text-xs text-[var(--muted)] sm:hidden">
          {filteredProducts.length} items
        </p>
      </div>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="soft-card p-12 text-center">
          <p className="text-lg font-semibold">No products found in this category.</p>
          <Link href="/catalog" className="mt-4 inline-block text-sm text-[var(--teal)] hover:underline">
            Clear filter
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
