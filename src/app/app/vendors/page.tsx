import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, ShieldCheck, Star } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { getPublicVendors } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

type AppVendorsPageProps = {
  searchParams: Promise<{ query?: string }>;
};

export default async function AppVendorsPage({ searchParams }: AppVendorsPageProps) {
  const { query = "" } = await searchParams;
  const vendors = await getPublicVendors();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredVendors = normalizedQuery
    ? vendors.filter((vendor) =>
        [vendor.name, vendor.headline, vendor.location, ...vendor.categories]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : vendors;

  return (
    <>
      <AppHeader
        eyebrow="Official stores"
        title="Vendors"
        subtitle={`${filteredVendors.length} verified sellers`}
      />
      <main className="mx-auto max-w-md space-y-3 px-3 py-3 sm:px-4 sm:py-4">
        <form action="/app/vendors" className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            name="query"
            type="search"
            defaultValue={query}
            placeholder="Search verified vendors"
            className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-white pl-12 pr-4 text-sm font-semibold outline-none focus:border-[var(--accent)]"
          />
        </form>

        {filteredVendors.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white p-6 text-center">
            <p className="font-bold">No vendors match this search</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Try a store name, location, or category.</p>
          </div>
        ) : null}

        {filteredVendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.slug}`}
            className="app-tap block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-white shadow-[var(--elevation-1)]"
          >
            <div className="relative h-32">
              <Image src={vendor.coverImage} alt={vendor.name} fill className="object-cover" sizes="448px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/62 to-transparent" />
              <div
                className="absolute bottom-3 left-3 grid h-12 w-12 place-items-center rounded-lg text-sm font-black text-white"
                style={{ backgroundColor: vendor.accent }}
              >
                {vendor.logoMark}
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-black">{vendor.name}</h2>
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#f68b1e]" />
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#66736b]">
                  {vendor.headline}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#66736b]">
                  <Star className="h-3.5 w-3.5 fill-[#f4c95d] text-[#f4c95d]" />
                  {vendor.rating.toFixed(1)} | {vendor.activeProducts} products
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#66736b]" />
            </div>
          </Link>
        ))}
      </main>
    </>
  );
}
