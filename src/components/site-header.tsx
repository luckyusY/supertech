import Link from "next/link";
import { CircleHelp, ShieldCheck, User } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CartStatusLink } from "@/components/cart-status-link";
import { HeaderScrollShell } from "@/components/header-scroll-shell";
import { HeaderSearch } from "@/components/header-search";
import { DesktopCategoryNav } from "@/components/desktop-category-nav";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";
import { getPublicCategories, getPublicProducts } from "@/lib/public-marketplace";

const helpLinks = [
  { label: "Track order", href: "/track-order" },
  { label: "Request a product", href: "/request-product" },
  { label: "Official stores", href: "/vendors" },
  { label: "Privacy policy", href: "/privacy" },
] as const;

export async function SiteHeader() {
  const [session, categories, products] = await Promise.all([
    getAuthSession().catch(() => null),
    getPublicCategories().catch(() => ["All"]),
    getPublicProducts().catch(() => []),
  ]);
  const headerCategories = categories.filter((category) => category !== "All");
  const categoryImages: Record<string, string> = {};
  for (const product of products) {
    if (!categoryImages[product.category] && product.heroImage) {
      categoryImages[product.category] = product.heroImage;
    }
  }

  return (
    <HeaderScrollShell>
      <header>
        {/* Promo strip — Photo Factory style compact bar */}
        <div className="bg-[var(--background-strong)] px-2 py-1 text-center text-[11px] font-semibold leading-snug text-white sm:px-4">
          <span className="text-[var(--accent)]">Verified sellers</span>
          {" · "}
          Request missing products · Track every order
          {" · "}
          <Link href="/become-vendor" className="text-[var(--gold)] underline-offset-2 hover:underline">
            Sell on SuperTech
          </Link>
        </div>

        {/* Utility strip desktop */}
        <div className="hidden border-b border-white/10 bg-[var(--background-strong)] text-white/80 sm:block">
          <div className="page-shell flex h-8 items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-wide">
            <div className="flex gap-4">
              <Link href="/vendors" className="hover:text-white">
                Official stores
              </Link>
              <Link href="/request-product" className="hover:text-white">
                Request product
              </Link>
              <Link href="/track-order" className="hover:text-white">
                Track order
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                Buyer protection
              </span>
            </div>
          </div>
        </div>

        {/* Primary bar */}
        <div className="bg-[var(--accent)] shadow-[var(--elevation-2)]">
          <div className="page-shell py-2 sm:py-2.5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="md:hidden">
                  <MobileNav categories={headerCategories} categoryImages={categoryImages} />
                </div>
                <BrandLogo
                  size="md"
                  theme="dark"
                  wordmark="Marketplace"
                  sublabel="SuperTech"
                  priority
                  className="hidden shrink-0 min-[400px]:inline-flex"
                  imageClassName="sm:h-10 sm:w-10"
                />
                <BrandLogo
                  size="md"
                  theme="dark"
                  showWordmark={false}
                  priority
                  className="shrink-0 min-[400px]:hidden"
                  imageClassName="sm:h-10 sm:w-10"
                />
              </div>

              <HeaderSearch variant="desktop" />

              <div className="hidden items-center gap-2 md:flex">
                {session ? (
                  <UserMenu
                    name={session.name}
                    role={session.role}
                    dashboardPath={session.dashboardPath}
                  />
                ) : (
                  <Link
                    href="/sign-in"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:text-[var(--accent)]"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                )}

                <div className="group relative">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 text-sm font-semibold text-white hover:bg-white/20"
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

              <div className="flex items-center gap-1.5 md:hidden">
                {session ? (
                  <Link
                    href={session.dashboardPath || "/account"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white"
                    aria-label="Account"
                  >
                    <User className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white"
                    aria-label="Sign in"
                  >
                    <User className="h-4 w-4" />
                  </Link>
                )}
                <CartStatusLink compact />
              </div>
            </div>

            <HeaderSearch variant="mobile" />
          </div>
        </div>

        {/* Desktop category nav — Photo Factory mega-menu pattern */}
        <DesktopCategoryNav categories={headerCategories} />
      </header>
    </HeaderScrollShell>
  );
}
