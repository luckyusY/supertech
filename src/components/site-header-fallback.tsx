import Link from "next/link";
import {
  CircleHelp,
  PackageSearch,
  ShieldCheck,
  Store,
  Truck,
  User,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartStatusLink } from "@/components/cart-status-link";
import { HeaderSearch } from "@/components/header-search";
import { MobileNav } from "@/components/mobile-nav";

const shopperLinks = [
  { label: "Vendors", href: "/vendors", icon: Store },
  { label: "Request Product", href: "/request-product", icon: PackageSearch },
  { label: "Track Order", href: "/track-order", icon: Truck },
  { label: "Sell on SuperTech", href: "/become-vendor", icon: ShieldCheck },
] as const;

/**
 * Lightweight static fallback while SiteHeader streams.
 * Mirrors Photo Factory–style dense chrome without auth/session fetch.
 */
export async function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-[var(--z-header)]">
      <div className="bg-[var(--background-strong)] px-2 py-1 text-center text-[11px] font-semibold leading-snug text-white sm:px-4">
        <span className="text-[var(--accent)]">Verified sellers</span>
        {" · "}
        Request missing products · Track every order
      </div>

      <div className="bg-[var(--accent)] shadow-[var(--elevation-2)]">
        <div className="page-shell py-2 sm:py-2.5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <MobileNav categories={[]} />
              </div>
              <BrandLogo
                size="md"
                theme="dark"
                wordmark="Marketplace"
                sublabel="SuperTech"
                priority
                className="shrink-0"
                imageClassName="sm:h-10 sm:w-10"
              />
            </div>

            <HeaderSearch variant="desktop" />

            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm"
              >
                <User className="h-4 w-4" />
                Account
              </Link>
              <Link
                href="/track-order"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 text-sm font-semibold text-white"
              >
                <CircleHelp className="h-4 w-4" />
                Help
              </Link>
              <CartStatusLink />
            </div>

            <div className="flex items-center gap-1.5 md:hidden">
              <Link
                href="/sign-in"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white"
                aria-label="Sign in"
              >
                <User className="h-4 w-4" />
              </Link>
              <CartStatusLink compact />
            </div>
          </div>

          <HeaderSearch variant="mobile" />
        </div>
      </div>

      <nav className="hidden border-b border-[var(--line)] bg-[var(--background-strong)] text-white lg:block">
        <div className="page-shell flex h-11 items-center gap-1 overflow-x-auto">
          {shopperLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
