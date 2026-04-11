import Link from "next/link";
import { User } from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { getAuthSession } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getAuthSession();

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
          {session ? (
            <Link
              href={
                session.role === "admin"
                  ? "/dashboard/admin"
                  : session.role === "vendor"
                    ? "/dashboard/vendor"
                    : "/account"
              }
              className="flex h-9 items-center gap-2 rounded-full border border-[var(--line)] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white transition-colors"
              aria-label="My account"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{session.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label="Sign in"
            >
              <User className="h-4 w-4" />
            </Link>
          )}
          <CartStatusLink />
          <Link
            href="/catalog"
            className="hidden rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white sm:inline-flex"
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
