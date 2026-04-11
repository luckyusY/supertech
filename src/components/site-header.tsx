import Link from "next/link";
import { AuthStatusControls } from "@/components/auth-status-controls";
import { CartStatusLink } from "@/components/cart-status-link";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeader() {
  return (
    <header className="page-shell sticky top-0 z-40 pt-4">
      <div className="soft-card flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[var(--foreground)] text-[11px] font-bold tracking-[0.18em] text-white">
            ST
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              SuperTech
            </p>
            <p className="text-sm font-semibold tracking-[-0.03em] leading-none">
              Marketplace
            </p>
          </div>
        </Link>

        {/* Mega menu — desktop only */}
        <MegaMenu />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/request-product"
              className="hidden rounded-full border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] xl:inline-flex"
            >
              Request item
            </Link>
            <AuthStatusControls />
          </div>
          <CartStatusLink />
          <Link
            href="/catalog"
            className="hidden rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white xl:inline-flex"
          >
            Shop now
          </Link>
          {/* Mobile hamburger */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
