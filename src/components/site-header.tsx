import Link from "next/link";
import Image from "next/image";
import {
  CircleHelp,
  PackageSearch,
  ShieldCheck,
  Store,
  Truck,
  User,
} from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { HeaderSearch } from "@/components/header-search";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";
import { getPublicCategories } from "@/lib/public-marketplace";

const shopperLinks = [
  { label: "Vendors", mobileLabel: "Vendors", href: "/vendors", icon: Store },
  { label: "Request Product", mobileLabel: "Request", href: "/request-product", icon: PackageSearch },
  { label: "Track Your Order", mobileLabel: "Track", href: "/track-order", icon: Truck },
  { label: "Become a Vendor", mobileLabel: "Sell", href: "/become-vendor", icon: ShieldCheck },
] as const;

const helpLinks = [
  { label: "Track order", href: "/track-order" },
  { label: "Request a product", href: "/request-product" },
  { label: "Official stores", href: "/vendors" },
  { label: "Privacy policy", href: "/privacy" },
] as const;

const MAX_CATEGORY_RAIL = 8;

export async function SiteHeader() {
  const [session, categories] = await Promise.all([
    getAuthSession().catch(() => null),
    getPublicCategories().catch(() => ["All"]),
  ]);
  const headerCategories = categories.filter((category) => category !== "All");
  const railCategories = headerCategories.slice(0, MAX_CATEGORY_RAIL);
  const hasMoreCategories = headerCategories.length > MAX_CATEGORY_RAIL;

  return (
    <header className="sticky top-0 z-[var(--z-header)]">
      {/* Desktop utility strip */}
      <div className="hidden border-b border-[var(--line)] bg-white lg:block">
        <div className="page-shell flex h-9 items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <Link
            href="/become-vendor"
            className="inline-flex items-center gap-2 font-semibold text-[var(--accent)]"
          >
            <Store className="h-3.5 w-3.5" />
            Sell on SuperTech
          </Link>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Verified marketplace
            </span>
            <span className="hidden xl:inline">Shop · request · track — local payments</span>
          </div>
        </div>
      </div>

      {/* Primary bar */}
      <div className="bg-[var(--accent)] shadow-[var(--elevation-2)]">
        <div className="page-shell py-2.5 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2 md:hidden">
              <MobileNav categories={headerCategories} />
            </div>

            <Link href="/" className="flex shrink-0 items-center gap-2 text-white sm:gap-2.5">
              <Image
                src="/logo.png"
                alt="SuperTech logo"
                width={40}
                height={40}
                priority
                className="h-9 w-9 rounded-[var(--radius-sm)] bg-white object-contain sm:h-10 sm:w-10"
              />
              <div className="hidden min-[420px]:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-[11px] sm:tracking-[0.24em]">
                  SuperTech
                </p>
                <p className="text-base font-black leading-none tracking-[-0.04em] sm:text-lg">
                  Marketplace
                </p>
              </div>
            </Link>

            <HeaderSearch variant="desktop" />

            <div className="ml-auto hidden items-center gap-2 md:flex">
              {session ? (
                <UserMenu
                  name={session.name}
                  role={session.role}
                  dashboardPath={session.dashboardPath}
                />
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:border-white hover:text-[var(--accent)]"
                >
                  <User className="h-4 w-4" />
                  Account
                </Link>
              )}

              {/* Help menu */}
              <div className="group relative">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-white/25 bg-white/12 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/22"
                  aria-haspopup="menu"
                >
                  <CircleHelp className="h-4 w-4" />
                  Help
                </button>
                <div
                  role="menu"
                  className="invisible absolute right-0 top-full z-[var(--z-drawer)] mt-1.5 w-52 origin-top-right scale-95 rounded-[var(--radius-md)] border border-[var(--line)] bg-white py-1.5 opacity-0 shadow-[var(--elevation-3)] transition-all group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:visible group-hover:scale-100 group-hover:opacity-100"
                >
                  {helpLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className="block px-3.5 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <CartStatusLink />
            </div>

            <div className="ml-auto flex items-center gap-2 md:hidden">
              {session ? (
                <Link
                  href={session.dashboardPath || "/account"}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/25 bg-white/12 text-white"
                  aria-label="Account"
                >
                  <User className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/25 bg-white/12 text-white"
                  aria-label="Sign in"
                >
                  <User className="h-4 w-4" />
                </Link>
              )}
              <CartStatusLink compact />
            </div>
          </div>

          <HeaderSearch variant="mobile" />
          {/* Mobile quick links removed — bottom nav + hamburger own destinations */}
        </div>
      </div>

      {/* Category rail — desktop */}
      <div className="hidden border-b border-[var(--line)] bg-white lg:block">
        <div className="page-shell flex h-11 items-center gap-4 overflow-x-auto text-sm font-semibold text-[var(--foreground)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav aria-label="Marketplace quick links" className="flex shrink-0 items-center gap-2">
            {shopperLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--accent-soft)] px-2.5 text-xs font-bold text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>
          <span className="h-5 w-px shrink-0 bg-[var(--line)]" />
          <nav aria-label="Product categories" className="flex min-w-0 items-center gap-5">
            {railCategories.map((category) => (
              <Link
                key={category}
                href={`/catalog?category=${encodeURIComponent(category)}`}
                className="relative whitespace-nowrap py-3 text-[var(--foreground)] transition-colors hover:text-[var(--accent)] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--accent)] after:transition-[width] after:duration-200 hover:after:w-full"
              >
                {category}
              </Link>
            ))}
            <Link
              href="/vendors"
              className="whitespace-nowrap py-3 transition-colors hover:text-[var(--accent)]"
            >
              Official Stores
            </Link>
            {hasMoreCategories ? (
              <Link
                href="/catalog"
                className="whitespace-nowrap py-3 font-bold text-[var(--accent)] transition-colors hover:underline"
              >
                All categories
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
