import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

const shopLinks = [
  { label: "Home Control", href: "/catalog?category=Home+Control" },
  { label: "Mobile Essentials", href: "/catalog?category=Mobile+Essentials" },
  { label: "Creator Gear", href: "/catalog?category=Creator+Gear" },
  { label: "Gaming", href: "/catalog?category=Gaming" },
  { label: "Audio", href: "/catalog?category=Audio" },
  { label: "Wearables", href: "/catalog?category=Wearables" },
];

const vendorLinks = [
  { label: "Aurora Labs", href: "/vendors/aurora-labs" },
  { label: "Signal Mobile", href: "/vendors/signal-mobile" },
  { label: "Pixel Foundry", href: "/vendors/pixel-foundry" },
  { label: "Orbit Play", href: "/vendors/orbit-play" },
  { label: "Wave Audio", href: "/vendors/wave-audio" },
  { label: "Flex Wearables", href: "/vendors/flex-wearables" },
];

const helpLinks = [
  { label: "Track your order", href: "/track-order" },
  { label: "Place an order", href: "/order" },
  { label: "Cart & checkout", href: "/cart" },
  { label: "Roadmap", href: "/phases" },
];

const sellerLinks = [
  { label: "Vendor dashboard", href: "/dashboard/vendor" },
  { label: "Admin dashboard", href: "/dashboard/admin" },
  { label: "Sign in", href: "/sign-in" },
];

const mobileQuickLinks = [
  { label: "Shop", href: "/catalog" },
  { label: "Vendors", href: "/vendors" },
  { label: "Track Order", href: "/track-order" },
  { label: "Cart", href: "/cart" },
  { label: "Sign in", href: "/sign-in" },
  { label: "Become a Vendor", href: "/become-vendor" },
];

const footerSignals = [
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    detail: "Every storefront is screened before launch.",
  },
  {
    icon: Truck,
    title: "Fast fulfillment",
    detail: "Same-city delivery available on qualifying orders.",
  },
  {
    icon: Sparkles,
    title: "Curated catalog",
    detail: "Built for premium everyday tech, not catalog sprawl.",
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="page-shell pb-24 pt-4 sm:pb-10 sm:pt-8">
      <div className="space-y-3">
        <div className="dark-card relative overflow-hidden px-4 py-5 sm:px-8 sm:py-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[var(--accent)] blur-[70px]" />
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[var(--gold)] blur-[70px]" />
          </div>

          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                <Sparkles className="h-3 w-3" />
                Premium marketplace
              </span>
              <h2 className="mt-3 text-xl font-semibold sm:text-3xl">
                Buy better gear from trusted sellers.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                Premium tech, verified sellers, and delivery-ready operations in one clean experience.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition-transform hover:-translate-y-0.5"
              >
                Explore catalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/become-vendor"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Sell on SuperTech
              </Link>
            </div>
          </div>

          <div className="relative mt-4 grid gap-2.5 sm:grid-cols-3">
            {footerSignals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
                  <signal.icon className="h-4 w-4 text-white/90" />
                </span>
                <p className="mt-2 text-sm font-semibold text-white">{signal.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-white/60">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card overflow-hidden">
          <div className="sm:hidden">
            <div className="border-b border-[var(--line)] px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[10px] font-bold tracking-[0.18em] text-white">
                  ST
                </div>
                <div>
                  <p className="text-base font-semibold">
                    SuperTech Marketplace
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Premium tech from verified sellers across East and West Africa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
              {mobileQuickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-[var(--line)] px-4 py-3">
              <p className="text-center text-xs text-[var(--muted)]">
                © {new Date().getFullYear()} SuperTech
              </p>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="grid gap-8 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[var(--foreground)] text-[11px] font-bold tracking-[0.18em] text-white">
                    ST
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      SuperTech
                    </p>
                    <p className="text-sm font-semibold tracking-[-0.03em]">Marketplace</p>
                  </div>
                </Link>
                <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
                  Premium tech products from verified sellers across East and West Africa,
                  delivered fast and supported by a clean order flow.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1">
                    East Africa
                  </span>
                  <span className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1">
                    West Africa
                  </span>
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Shop
                </p>
                <ul className="mt-4 space-y-2.5">
                  {shopLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Vendors
                </p>
                <ul className="mt-4 space-y-2.5">
                  {vendorLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Help
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {helpLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Sellers
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {sellerLinks.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] px-8 py-5 sm:flex-row">
              <p className="text-xs text-[var(--muted)]">
                © {new Date().getFullYear()} SuperTech Marketplace. All rights reserved.
              </p>
              <div className="flex items-center gap-5 text-xs text-[var(--muted)]">
                <Link href="/phases" className="transition-colors hover:text-[var(--foreground)]">
                  Roadmap
                </Link>
                <Link href="/catalog" className="transition-colors hover:text-[var(--foreground)]">
                  Catalog
                </Link>
                <Link href="/vendors" className="transition-colors hover:text-[var(--foreground)]">
                  Vendors
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
