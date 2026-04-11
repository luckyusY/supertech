import Link from "next/link";

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

export function SiteFooter() {
  return (
    <footer className="page-shell pb-10 pt-8">
      <div className="soft-card overflow-hidden">
        {/* Main columns */}
        <div className="grid gap-10 px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[var(--foreground)] text-[11px] font-bold tracking-[0.18em] text-white">
                ST
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">SuperTech</p>
                <p className="text-sm font-semibold tracking-[-0.03em]">Marketplace</p>
              </div>
            </Link>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              Premium tech products from verified sellers across East and West Africa, delivered fast.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
              <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">🌍 East Africa</span>
              <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">🌍 West Africa</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Vendors</p>
            <ul className="mt-4 space-y-2.5">
              {vendorLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help + Seller */}
          <div className="space-y-8">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Help</p>
              <ul className="mt-4 space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Sellers</p>
              <ul className="mt-4 space-y-2.5">
                {sellerLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[var(--foreground)] hover:text-[var(--accent)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] px-8 py-5 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} SuperTech Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-[var(--muted)]">
            <Link href="/phases" className="hover:text-[var(--foreground)]">Roadmap</Link>
            <Link href="/catalog" className="hover:text-[var(--foreground)]">Catalog</Link>
            <Link href="/vendors" className="hover:text-[var(--foreground)]">Vendors</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
