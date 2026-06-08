import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  MessageCircle,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { AppProductCard, AppRequestButton } from "@/components/app-product-card";
import {
  getPublicCategorySummaries,
  getPublicProducts,
  getPublicTopVendors,
} from "@/lib/public-marketplace";
import { formatCompactNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SuperTech App",
  description: "A mobile-first SuperTech marketplace experience.",
};

export default async function AppHomePage() {
  const [products, vendors, categories] = await Promise.all([
    getPublicProducts(),
    getPublicTopVendors(),
    getPublicCategorySummaries(),
  ]);

  const discountProducts = products
    .filter((product) => product.compareAt && product.compareAt > product.price)
    .slice(0, 8);
  const featuredProducts = (discountProducts.length > 0 ? discountProducts : products).slice(0, 8);
  const beautyProducts = products
    .filter((product) => product.category === "Beauty & Personal Care")
    .slice(0, 8);
  const heroProduct = featuredProducts[0] ?? products[0];
  const visibleCategories = categories
    .filter((category) => !category.hidden && category.productCount > 0)
    .slice(0, 8);

  return (
    <>
      <header className="app-safe-top sticky top-0 z-40 border-b border-black/6 bg-[#f3f6f2]/92 px-4 pb-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <Link href="/app" className="app-tap flex min-w-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="SuperTech"
              width={38}
              height={38}
              priority
              className="h-10 w-10 rounded-lg bg-white object-contain shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#66736b]">
                SuperTech
              </p>
              <h1 className="truncate text-lg font-black leading-5">Marketplace</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/track-order"
              className="app-tap grid h-10 w-10 place-items-center rounded-lg bg-white text-[#102019] shadow-sm"
              aria-label="Track order"
            >
              <PackageSearch className="h-5 w-5" />
            </Link>
            <Link
              href="/account"
              className="app-tap grid h-10 w-10 place-items-center rounded-lg bg-[#102019] text-white shadow-sm"
              aria-label="Account"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="overflow-hidden rounded-lg bg-[#102019] text-white shadow-[0_16px_42px_rgba(16,32,25,0.22)]">
          <div className="relative min-h-[19rem] p-4">
            {heroProduct ? (
              <Image
                src={heroProduct.heroImage}
                alt={heroProduct.name}
                fill
                priority
                className="object-cover opacity-40"
                sizes="448px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-[#102019]/72 via-[#102019]/58 to-[#102019]" />
            <div className="relative flex min-h-[17rem] flex-col justify-between">
              <div>
                <p className="inline-flex rounded bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#f4c95d]">
                  App shopping
                </p>
                <h2 className="mt-4 max-w-xs text-4xl font-black leading-10 tracking-[-0.04em]">
                  Faster shopping made for your phone.
                </h2>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/74">
                  Browse products, request items, track orders, and chat with vendors from one clean app home.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Products" value={formatCompactNumber(products.length)} />
                <MiniStat label="Vendors" value={formatCompactNumber(vendors.length)} />
                <MiniStat label="Support" value="AI" />
              </div>
            </div>
          </div>
        </section>

        <form action="/app/shop" className="grid grid-cols-[minmax(0,1fr)_52px] gap-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b746e]" />
            <input
              name="query"
              type="search"
              placeholder="Search products"
              className="h-12 w-full rounded-lg border border-black/10 bg-white pl-12 pr-4 text-sm font-semibold outline-none placeholder:text-[#8a948e]"
            />
          </label>
          <button
            type="submit"
            className="grid h-12 place-items-center rounded-lg bg-[#f68b1e] text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        <section className="grid grid-cols-4 gap-2">
          <QuickAction href="/app/shop" label="Shop" icon={Search} />
          <QuickAction href="/app/vendors" label="Vendors" icon={Store} />
          <QuickAction href="/request-product" label="Request" icon={Sparkles} />
          <QuickAction href="/app/track" label="Track" icon={Truck} />
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b746e]">
                Start here
              </p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">
                Three ways to buy
              </h2>
            </div>
            <AppRequestButton />
          </div>
          <div className="mt-3 grid gap-2">
            <AppStep icon={Search} title="Find a product" text="Search or browse category shelves." />
            <AppStep icon={MessageCircle} title="Chat with seller" text="Ask questions directly on WhatsApp." />
            <AppStep icon={PackageSearch} title="Track request" text="Use your request ID and email anytime." />
          </div>
        </section>

        {visibleCategories.length > 0 ? (
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b746e]">
                  Categories
                </p>
                <h2 className="text-xl font-black tracking-[-0.03em]">Browse by lane</h2>
              </div>
                <Link href="/app/shop" className="text-sm font-black text-[#f68b1e]">
                All
              </Link>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/app/shop?category=${encodeURIComponent(category.name)}`}
                  className="app-tap min-w-[9rem] rounded-lg border border-black/10 bg-white p-3 shadow-sm"
                >
                  <p className="line-clamp-2 min-h-10 text-sm font-black leading-5">
                    {category.name}
                  </p>
                  <p className="mt-3 text-xs font-bold text-[#6b746e]">
                    {category.productCount} items
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featuredProducts.length > 0 ? (
          <ProductShelf
            title="Today in the app"
            eyebrow="Recommended"
            href="/app/shop"
            products={featuredProducts}
          />
        ) : null}

        {beautyProducts.length > 0 ? (
          <ProductShelf
            title="Beauty picks"
            eyebrow="Popular shelf"
            href="/app/shop?category=Beauty+%26+Personal+Care"
            products={beautyProducts}
          />
        ) : null}

        {vendors.length > 0 ? (
          <section className="rounded-lg bg-[#102019] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/58">
                  Official stores
                </p>
                <h2 className="text-xl font-black tracking-[-0.03em]">
                  Trusted vendors
                </h2>
              </div>
              <Link href="/app/vendors" className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-3 grid gap-2">
              {vendors.slice(0, 3).map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.slug}`}
                  className="app-tap flex items-center gap-3 rounded-lg bg-white/10 p-3"
                >
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-sm font-black text-white"
                    style={{ backgroundColor: vendor.accent }}
                  >
                    {vendor.logoMark}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{vendor.name}</p>
                    <p className="truncate text-xs text-white/62">
                      {vendor.activeProducts} products
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[#f4c95d]" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-2">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/58">
        {label}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Search;
}) {
  return (
    <Link
      href={href}
      className="app-tap flex min-w-0 flex-col items-center gap-2 rounded-lg border border-black/10 bg-white p-3 shadow-sm"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff4e5] text-[#f68b1e]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="truncate text-xs font-black">{label}</span>
    </Link>
  );
}

function AppStep({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Search;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#f3f6f2] p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#102019]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-black">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#6b746e]">{text}</p>
      </div>
    </div>
  );
}

function ProductShelf({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Awaited<ReturnType<typeof getPublicProducts>>;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6b746e]">
            {eyebrow}
          </p>
          <h2 className="text-xl font-black tracking-[-0.03em]">{title}</h2>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-black text-[#f68b1e]">
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="w-44 shrink-0">
            <AppProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
