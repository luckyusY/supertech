import Link from "next/link";
import { ArrowRight, ShieldCheck, User } from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { MegaMenu } from "@/components/mega-menu";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getAuthSession().catch(() => null);

  return (
    <header className="sticky top-0 z-50 px-2 pt-2 sm:page-shell sm:pt-4">
      <div className="soft-card flex items-center justify-between gap-2 border border-white/75 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[var(--accent)] sm:h-10 sm:w-10">
              <span className="text-[10px] font-bold tracking-[0.22em] text-white">ST</span>
              <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-white opacity-90" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                SuperTech
              </p>
              <p className="text-sm font-semibold tracking-[-0.03em]">Marketplace</p>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="rounded-full border border-[var(--line)] bg-white px-2 py-1">
            <MegaMenu />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {session ? (
            <UserMenu
              name={session.name}
              role={session.role}
              dashboardPath={session.dashboardPath}
            />
          ) : (
            <Link
              href="/sign-in"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              aria-label="Sign in"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          <CartStatusLink />

          <Link
            href="/catalog"
            className="hidden items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 sm:inline-flex"
          >
            Shop now
            <ArrowRight className="h-4 w-4" />
          </Link>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
