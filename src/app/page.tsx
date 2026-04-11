import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Star, Headphones } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { VendorCard } from "@/components/vendor-card";
import { categoryHighlights } from "@/lib/marketplace";
import { getPublicFeaturedProducts, getPublicTopVendors } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

const trustBadges = [
  { icon: Truck, title: "Fast delivery", desc: "Same-day dispatch on orders before 2 PM" },
  { icon: ShieldCheck, title: "Verified sellers", desc: "Every vendor is reviewed before going live" },
  { icon: Star, title: "Curated catalog", desc: "Only the best tech makes it onto the shelves" },
  { icon: Headphones, title: "Live support", desc: "Real humans available Monday – Saturday" },
];

export default async function Home() {
  const [featuredProducts, topVendors] = await Promise.all([
    getPublicFeaturedProducts(),
    getPublicTopVendors(),
  ]);

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="page-shell pt-8 pb-6 sm:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--foreground)] px-8 py-12 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" />
            <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-[var(--teal)] opacity-15 blur-3xl" />
            <div
              className="absolute bottom-0 right-0 h-full w-[45%] opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "2rem 2rem",
              }}
            />
          </div>
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div className="max-w-2xl space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                🌍 Shipping across East &amp; West Africa
              </span>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Premium tech, delivered to your door.
              </h1>
              <p className="text-lg leading-8 text-white/70 sm:text-xl">
                Shop verified sellers across home tech, mobile, audio, gaming, and wearables — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Shop the catalog <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm"
                >
                  Browse sellers
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-white/60">
                <span><span className="font-semibold text-white">24</span> products</span>
                <span className="h-4 w-px bg-white/20" />
                <span><span className="font-semibold text-white">6</span> verified sellers</span>
                <span className="h-4 w-px bg-white/20" />
                <span><span className="font-semibold text-white">12+</span> cities served</span>
              </div>
            </div>
            {featuredProducts[0] && (
              <div className="hidden lg:block">
                <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/8 p-2 backdrop-blur-sm">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]">
                    <Image
                      src={featuredProducts[0].heroImage}
                      alt={featuredProducts[0].name}
                      fill
                      className="object-cover"
                      sizes="500px"
                      priority
                    />
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-xs text-white/50">{featuredProducts[0].category}</p>
                    <p className="mt-1 font-semibold">{featuredProducts[0].name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xl font-semibold tracking-[-0.04em] text-[var(--gold)]">${featuredProducts[0].price}</p>
                      <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold">{featuredProducts[0].badge}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="page-shell py-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-start gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/60 px-4 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(228,90,54,0.1)]">
                <badge.icon className="h-4 w-4 text-[var(--accent)]" />
              </span>
              <div>
                <p className="text-sm font-semibold">{badge.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="page-shell py-6">
        <div className="soft-card p-6 sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Handpicked</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Featured products</h2>
            </div>
            <Link href="/catalog" className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--teal)] sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-6 sm:hidden">
            <Link href="/catalog" className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] py-3 text-sm font-semibold">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category lanes */}
      <section className="page-shell py-6">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Browse by category</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Shop your lane</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryHighlights.map((cat) => (
            <Link
              key={cat.name}
              href={`/catalog?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white p-6 transition-transform hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: cat.accent }} />
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{cat.count} products</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{cat.name}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{cat.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--teal)] transition-all group-hover:gap-2.5">
                Shop now <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Vendor spotlight */}
      <section className="page-shell py-6">
        <div className="soft-card p-6 sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Our sellers</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Meet the vendors</h2>
            </div>
            <Link href="/vendors" className="hidden items-center gap-1.5 text-sm font-semibold text-[var(--teal)] sm:flex">
              All vendors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {topVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      {/* Free delivery CTA */}
      <section className="page-shell py-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(26,123,112,0.2)] bg-[rgba(26,123,112,0.06)] px-8 py-10 sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)",
              backgroundSize: "2rem 2rem",
            }}
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--teal)]">Free delivery</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Order over $100 and we cover the delivery.</h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                Mix and match products from any vendor. Free same-city delivery on qualifying orders.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--foreground)] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
