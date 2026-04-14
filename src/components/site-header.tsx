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
    <header className="sticky top-0 z-50 px-3 pt-3 sm:page-shell sm:pt-4">
      <div className="soft-card flex items-center justify-between gap-3 border border-white/75 bg-[rgba(255,255,255,0.84)] px-3 py-2.5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:px-4 sm:py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[1rem] bg-[var(--foreground)] sm:h-10 sm:w-10">
              <span className="text-[10px] font-bold tracking-[0.22em] text-white">ST</span>
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--accent)] opacity-90" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                SuperTech
              </p>
              <p className="text-sm font-semibold tracking-[-0.03em]">Marketplace</p>
            </div>
          </Link>

          <span className="hidden xl:inline-flex items-center gap-2 rounded-full border border-[rgba(15,23,42,0.08)] bg-white/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
            Verified sellers
          </span>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white/70 px-2 py-1 shadow-sm">
            <MegaMenu />
          </div>
        </div>

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
            className="hidden items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[rgba(37,99,235,0.45)] sm:inline-flex"
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
