import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { AiSearchBar } from "@/components/ai-search-bar";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
import { getVendorBySlug } from "@/lib/marketplace";
import { getMarketplaceMode, MODE_LABELS, type MarketplaceMode } from "@/lib/product-rules";
import { getPublicCategories, getPublicProducts } from "@/lib/public-marketplace";

type CatalogPageProps = {
  searchParams: Promise<{
    category?: string;
    query?: string;
    ai?: string;
    sort?: string;
    mode?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Catalog - SuperTech",
  description:
    "Shop verified products across tech, beauty, wellness, motors, and property on SuperTech.",
};

export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "newest", label: "Newest" },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]["id"];

function isSortId(value: string | undefined): value is SortId {
  return SORT_OPTIONS.some((option) => option.id === value);
}

function isMode(value: string | undefined): value is MarketplaceMode | "all" {
  return value === "all" || value === "shop" || value === "motors" || value === "property";
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category, query, ai, sort, mode } = await searchParams;
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const aiMode = ai === "1";
  const activeSort: SortId = isSortId(sort) ? sort : "popular";
  const activeMode: MarketplaceMode | "all" = isMode(mode) ? mode : "all";

  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
  ]);

  const selectedCategory = category && categories.includes(category) ? category : "All";

  let filteredProducts = products.filter((product) => {
    const productMode = getMarketplaceMode(product.category);
    const matchesMode = activeMode === "all" || productMode === activeMode;
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

    if (!matchesMode || !matchesCategory) {
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

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (activeSort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return b.id.localeCompare(a.id);
      case "popular":
      default:
        return b.reviewCount - a.reviewCount || b.rating - a.rating;
    }
  });

  const pageTitle =
    selectedCategory === "All"
      ? activeMode === "all"
        ? "Browse the catalog"
        : MODE_LABELS[activeMode]
      : selectedCategory;
  const pageLabel = normalizedQuery
    ? `Search results for "${query?.trim() ?? ""}"`
    : selectedCategory === "All"
      ? activeMode === "all"
        ? "All products"
        : `${MODE_LABELS[activeMode]} mode`
      : selectedCategory;

  function buildHref(overrides: {
    category?: string;
    query?: string;
    sort?: string;
    mode?: string;
    clearQuery?: boolean;
  }) {
    const params = new URLSearchParams();
    const nextCategory = overrides.category ?? (selectedCategory === "All" ? undefined : selectedCategory);
    const nextQuery = overrides.clearQuery
      ? undefined
      : (overrides.query ?? (normalizedQuery ? query?.trim() : undefined));
    const nextSort = overrides.sort ?? (activeSort === "popular" ? undefined : activeSort);
    const nextMode = overrides.mode ?? (activeMode === "all" ? undefined : activeMode);

    if (nextCategory && nextCategory !== "All") params.set("category", nextCategory);
    if (nextQuery) params.set("query", nextQuery);
    if (nextSort) params.set("sort", nextSort);
    if (nextMode && nextMode !== "all") params.set("mode", nextMode);
    if (aiMode) params.set("ai", "1");

    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  }

  return (
    <div className="py-5 sm:py-6">
      <div className="page-shell">
        <AiSearchBar initialQuery={aiMode ? query?.trim() ?? "" : ""} autoRun={aiMode} />
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
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} matched your current filter.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {normalizedQuery || selectedCategory !== "All" || activeMode !== "all" ? (
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Mode + sort command bar */}
          <div className="border-b border-[var(--line)] bg-[var(--neutral-50)] px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="scroll-x items-center gap-2">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "shop", label: "Shop" },
                    { id: "motors", label: "Motors" },
                    { id: "property", label: "Property" },
                  ] as const
                ).map((item) => {
                  const isActive = activeMode === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={buildHref({ mode: item.id, category: "All" })}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[var(--foreground)] text-white"
                          : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--accent)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Sort
                </span>
                {SORT_OPTIONS.map((option) => {
                  const isActive = activeSort === option.id;
                  return (
                    <Link
                      key={option.id}
                      href={buildHref({ sort: option.id })}
                      className={`rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-b border-[var(--line)] bg-[#fafafa] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="scroll-x items-center gap-2 pb-1">
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Category
                </span>
                <div className="mx-2 h-4 w-px shrink-0 bg-[var(--line)]" />
                {categories.map((item) => {
                  if (
                    activeMode !== "all" &&
                    item !== "All" &&
                    getMarketplaceMode(item) !== activeMode
                  ) {
                    return null;
                  }

                  const isActive = item === selectedCategory;
                  return (
                    <Link
                      key={item}
                      href={buildHref({ category: item })}
                      className={`shrink-0 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-semibold transition-colors ${
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
                <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
                  <Search className="h-4 w-4 text-[var(--accent)]" />
                  Showing results for <span className="font-semibold">{query?.trim()}</span>
                </div>
              ) : null}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-4 sm:p-6">
              <EmptyState
                icon={<PackageSearch className="h-6 w-6" />}
                title="No products matched this filter"
                description={
                  normalizedQuery
                    ? `We couldn’t find “${query?.trim()}”. Try another search — or request the product and SuperTech will help source it.`
                    : "Try another category or mode, or request a product that isn’t listed yet."
                }
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Link
                      href={
                        normalizedQuery
                          ? `/request-product?hint=${encodeURIComponent(query?.trim() ?? "")}`
                          : "/request-product"
                      }
                      className="inline-flex rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
                    >
                      Request this product
                    </Link>
                    <Link
                      href="/catalog"
                      className="inline-flex rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                    >
                      View all products
                    </Link>
                  </div>
                }
              />
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
    </div>
  );
}
