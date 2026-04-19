import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Gamepad2,
  Headphones,
  Home as HomeIcon,
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
import { HeroSlider } from "@/components/hero-slider";
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
  },
  "Mobile Essentials": {
    iconSurface: "rgba(26, 123, 112, 0.14)",
    iconColor: "#1a7b70",
  },
  "Creator Gear": {
    iconSurface: "rgba(17, 33, 28, 0.14)",
    iconColor: "#11211c",
  },
  Gaming: {
    iconSurface: "rgba(242, 191, 99, 0.18)",
    iconColor: "#a65d11",
  },
  Audio: {
    iconSurface: "rgba(91, 58, 140, 0.14)",
    iconColor: "#5b3a8c",
  },
  Wearables: {
    iconSurface: "rgba(26, 92, 123, 0.14)",
    iconColor: "#1a5c7b",
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
      iconKey: "package" as const,
      value: formatCompactNumber(publicProducts.length),
      label: "live products",
    },
    {
      iconKey: "shield" as const,
      value: formatCompactNumber(publicVendors.length),
      label: "verified sellers",
    },
    {
      iconKey: "trending" as const,
      value: `${averageFulfillment.toFixed(1)}%`,
      label: "avg. fulfillment",
    },
  ];

  return (
    <div className="pb-20 sm:pb-0">
      {/* Hero with sliding images */}
      <section className="page-shell pt-3 pb-3 sm:pt-6 sm:pb-5">
        <HeroSlider stats={heroStats} />
      </section>

      {/* Trust badges */}
      <section className="page-shell py-4 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="group rounded-xl border border-[var(--line)] bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] transition-transform duration-300 group-hover:scale-110">
                <badge.icon className="h-5 w-5 text-[var(--accent)]" />
              </span>
              <p className="mt-3 text-sm font-semibold">{badge.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="page-shell py-4 sm:py-6">
        <div className="soft-card overflow-hidden p-4 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                Handpicked for you
              </p>
              <h2 className="mt-1.5 text-xl font-semibold sm:text-3xl lg:text-4xl">
                Featured products
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Chosen for standout quality and fast fulfillment.
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent-soft)] sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div className="mt-4 sm:hidden">
            <Link
              href="/catalog"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-colors"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-shell py-4 sm:py-6">
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
            Browse by category
          </p>
          <h2 className="mt-1 text-xl font-semibold sm:text-3xl lg:text-4xl">
            Shop your lane
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Curated product lanes, not endless catalogs.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryHighlights.map((category) => {
            const Icon = categoryIcons[category.name] ?? HomeIcon;
            const style =
              categoryStyles[category.name as keyof typeof categoryStyles] ??
              categoryStyles["Home Control"];

            return (
              <Link
                key={category.name}
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: category.accent }}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: style.iconSurface }}
                  >
                    <Icon className="h-5 w-5" style={{ color: style.iconColor }} />
                  </div>
                  <span className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">
                    {category.count} products
                  </span>
                </div>
                <div className="relative mt-4 flex flex-1 flex-col">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                    {category.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-all group-hover:gap-2.5">
                      Shop now
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Vendors */}
      <section className="page-shell py-4 sm:py-6">
        <div className="soft-card overflow-hidden p-4 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                Our sellers
              </p>
              <h2 className="mt-1 text-xl font-semibold sm:text-3xl lg:text-4xl">
                Meet the vendors
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Verified storefronts with their own specialty and fulfillment rhythm.
              </p>
            </div>
            <Link
              href="/vendors"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-all hover:bg-[var(--accent-soft)] sm:inline-flex"
            >
              All vendors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {topVendors.map((vendor, index) => (
              <VendorCard key={vendor.id} vendor={vendor} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Market signals */}
      <section className="page-shell py-4 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {marketSignals.map((signal) => (
            <div
              key={signal.title}
              className="group rounded-xl border border-[var(--line)] bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] transition-transform duration-300 group-hover:scale-110">
                <signal.icon className="h-4 w-4 text-[var(--accent)]" />
              </span>
              <h3 className="mt-3 text-base font-semibold">{signal.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">{signal.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="page-shell py-4 pb-6 sm:py-6 sm:pb-10">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)] bg-gradient-to-br from-[var(--accent)] to-[#ff9966] shadow-lg sm:rounded-[2rem]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/20 blur-[80px]" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/15 blur-[96px]" />
          </div>
          <div className="relative grid lg:grid-cols-[minmax(0,1fr)_420px]">
            {/* Left: text content */}
            <div className="px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                <Truck className="h-3.5 w-3.5" />
                Free delivery over $100
              </span>
              <h2 className="mt-3 text-xl font-semibold sm:text-3xl lg:text-4xl">
                Build a better setup, pay less.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                Mix products from different sellers, track fulfillment, and get same-city delivery.
              </p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {[
                  "Combine products across sellers in one cart.",
                  "Track fulfillment without chasing multiple sellers.",
                  "Live chat for pre-order questions.",
                  "Same-city delivery on qualifying orders.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[var(--accent)] shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="flex -space-x-1.5">
                    {[
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
                      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop&crop=face",
                    ].map((src, i) => (
                      <div key={i} className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-[var(--accent)]">
                        <Image src={src} alt="Customer" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-medium">2,400+ happy shoppers</span>
                </div>
              </div>
              {/* Info cards — visible on mobile only, hidden on lg (shown in image column) */}
              <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
                <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">Threshold</p>
                  <p className="mt-1 text-2xl font-semibold">{formatPrice(100)}</p>
                  <p className="mt-0.5 text-xs text-white/70">Free delivery on qualifying orders</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">Support</p>
                  <p className="mt-1 text-base font-semibold">Live chat & order help</p>
                  <p className="mt-0.5 text-xs text-white/70">Real answers before & after ordering</p>
                </div>
              </div>
            </div>

            {/* Right: product image collage — hidden on mobile */}
            <div className="relative hidden lg:block">
              {/* Main background image */}
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80"
                  alt="Tech products"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff7b35]/80 via-[#ff7b35]/30 to-transparent" />
              </div>

              {/* Floating product thumbnails */}
              <div className="absolute left-6 top-6 overflow-hidden rounded-2xl shadow-xl border-2 border-white/30 w-28 h-28">
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80"
                  alt="Headphones"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[9px] font-semibold text-white truncate">Headphones</p>
                </div>
              </div>

              <div className="absolute right-6 top-6 overflow-hidden rounded-2xl shadow-xl border-2 border-white/30 w-28 h-28">
                <Image
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&q=80"
                  alt="Smartwatch"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[9px] font-semibold text-white truncate">Smartwatch</p>
                </div>
              </div>

              <div className="absolute left-6 bottom-6 overflow-hidden rounded-2xl shadow-xl border-2 border-white/30 w-28 h-28">
                <Image
                  src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&q=80"
                  alt="Skincare"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-[9px] font-semibold text-white truncate">Beauty</p>
                </div>
              </div>

              {/* Info cards overlaid at bottom-right */}
              <div className="absolute bottom-6 right-4 grid gap-2 w-48">
                <div className="rounded-xl border border-white/20 bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/70">Threshold</p>
                  <p className="mt-0.5 text-xl font-semibold text-white">{formatPrice(100)}</p>
                  <p className="text-[10px] text-white/70">Free delivery on qualifying orders</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/70">Support</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">Live chat & order help</p>
                  <p className="text-[10px] text-white/70">Real answers before & after ordering</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
