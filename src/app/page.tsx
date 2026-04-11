import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Database,
  ImagePlus,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { StackStatus } from "@/components/stack-status";
import { VendorCard } from "@/components/vendor-card";
import {
  buildPhases,
  categoryHighlights,
  marketplaceMetrics,
} from "@/lib/marketplace";
import { getPublicFeaturedProducts, getPublicTopVendors } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredProducts, topVendors] = await Promise.all([
    getPublicFeaturedProducts(),
    getPublicTopVendors(),
  ]);

  return (
    <div className="pb-18">
      <section className="page-shell pt-8 pb-10 sm:pt-12">
        <div className="soft-card relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="hero-orbit top-[-3rem] left-[6%] h-28 w-28 bg-[rgba(242,191,99,0.55)]" />
          <div className="hero-orbit right-[-2rem] top-8 h-36 w-36 bg-[rgba(26,123,112,0.22)]" />
          <div className="market-grid absolute inset-y-0 right-0 hidden w-[42%] opacity-35 lg:block" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
            <div className="space-y-7">
              <span className="eyebrow">
                <Layers3 className="h-3.5 w-3.5 text-[var(--accent)]" />
                Next.js multivendor starter
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-5xl leading-none font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                  Build the marketplace customers trust and vendors enjoy using.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                  Approved seller products now flow into the live storefront while
                  the rest of the marketplace keeps growing in phases.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Explore the live catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/vendor"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                >
                  Open vendor dashboard
                </Link>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                {marketplaceMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-4"
                  >
                    <dt className="text-sm text-[var(--muted)]">{metric.label}</dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="dark-card dash-grid float-card relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/8 px-3 py-1 font-mono text-xs uppercase tracking-[0.24em] text-white/70">
                Live architecture
              </div>
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
                    Foundation
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
                    Vercel-hosted marketplace with composable growth paths.
                  </h2>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      icon: Boxes,
                      title: "Marketplace storefront",
                      description:
                        "App Router pages for home, products, vendor profiles, and category browsing.",
                    },
                    {
                      icon: Database,
                      title: "Mongo-backed approvals",
                      description:
                        "Approved seller submissions now appear in the live storefront automatically.",
                    },
                    {
                      icon: ImagePlus,
                      title: "Cloudinary media pipeline",
                      description:
                        "Signed upload endpoint support for product images and seller asset workflows.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4"
                    >
                      <item.icon className="h-5 w-5 text-[var(--gold)]" />
                      <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.72)]">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="soft-card p-6 sm:p-8">
          <SectionHeading
            eyebrow="Curated storefront"
            title="Featured inventory now mixes starter products with approved seller submissions."
            description="This homepage section is fed by the same public catalog layer as the customer storefront, so vendor-approved products can start appearing without another code pass."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <StackStatus />
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="dark-card p-6 sm:p-8">
          <SectionHeading
            eyebrow="Seller rollout"
            title="The build keeps moving in phases instead of stalling on payments."
            description="Phase 1 launched manual customer orders, Phase 2 shipped seller publishing, and Phase 3 now starts the cart flow with manual quote requests before payments."
            invert
          />
            <div className="mt-8 space-y-3">
              {buildPhases.slice(0, 3).map((phase, index) => (
                <div
                  key={phase.id}
                  className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-[rgba(255,255,255,0.76)]"
                >
                  <span className="mr-3 font-mono text-[var(--gold)]">
                    0{index + 1}
                  </span>
                  {phase.title} - {phase.status}
                </div>
              ))}
            </div>
          </div>
          <div className="soft-card p-6 sm:p-8">
            <SectionHeading
              eyebrow="Vendor directory"
              title="Strong sellers make the marketplace feel alive."
              description="Each vendor gets a clear identity, service expectations, and a public storefront that now grows as their approved products go live."
            />
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {topVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="soft-card p-6 sm:p-8 lg:p-10">
          <SectionHeading
            eyebrow="Marketplace lanes"
            title="Use structured categories to make navigation feel editorial, not cluttered."
            description="The base collections stay broad enough for electronics, while seller-approved products can now start populating them in the real storefront."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {categoryHighlights.map((category) => (
              <div
                key={category.name}
                className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white p-5"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: category.accent }}
                />
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {category.count} products seeded
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                  {category.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {category.description}
                </p>
                <Link
                  href={`/catalog?category=${encodeURIComponent(category.name)}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal)]"
                >
                  Browse collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Vendor approvals",
              description:
                "Admin approval now acts as the publishing gate into the customer-facing storefront.",
            },
            {
              icon: Database,
              title: "Mongo collections",
              description:
                "Products, submissions, carts, payouts, and orders can share a single Atlas free-tier cluster during MVP.",
            },
            {
              icon: ImagePlus,
              title: "Cloudinary delivery",
              description:
                "Every seller image can flow from upload widget to approval queue to public product card.",
            },
          ].map((card) => (
            <div key={card.title} className="soft-card p-6">
              <card.icon className="h-6 w-6 text-[var(--accent)]" />
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
