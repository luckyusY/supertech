import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getVendorBySlug } from "@/lib/marketplace";
import { getPublicCategories, getPublicProducts } from "@/lib/public-marketplace";

type CatalogPageProps = {
  searchParams: Promise<{ category?: string; query?: string }>;
};

export const metadata: Metadata = {
  title: "Catalog - SuperTech",
  description: "Shop premium tech from verified sellers across home, mobile, audio, gaming, and wearables.",
};

export const dynamic = "force-dynamic";

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category, query } = await searchParams;
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
  ]);

  const selectedCategory = category && categories.includes(category) ? category : "All";

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const vendorName = getVendorBySlug(product.vendorSlug)?.name ?? product.vendorSlug;
    const haystack = [
      product.name,
      product.category,
      product.description,
      product.badge,
      vendorName,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const pageTitle =
    selectedCategory === "All" ? "Browse the catalog" : selectedCategory;
  const pageLabel = normalizedQuery
    ? `Search results for "${query?.trim() ?? ""}"`
    : selectedCategory === "All"
      ? "All products"
      : selectedCategory;

  return (
    <div className="page-shell py-5 sm:py-6">
      <div className="soft-card overflow-hidden">
        <div className="border-b border-[var(--line)] bg-white px-4 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {pageLabel}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.05em] text-[var(--foreground)] sm:text-4xl">
                {pageTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} matched your current filter.
              </p>
            </div>

            {normalizedQuery ? (
              <Link
                href={selectedCategory === "All" ? "/catalog" : `/catalog?category=${encodeURIComponent(selectedCategory)}`}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
              >
                Clear search
              </Link>
            ) : null}
          </div>
        </div>

        <div className="border-b border-[var(--line)] bg-[#fafafa] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="scroll-x items-center gap-2 pb-1">
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </span>
              <div className="mx-2 h-4 w-px shrink-0 bg-[var(--line)]" />
              {categories.map((item) => {
                const isActive = item === selectedCategory;
                const params = new URLSearchParams();

                if (item !== "All") {
                  params.set("category", item);
                }

                if (normalizedQuery) {
                  params.set("query", query?.trim() ?? "");
                }

                const href = params.size ? `/catalog?${params.toString()}` : "/catalog";

                return (
                  <Link
                    key={item}
                    href={href}
                    className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
                    }`}
                  >
                    {item}
                  </Link>
                );
              })}
            </div>

            {normalizedQuery ? (
              <div className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                <Search className="h-4 w-4 text-[var(--accent)]" />
                Showing results for <span className="font-semibold">{query?.trim()}</span>
              </div>
            ) : null}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-lg font-bold text-[var(--foreground)]">No products matched this filter.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Try another category or remove your search term.
            </p>
            <Link href="/catalog" className="mt-4 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
              View all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
