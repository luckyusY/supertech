import Link from "next/link";
import { CircleHelp, PackageSearch, Search, ShieldCheck, Store, User } from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";
import { getPublicCategories } from "@/lib/public-marketplace";

const utilityLinks = [
  { label: "Track Order", href: "/track-order" },
  { label: "Request Product", href: "/request-product" },
  { label: "Become a Vendor", href: "/become-vendor" },
];

export async function SiteHeader() {
  const [session, categories] = await Promise.all([
    getAuthSession().catch(() => null),
    getPublicCategories().catch(() => ["All"]),
  ]);
  const headerCategories = categories.filter((category) => category !== "All");

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-[var(--line)] bg-white lg:block">
        <div className="page-shell flex h-9 items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <Link href="/become-vendor" className="inline-flex items-center gap-2 font-semibold text-[var(--accent)]">
            <Store className="h-3.5 w-3.5" />
            Sell on SuperTech
          </Link>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Verified marketplace
            </span>
            {utilityLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--foreground)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--accent)] shadow-[0_4px_12px_rgba(0,0,0,0.14)]">
        <div className="page-shell py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 md:hidden">
              <MobileNav categories={headerCategories} />
            </div>

            <Link href="/" className="flex shrink-0 items-center gap-2.5 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-sm font-black tracking-[0.18em] text-[var(--accent)]">
                ST
              </div>
              <div className="hidden min-[420px]:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  SuperTech
                </p>
                <p className="text-lg font-black leading-none tracking-[-0.04em]">Marketplace</p>
              </div>
            </Link>

            <form action="/catalog" className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="search"
                  name="query"
                  placeholder="Search products, stores and categories"
                  className="h-11 w-full rounded-md border border-white/55 bg-white pl-10 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--foreground)] px-5 text-sm font-semibold text-white"
              >
                Search
              </button>
            </form>

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
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm"
                >
                  <User className="h-4 w-4" />
                  Account
                </Link>
              )}

              <Link
                href="/track-order"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-white/25 bg-white/12 px-3 text-sm font-semibold text-white"
              >
                <CircleHelp className="h-4 w-4" />
                Help
              </Link>

              <CartStatusLink />
            </div>

            <div className="ml-auto flex items-center gap-2 md:hidden">
              <Link
                href="/track-order"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-white/12 text-white"
                aria-label="Track order"
              >
                <PackageSearch className="h-4 w-4" />
              </Link>
              <CartStatusLink compact />
            </div>
          </div>

          <form action="/catalog" className="mt-3 flex gap-2 md:hidden">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                name="query"
                placeholder="Search products"
                className="h-11 w-full rounded-md border border-white/55 bg-white pl-10 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="hidden border-b border-[var(--line)] bg-white lg:block">
        <div className="page-shell flex h-11 items-center gap-6 overflow-x-auto text-sm font-semibold text-[var(--foreground)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {headerCategories.map((category) => (
            <Link
              key={category}
              href={`/catalog?category=${encodeURIComponent(category)}`}
              className="whitespace-nowrap py-3 transition-colors hover:text-[var(--accent)]"
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
        </div>
      </div>
    </header>
  );
}
