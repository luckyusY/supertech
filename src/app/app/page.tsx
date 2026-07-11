import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  PackageSearch,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  User,
} from "lucide-react";
import { AppProductCard, AppRequestButton } from "@/components/app-product-card";
import { CategoryIconTile, HeroDecor } from "@/components/app-graphics";
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
      <header className="app-safe-top sticky top-0 z-[var(--z-sticky)] border-b border-[var(--line)] bg-[var(--background)]/92 px-4 pb-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <Link href="/app" className="app-tap flex min-w-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="SuperTech"
              width={38}
              height={38}
              priority
              className="h-10 w-10 rounded-[var(--radius-md)] bg-white object-contain shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                SuperTech
              </p>
              <h1 className="truncate text-lg font-bold leading-5 tracking-[-0.03em]">
                Marketplace
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/app/track"
              className="app-tap grid h-10 w-10 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
              aria-label="Track order"
            >
              <PackageSearch className="h-5 w-5" />
            </Link>
            <Link
              href="/account"
              className="app-tap grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--foreground)] text-white shadow-sm"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 py-4">
        <section className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--background-strong)] text-white shadow-[var(--elevation-3)]">
          <div className="relative min-h-[17rem] p-5">
            {heroProduct ? (
              <Image
                src={heroProduct.heroImage}
                alt=""
                fill
                priority
                className="object-cover opacity-30"
                sizes="448px"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-[var(--background-strong)]" />
            <HeroDecor />
            <div className="relative flex min-h-[15rem] flex-col justify-between">
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Verified marketplace
                </p>
                <h2 className="mt-3 max-w-xs text-3xl font-bold leading-9 tracking-[-0.04em]">
                  Shop, request, and track on your phone.
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">
                  Browse verified sellers, request missing items, and follow order status.
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href="/app/shop"
                    className="app-tap inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 text-sm font-bold text-white"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Shop now
                  </Link>
                  <Link
                    href="/request-product"
                    className="app-tap inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-sm)] border border-white/24 bg-white/10 px-4 text-sm font-bold text-white"
                  >
                    Request item
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Products" value={formatCompactNumber(products.length)} />
                <MiniStat label="Vendors" value={formatCompactNumber(vendors.length)} />
                <MiniStat label="Track" value="Live" />
              </div>
            </div>
          </div>
        </section>

        <form action="/app/shop" className="grid grid-cols-[minmax(0,1fr)_52px] gap-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
            <input
              name="query"
              type="search"
              placeholder="Search products"
              className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] pl-12 pr-4 text-sm font-semibold shadow-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
            />
          </label>
          <button
            type="submit"
            className="app-tap grid h-12 place-items-center rounded-[var(--radius-md)] bg-[var(--accent)] text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        <section className="grid grid-cols-4 gap-2">
          <QuickAction href="/app/shop" label="Shop" icon={ShoppingBag} />
          <QuickAction href="/app/vendors" label="Vendors" icon={Store} />
          <QuickAction href="/request-product" label="Request" icon={Sparkles} />
          <QuickAction href="/app/track" label="Track" icon={Truck} />
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--elevation-1)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                How it works
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.03em]">Three ways to buy</h2>
            </div>
            <AppRequestButton />
          </div>
          <div className="mt-4 grid gap-2">
            <AppStep
              step={1}
              icon={Search}
              title="Find a product"
              text="Search or browse category shelves."
            />
            <AppStep
              step={2}
              icon={MessageCircle}
              title="Request or chat"
              text="Request an order or message the seller on WhatsApp."
            />
            <AppStep
              step={3}
              icon={PackageSearch}
              title="Track status"
              text="Follow your request ID anytime."
            />
          </div>
        </section>

        {visibleCategories.length > 0 ? (
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Categories
                </p>
                <h2 className="text-xl font-bold tracking-[-0.03em]">Browse by lane</h2>
              </div>
              <Link
                href="/app/shop"
                className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)]"
              >
                All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/app/shop?category=${encodeURIComponent(category.name)}`}
                  className="app-tap min-w-[9.5rem] rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm"
                >
                  <CategoryIconTile name={category.name} />
                  <p className="mt-3 line-clamp-2 min-h-10 text-sm font-bold leading-5">
                    {category.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
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

        <section className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--accent)] p-5 text-white shadow-[var(--elevation-2)]">
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              Can&apos;t find it?
            </p>
            <h2 className="mt-1 max-w-[15rem] text-2xl font-bold leading-7 tracking-[-0.03em]">
              Request any product and we help source it.
            </h2>
            <Link
              href="/request-product"
              className="app-tap mt-4 inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-white px-4 text-sm font-bold text-[var(--accent)]"
            >
              Request now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {beautyProducts.length > 0 ? (
          <ProductShelf
            title="Beauty picks"
            eyebrow="Popular shelf"
            href="/app/shop?category=Beauty+%26+Personal+Care"
            products={beautyProducts}
          />
        ) : null}

        {vendors.length > 0 ? (
          <section className="rounded-[var(--radius-lg)] bg-[var(--background-strong)] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  Official stores
                </p>
                <h2 className="text-xl font-bold tracking-[-0.03em]">Trusted vendors</h2>
              </div>
              <Link
                href="/app/vendors"
                className="app-tap grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-white/10"
                aria-label="All vendors"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-3 grid gap-2">
              {vendors.slice(0, 3).map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.slug}`}
                  className="app-tap flex items-center gap-3 rounded-[var(--radius-md)] bg-white/10 p-3"
                >
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] text-sm font-bold text-white"
                    style={{ backgroundColor: vendor.accent }}
                  >
                    {vendor.logoMark}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{vendor.name}</p>
                    <p className="truncate text-xs text-white/62">
                      {vendor.activeProducts} products
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
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
    <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/10 p-2.5 backdrop-blur">
      <p className="text-lg font-bold">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/58">
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
      className="app-tap flex min-w-0 flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm"
    >
      <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="truncate text-xs font-bold">{label}</span>
    </Link>
  );
}

function AppStep({
  step,
  icon: Icon,
  title,
  text,
}: {
  step: number;
  icon: typeof Search;
  title: string;
  text: string;
}) {
  return (
    <div className="relative flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--neutral-50)] p-3">
      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--foreground)] text-[10px] font-bold text-white">
          {step}
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{text}</p>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {eyebrow}
          </p>
          <h2 className="text-xl font-bold tracking-[-0.03em]">{title}</h2>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)]"
        >
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
