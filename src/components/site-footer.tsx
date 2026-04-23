import Link from "next/link";
import { CircleHelp, ShieldCheck, Sparkles, Truck } from "lucide-react";

const shopLinks = [
  { label: "Home Control", href: "/catalog?category=Home+Control" },
  { label: "Mobile Essentials", href: "/catalog?category=Mobile+Essentials" },
  { label: "Creator Gear", href: "/catalog?category=Creator+Gear" },
  { label: "Gaming", href: "/catalog?category=Gaming" },
  { label: "Audio", href: "/catalog?category=Audio" },
  { label: "Wearables", href: "/catalog?category=Wearables" },
  { label: "Beauty & Personal Care", href: "/catalog?category=Beauty+%26+Personal+Care" },
  { label: "Health & Wellness", href: "/catalog?category=Health+%26+Wellness" },
];

const vendorLinks = [
  { label: "Aurora Labs", href: "/vendors/aurora-labs" },
  { label: "Signal Mobile", href: "/vendors/signal-mobile" },
  { label: "Pixel Foundry", href: "/vendors/pixel-foundry" },
  { label: "Orbit Play", href: "/vendors/orbit-play" },
  { label: "Wave Audio", href: "/vendors/wave-audio" },
  { label: "Flex Wearables", href: "/vendors/flex-wearables" },
  { label: "Luna Beauty", href: "/vendors/luna-beauty" },
];

const helpLinks = [
  { label: "Track your order", href: "/track-order" },
  { label: "Place an order", href: "/order" },
  { label: "Cart & checkout", href: "/cart" },
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
    <footer className="mt-8 bg-[#2b2b2d] text-white">
      <div className="border-b border-white/8">
        <div className="page-shell grid gap-4 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
              Need something specific?
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Browse trusted deals across tech, beauty, and wellness.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              SuperTech now uses a denser marketplace layout modeled after Jumia&apos;s merchandising flow, while expanding the catalog into beauty and wellness without losing verified sellers.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              Browse catalog
            </Link>
            <Link
              href="/request-product"
              className="inline-flex items-center justify-center rounded-md border border-white/16 bg-white/6 px-5 py-3 text-sm font-semibold text-white"
            >
              Request a product
            </Link>
          </div>
        </div>
      </div>

      <div className="page-shell py-8 pb-24 sm:pb-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-sm font-black tracking-[0.18em] text-[var(--accent)]">
                ST
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  SuperTech
                </p>
                <p className="text-base font-black tracking-[-0.04em]">Marketplace</p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              Verified products across tech, beauty, and wellness from sellers across East and West Africa, organized in a dense storefront that stays fast to scan and easy to shop.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {footerSignals.map((signal) => (
                <div key={signal.title} className="rounded-lg border border-white/10 bg-white/6 px-3 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                    <signal.icon className="h-4 w-4 text-white" />
                  </span>
                  <p className="mt-2 text-sm font-semibold text-white">{signal.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
              Shop
            </p>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/72 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
              Official Stores
            </p>
            <ul className="mt-4 space-y-2.5">
              {vendorLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/72 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
                Need help?
              </p>
              <ul className="mt-4 space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/72 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CircleHelp className="h-4 w-4 text-[var(--accent)]" />
                Buyer support
              </div>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Track orders, request custom products, or apply to sell through the marketplace.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/track-order" className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)]">
                  Track order
                </Link>
                <Link href="/become-vendor" className="rounded-md border border-white/12 px-3 py-2 text-xs font-semibold text-white">
                  Sell on SuperTech
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SuperTech Marketplace. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/phases" className="transition-colors hover:text-white">
                Roadmap
              </Link>
              <Link href="/vendors" className="transition-colors hover:text-white">
                Official stores
              </Link>
              <Link href="/catalog" className="transition-colors hover:text-white">
                Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
