import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AppProductCard } from "@/components/app-product-card";
import { getVendorBySlug } from "@/lib/marketplace";
import { getPublicCategories, getPublicProducts } from "@/lib/public-marketplace";

type AppShopPageProps = {
  searchParams: Promise<{ category?: string; query?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AppShopPage({ searchParams }: AppShopPageProps) {
  const { category, query } = await searchParams;
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const [products, categories] = await Promise.all([getPublicProducts(), getPublicCategories()]);
  const selectedCategory = category && categories.includes(category) ? category : "All";
  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "All" && product.category !== selectedCategory) return false;
    if (!normalizedQuery) return true;
    const vendorName = getVendorBySlug(product.vendorSlug)?.name ?? product.vendorSlug;
    return [product.name, product.category, product.description, product.badge, vendorName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <>
      <AppHeader
        eyebrow="SuperTech App"
        title="Shop"
        subtitle={`${filteredProducts.length} products`}
      />
      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <form action="/app/shop" className="grid grid-cols-[minmax(0,1fr)_52px] gap-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
            <input
              name="query"
              type="search"
              defaultValue={query?.trim() ?? ""}
              placeholder="Search products"
              className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] pl-12 pr-4 text-sm font-semibold outline-none focus:border-[var(--accent)]"
            />
          </label>
          <button
            className="grid h-12 place-items-center rounded-[var(--radius-md)] bg-[var(--accent)] text-white"
            type="submit"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--muted)]">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </span>
          {categories.map((item) => {
            const params = new URLSearchParams();
            if (item !== "All") params.set("category", item);
            if (query?.trim()) params.set("query", query.trim());
            const href = params.size ? `/app/shop?${params.toString()}` : "/app/shop";
            const active = selectedCategory === item;
            return (
              <Link
                key={item}
                href={href}
                className={`app-tap shrink-0 rounded-[var(--radius-sm)] px-3 py-2 text-xs font-bold ${
                  active
                    ? "bg-[var(--foreground)] text-white"
                    : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--line)]"
                }`}
              >
                {item}
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
            <p className="text-lg font-bold">No matches yet</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Try another search or request the product.
            </p>
            <Link
              href={
                query?.trim()
                  ? `/request-product?hint=${encodeURIComponent(query.trim())}`
                  : "/request-product"
              }
              className="mt-4 inline-flex rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white"
            >
              Request item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <AppProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
