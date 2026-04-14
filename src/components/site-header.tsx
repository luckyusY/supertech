import Link from "next/link";
import { User } from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getAuthSession().catch(() => null);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:page-shell sm:pt-4">
      <div className="soft-card flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-[var(--foreground)] sm:h-9 sm:w-9">
            <span className="text-[10px] font-bold tracking-widest text-white">ST</span>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--accent)] opacity-80" />
          </div>
          <span className="text-sm font-semibold tracking-[-0.02em] sm:text-[15px]">
            SuperTech
          </span>
        </Link>

        {/* Mega menu — desktop only */}
        <MegaMenu />

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {session ? (
            <UserMenu
              name={session.name}
              role={session.role}
              dashboardPath={session.dashboardPath}
            />
          ) : (
            <Link
              href="/sign-in"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              aria-label="Sign in"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          <CartStatusLink />

          <Link
            href="/catalog"
            className="hidden rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[rgba(228,90,54,0.3)] transition-all hover:shadow-[rgba(228,90,54,0.45)] hover:-translate-y-0.5 sm:inline-flex"
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
