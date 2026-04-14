import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Star, Headphones, Zap, Package } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { VendorCard } from "@/components/vendor-card";
import { categoryHighlights } from "@/lib/marketplace";
import { getPublicFeaturedProducts, getPublicTopVendors } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

const trustBadges = [
  { icon: Truck,       title: "Fast delivery",    desc: "Same-day dispatch on orders before 2 PM" },
  { icon: ShieldCheck, title: "Verified sellers",  desc: "Every vendor is reviewed before going live" },
  { icon: Star,        title: "Curated catalog",   desc: "Only the best tech makes it to the shelves" },
  { icon: Headphones,  title: "Live support",      desc: "Real humans available Monday – Saturday" },
];

const categoryIcons: Record<string, typeof Zap> = {
  "Home Control": Zap,
  "Mobile Essentials": Package,
  "Creator Gear": Star,
  Gaming: Zap,
  Audio: Headphones,
  Wearables: ShieldCheck,
};

export default async function Home() {
  const [featuredProducts, topVendors] = await Promise.all([
    getPublicFeaturedProducts(),
    getPublicTopVendors(),
  ]);

  return (
    <div className="pb-20 sm:pb-0">

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="page-shell pt-5 pb-4 sm:pt-8 sm:pb-6">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[var(--foreground)] px-5 py-10 text-white sm:rounded-[2.25rem] sm:px-12 sm:py-16 lg:px-20 lg:py-24">
          {/* Background orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--accent)] opacity-[0.18] blur-[80px]" />
            <div className="absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-[var(--teal)] opacity-[0.14] blur-[72px]" />
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-[var(--gold)] opacity-[0.06] blur-[60px]" />
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
                backgroundSize: "2.5rem 2.5rem",
              }}
            />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            {/* Text */}
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                🌍 East &amp; West Africa
              </span>
              <h1 className="text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl sm:leading-[1.05] lg:text-[4.5rem] lg:leading-[1.04]">
                Premium tech,<br className="hidden sm:block" /> delivered to your door.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                Shop verified sellers across home tech, mobile, audio, gaming, and wearables — all in one place.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[rgba(228,90,54,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[rgba(228,90,54,0.5)]"
                >
                  Shop the catalog <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/vendors"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                >
                  Browse sellers
                </Link>
              </div>
              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-white/55">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">📦</span>
                  <span className="font-semibold text-white">24</span> products
                </span>
                <span className="hidden h-4 w-px bg-white/15 sm:block" />
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">✅</span>
                  <span className="font-semibold text-white">6</span> verified sellers
                </span>
                <span className="hidden h-4 w-px bg-white/15 sm:block" />
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">🏙️</span>
                  <span className="font-semibold text-white">12+</span> cities served
                </span>
              </div>
            </div>

            {/* Hero product card — desktop only */}
            {featuredProducts[0] && (
              <div className="hidden lg:block">
                <div className="group overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/7 p-2 shadow-2xl shadow-black/30 backdrop-blur-md">
                  <div className="relative aspect-[4/3.2] overflow-hidden rounded-[1.3rem]">
                    <Image
                      src={featuredProducts[0].heroImage}
                      alt={featuredProducts[0].name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="440px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {featuredProducts[0].badge && (
                      <span
                        className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: featuredProducts[0].accent }}
                      >
                        {featuredProducts[0].badge}
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-3.5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">{featuredProducts[0].category}</p>
                    <p className="mt-1 font-semibold leading-snug tracking-[-0.02em]">{featuredProducts[0].name}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--gold)]">
                        ${featuredProducts[0].price.toLocaleString()}
                      </p>
                      <Link
                        href={`/products/${featuredProducts[0].slug}`}
                        className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-white"
                      >
                        View product
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Second product mini card */}
                {featuredProducts[1] && (
                  <div className="mt-3 flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[0.7rem]">
                      <Image src={featuredProducts[1].heroImage} alt={featuredProducts[1].name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold leading-tight">{featuredProducts[1].name}</p>
                      <p className="text-[11px] text-white/50">{featuredProducts[1].category}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[var(--gold)]">${featuredProducts[1].price}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Marquee ticker ─────────────────────────────── */}
      <div className="relative overflow-hidden border-y border-[var(--line)] bg-white/50 py-3 backdrop-blur-sm">
        <div className="marquee-track flex gap-0 whitespace-nowrap">
          {[...Array(3)].flatMap(() => [
            "Home Control", "Mobile Essentials", "Creator Gear", "Gaming", "Audio", "Wearables",
            "Free Delivery", "Verified Sellers", "12+ Cities", "Same-Day Dispatch",
          ]).map((item, i) => (
            <span key={i} className="flex shrink-0 items-center gap-4 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Trust badges ───────────────────────────────── */}
      <section className="py-5">
        <div className="scroll-x gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="flex w-[230px] shrink-0 items-center gap-3.5 rounded-[1.5rem] border border-[var(--line)] bg-white/70 px-4 py-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(228,90,54,0.08)]">
                <badge.icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-[var(--accent)]" />
              </span>
              <div>
                <p className="text-sm font-semibold">{badge.title}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-[var(--muted)]">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ──────────────────────────── */}
      <section className="page-shell py-4 sm:py-6">
        <div className="soft-card overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--accent)]">Handpicked for you</p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">Featured products</h2>
            </div>
            <Link
              href="/catalog"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--teal)] transition-all hover:bg-[rgba(26,123,112,0.06)] sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="mt-5 sm:hidden">
            <Link
              href="/catalog"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] py-3 text-sm font-semibold transition-colors hover:bg-white/60"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category lanes ─────────────────────────────── */}
      <section className="page-shell py-4 sm:py-6">
        <div className="mb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Browse by category</p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">Shop your lane</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryHighlights.map((cat) => {
            const Icon = categoryIcons[cat.name] ?? Zap;
            return (
              <Link
                key={cat.name}
                href={`/catalog?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Gradient top bar */}
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: cat.accent }} />
                {/* Icon orb */}
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-[0.9rem]"
                  style={{ background: cat.accent + "18" }}
                >
                  <Icon className="h-5 w-5" style={{ color: cat.accent.includes("#") ? cat.accent : undefined }} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">{cat.count} products</p>
                <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.03em]">{cat.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{cat.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--teal)] transition-all group-hover:gap-2.5">
                  Shop now <ArrowRight className="h-4 w-4" />
                </span>
                {/* Hover gradient glow */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at 10% 90%, ${cat.accent}0a 0%, transparent 60%)` }}
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Vendor spotlight ───────────────────────────── */}
      <section className="page-shell py-4 sm:py-6">
        <div className="soft-card overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Our sellers</p>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">Meet the vendors</h2>
            </div>
            <Link
              href="/vendors"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--teal)] transition-all hover:bg-[rgba(26,123,112,0.06)] sm:flex"
            >
              All vendors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {topVendors.map((vendor, i) => (
              <VendorCard key={vendor.id} vendor={vendor} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof strip ─────────────────────────── */}
      <section className="page-shell py-4 sm:py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { value: "2,400+", label: "Happy customers", emoji: "😊" },
            { value: "98%",    label: "Fulfillment rate", emoji: "📦" },
            { value: "4.9★",   label: "Average rating",  emoji: "⭐" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-[1.4rem] border border-[var(--line)] bg-white/60 px-5 py-4 backdrop-blur-sm"
            >
              <span className="text-2xl">{stat.emoji}</span>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em]">{stat.value}</p>
                <p className="text-xs text-[var(--muted)]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Free delivery CTA ──────────────────────────── */}
      <section className="page-shell py-4 pb-6 sm:py-6 sm:pb-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(26,123,112,0.18)] bg-gradient-to-br from-[rgba(26,123,112,0.07)] to-[rgba(26,123,112,0.03)] px-6 py-10 sm:rounded-[2.25rem] sm:px-14 sm:py-16">
          {/* Grid */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(var(--teal) 1px,transparent 1px),linear-gradient(90deg,var(--teal) 1px,transparent 1px)",
              backgroundSize: "2rem 2rem",
            }}
          />
          {/* Glow orb */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--teal)] opacity-[0.08] blur-[60px]" />

          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(26,123,112,0.25)] bg-[rgba(26,123,112,0.08)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">
                🚚 Free delivery
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">
                Order over $100 and we cover the delivery.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                Mix and match products from any vendor. Free same-city delivery on qualifying orders.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--foreground)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
