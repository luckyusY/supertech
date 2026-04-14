import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Gamepad2,
  Headphones,
  Home as HomeIcon,
  MapPin,
  Monitor,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Watch,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { VendorCard } from "@/components/vendor-card";
import { categoryHighlights } from "@/lib/marketplace";
import {
  getPublicFeaturedProducts,
  getPublicProducts,
  getPublicTopVendors,
  getPublicVendors,
} from "@/lib/public-marketplace";
import { formatCompactNumber, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const trustBadges = [
  {
    icon: Truck,
    title: "Fast delivery",
    desc: "Same-day dispatch on orders placed before 2 PM.",
  },
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    desc: "Every vendor is reviewed before the storefront goes live.",
  },
  {
    icon: Star,
    title: "Curated catalog",
    desc: "Premium-first products across home, audio, gaming, and mobile.",
  },
  {
    icon: Headphones,
    title: "Live support",
    desc: "Real humans are available Monday through Saturday.",
  },
] as const;

const marketSignals = [
  {
    icon: ShieldCheck,
    title: "Reviewed storefronts",
    desc: "Every seller is screened before launch, with quality and fulfillment checks.",
  },
  {
    icon: Truck,
    title: "City-ready logistics",
    desc: "Mix products from multiple vendors and still keep the order flow easy to track.",
  },
  {
    icon: TrendingUp,
    title: "Built for repeat buyers",
    desc: "The experience stays fast from discovery to order tracking and support.",
  },
] as const;

const featurePills = [
  { icon: ShieldCheck, label: "Verified storefronts" },
  { icon: Truck, label: "Same-city delivery" },
  { icon: Headphones, label: "Live support" },
] as const;

const categoryIcons: Record<string, typeof HomeIcon> = {
  "Home Control": HomeIcon,
  "Mobile Essentials": Smartphone,
  "Creator Gear": Monitor,
  Gaming: Gamepad2,
  Audio: Headphones,
  Wearables: Watch,
};

const categoryStyles = {
  "Home Control": {
    iconSurface: "rgba(228, 90, 54, 0.14)",
    iconColor: "#e45a36",
    glow: "rgba(228, 90, 54, 0.18)",
  },
  "Mobile Essentials": {
    iconSurface: "rgba(26, 123, 112, 0.14)",
    iconColor: "#1a7b70",
    glow: "rgba(26, 123, 112, 0.18)",
  },
  "Creator Gear": {
    iconSurface: "rgba(17, 33, 28, 0.14)",
    iconColor: "#11211c",
    glow: "rgba(17, 33, 28, 0.18)",
  },
  Gaming: {
    iconSurface: "rgba(242, 191, 99, 0.18)",
    iconColor: "#a65d11",
    glow: "rgba(242, 191, 99, 0.2)",
  },
  Audio: {
    iconSurface: "rgba(91, 58, 140, 0.14)",
    iconColor: "#5b3a8c",
    glow: "rgba(91, 58, 140, 0.18)",
  },
  Wearables: {
    iconSurface: "rgba(26, 92, 123, 0.14)",
    iconColor: "#1a5c7b",
    glow: "rgba(26, 92, 123, 0.18)",
  },
} as const;

export default async function Home() {
  const [featuredProducts, topVendors, publicProducts, publicVendors] = await Promise.all([
    getPublicFeaturedProducts(),
    getPublicTopVendors(),
    getPublicProducts(),
    getPublicVendors(),
  ]);

  const averageFulfillment = publicVendors.length
    ? publicVendors.reduce(
        (total, vendor) => total + Number.parseFloat(vendor.fulfillmentRate),
        0,
      ) / publicVendors.length
    : 0;

  const heroStats = [
    {
      icon: Package,
      value: formatCompactNumber(publicProducts.length),
      label: "live products",
      note: "Curated instead of crowded.",
    },
    {
      icon: ShieldCheck,
      value: formatCompactNumber(publicVendors.length),
      label: "verified sellers",
      note: "Reviewed before launch.",
    },
    {
      icon: TrendingUp,
      value: `${averageFulfillment.toFixed(1)}%`,
      label: "avg. fulfillment",
      note: "Across active vendors.",
    },
  ] as const;

  const liveLocations = new Set(publicVendors.map((vendor) => vendor.location)).size;
  const liveCategories = new Set(publicProducts.map((product) => product.category)).size;
  const showcaseProduct = featuredProducts[0];
  const secondaryProduct = featuredProducts[1];

  return (
    <div className="pb-20 sm:pb-0">
      <section className="page-shell pt-5 pb-4 sm:pt-8 sm:pb-6">
        <div className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(135deg,#091528_0%,#11203f_55%,#102a43_100%)] px-5 py-10 text-white shadow-[0_30px_100px_rgba(9,21,40,0.35)] sm:rounded-[2.4rem] sm:px-10 sm:py-14 lg:px-16 lg:py-[4.5rem]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-12 h-56 w-56 rounded-full bg-[rgba(37,99,235,0.22)] blur-[72px]" />
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[rgba(8,145,178,0.18)] blur-[86px]" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[rgba(245,158,11,0.12)] blur-[86px]" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "2.75rem 2.75rem",
              }}
            />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_420px] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Verified marketplace across East and West Africa
              </span>

              <h1 className="mt-5 text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-[4.7rem]">
                Premium tech,
                <br className="hidden sm:block" /> delivered with confidence.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Shop trusted sellers across home tech, mobile, audio, gaming, and
                wearables with a storefront that feels curated from the first click.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {featurePills.map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3.5 py-2 text-xs font-medium text-white/80"
                  >
                    <pill.icon className="h-3.5 w-3.5 text-white/70" />
                    {pill.label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(37,99,235,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[rgba(37,99,235,0.5)]"
                >
                  Shop the catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/vendors"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                >
                  Browse sellers
                </Link>
              </div>

              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.35rem] border border-white/10 bg-white/7 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2 text-white/60">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                        <stat.icon className="h-4 w-4" />
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em]">
                        {stat.label}
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-white/55">{stat.note}</p>
                  </div>
                ))}
              </dl>
            </div>

            {showcaseProduct ? (
              <div className="hidden lg:flex lg:flex-col lg:gap-3">
                <div className="overflow-hidden rounded-[1.7rem] border border-white/12 bg-white/8 p-3 shadow-2xl shadow-black/25 backdrop-blur-md">
                  <div className="relative aspect-[4/3.2] overflow-hidden rounded-[1.35rem]">
                    <Image
                      src={showcaseProduct.heroImage}
                      alt={showcaseProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="440px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <span
                      className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: showcaseProduct.accent }}
                    >
                      {showcaseProduct.badge}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                        {showcaseProduct.category}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {showcaseProduct.name}
                      </h2>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-white/72">
                        {showcaseProduct.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 px-1 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                          Starting at
                        </p>
                        <p className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-[var(--gold)]">
                          {formatPrice(showcaseProduct.price)}
                        </p>
                      </div>
                      <Link
                        href={`/products/${showcaseProduct.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-transform hover:-translate-y-0.5"
                      >
                        View product
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                          Shipping
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white/90">
                          {showcaseProduct.shipWindow}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                          Availability
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white/90">
                          {showcaseProduct.stockLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
                  {secondaryProduct ? (
                    <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-white/7 px-3.5 py-3 backdrop-blur-sm">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.85rem]">
                        <Image
                          src={secondaryProduct.heroImage}
                          alt={secondaryProduct.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {secondaryProduct.name}
                        </p>
                        <p className="text-[11px] text-white/50">
                          {secondaryProduct.category}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-[var(--gold)]">
                        {formatPrice(secondaryProduct.price)}
                      </p>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="rounded-[1.2rem] border border-white/10 bg-white/7 px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
                      <MapPin className="h-3.5 w-3.5" />
                      Marketplace reach
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-semibold tracking-[-0.04em] text-white">
                          {liveLocations}
                        </p>
                        <p className="text-xs text-white/55">
                          live cities and {liveCategories} core categories
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden border-y border-[var(--line)] bg-white/60 py-3 backdrop-blur-sm">
        <div className="marquee-track flex gap-0 whitespace-nowrap">
          {[...Array(3)]
            .flatMap(() => [
              "Home Control",
              "Mobile Essentials",
              "Creator Gear",
              "Gaming",
              "Audio",
              "Wearables",
              "Free Delivery",
              "Verified Sellers",
              "Same-Day Dispatch",
            ])
            .map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex shrink-0 items-center gap-4 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
              >
                <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                {item}
              </span>
            ))}
        </div>
      </div>

      <section className="page-shell py-5 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="rounded-[1.45rem] border border-[var(--line)] bg-white/78 px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[rgba(37,99,235,0.08)]">
                <badge.icon className="h-[18px] w-[18px] text-[var(--accent)]" />
              </span>
              <p className="mt-4 text-sm font-semibold tracking-[-0.02em]">
                {badge.title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-4 sm:py-6">
        <div className="soft-card overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--accent)]">
                Handpicked for you
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">
                Featured products
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                A tight edit of the catalog, chosen for standout quality, fast fulfillment,
                and everyday usefulness.
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--teal)] transition-all hover:bg-[rgba(8,145,178,0.06)] sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div className="mt-5 sm:hidden">
            <Link
              href="/catalog"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] py-3 text-sm font-semibold transition-colors hover:bg-white/60"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell py-4 sm:py-6">
        <div className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">
            Browse by category
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">
            Shop your lane
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Explore focused product lanes that feel more like curated shelves than endless
            catalog pages.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryHighlights.map((category) => {
            const Icon = categoryIcons[category.name] ?? HomeIcon;
            const style =
              categoryStyles[category.name as keyof typeof categoryStyles] ??
              categoryStyles["Home Control"];

            return (
              <Link
                key={category.name}
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="group relative flex min-h-[235px] flex-col overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: category.accent }}
                />
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: style.glow, opacity: 0.6 }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-[1rem]"
                    style={{ backgroundColor: style.iconSurface }}
                  >
                    <Icon className="h-5 w-5" style={{ color: style.iconColor }} />
                  </div>
                  <span className="rounded-full border border-[var(--line)] bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {category.count} products
                  </span>
                </div>

                <div className="relative mt-6 flex flex-1 flex-col">
                  <h3 className="text-xl font-semibold tracking-[-0.03em]">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {category.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal)] transition-all group-hover:gap-3">
                      Shop now
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      Curated lane
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-shell py-4 sm:py-6">
        <div className="soft-card overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">
                Our sellers
              </p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">
                Meet the vendors
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                These are the storefronts powering the marketplace right now, each with its
                own specialty and fulfillment rhythm.
              </p>
            </div>
            <Link
              href="/vendors"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--teal)] transition-all hover:bg-[rgba(8,145,178,0.06)] sm:inline-flex"
            >
              All vendors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {topVendors.map((vendor, index) => (
              <VendorCard key={vendor.id} vendor={vendor} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-4 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {marketSignals.map((signal) => (
            <div
              key={signal.title}
              className="rounded-[1.4rem] border border-[var(--line)] bg-white/75 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[rgba(15,23,42,0.05)]">
                <signal.icon className="h-[18px] w-[18px] text-[var(--foreground)]" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em]">
                {signal.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {signal.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-4 pb-6 sm:py-6 sm:pb-10">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-[rgba(8,145,178,0.16)] bg-[linear-gradient(135deg,rgba(8,145,178,0.08),rgba(255,255,255,0.96),rgba(37,99,235,0.08))] px-6 py-8 shadow-[0_22px_70px_rgba(15,23,42,0.08)] sm:rounded-[2.25rem] sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[rgba(8,145,178,0.1)] blur-[80px]" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[rgba(37,99,235,0.08)] blur-[96px]" />
            <div
              className="absolute inset-y-0 right-0 w-1/2 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)",
                backgroundSize: "2rem 2rem",
              }}
            />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(8,145,178,0.2)] bg-white/75 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
                <Truck className="h-3.5 w-3.5" />
                Free delivery over $100
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">
                Build a better setup without paying more for the last mile.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Mix and match products from different sellers, place one request, and let the
                logistics layer do the heavy lifting on qualifying orders.
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Combine products across storefronts in one cart flow.",
                  "Track fulfillment updates without chasing multiple sellers.",
                  "Use live chat for pre-order questions and support.",
                  "Get same-city delivery on qualifying orders where available.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--foreground)]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/85 text-[var(--teal)] shadow-sm">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.2rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Threshold
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  {formatPrice(100)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Qualifying orders unlock delivery coverage.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Support
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  Live chat and order help
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Buyers can get real answers before and after placing an order.
                </p>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
