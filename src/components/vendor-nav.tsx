"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Palette,
  ShoppingBag,
  Sparkles,
  UserRound,
  Wallet,
  X,
  LogOut,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { HoverScrollRegion } from "@/components/hover-scroll-region";
import type { VendorNavBadges } from "@/lib/dashboard-attention";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard, badgeKey: null },
  {
    href: "/dashboard/vendor/products",
    label: "Products",
    icon: Package,
    badgeKey: "products" as const,
  },
  {
    href: "/dashboard/vendor/orders",
    label: "Orders",
    icon: ShoppingBag,
    badgeKey: "orders" as const,
  },
  { href: "/dashboard/vendor/ai", label: "AI SEO Studio", icon: Sparkles, badgeKey: null },
  { href: "/dashboard/vendor/blogs", label: "Blogs", icon: FileText, badgeKey: null },
  { href: "/dashboard/vendor/storefront", label: "Storefront", icon: Palette, badgeKey: null },
  {
    href: "/dashboard/vendor/payments",
    label: "Payment method",
    icon: CreditCard,
    badgeKey: "payments" as const,
  },
  { href: "/dashboard/vendor/payouts", label: "Payouts", icon: Wallet, badgeKey: null },
  { href: "/dashboard/vendor/profile", label: "Profile", icon: UserRound, badgeKey: null },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/vendor") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatBadge(count: number) {
  if (count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}

function NavLinks({
  pathname,
  badges,
  onNavigate,
}: {
  pathname: string;
  badges: VendorNavBadges;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Seller workspace">
      <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        Workspace
      </p>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const count = item.badgeKey ? badges[item.badgeKey] : 0;
        const badge = formatBadge(count);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-[var(--accent)] text-white shadow-[0_6px_16px_rgba(246,139,30,0.32)]"
                : "text-white/65 hover:bg-white/8 hover:text-white",
            )}
          >
            <item.icon
              className={cn(
                "h-[1.05rem] w-[1.05rem] shrink-0",
                active ? "text-white" : "text-white/45 group-hover:text-white",
              )}
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {badge ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active ? "bg-white text-[var(--accent)]" : "bg-[var(--accent)] text-white",
                )}
                aria-label={`${count} needing attention`}
              >
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function UserCard({ storeName, subtitle }: { storeName: string; subtitle: string }) {
  return (
    <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
      <p className="truncate text-sm font-semibold">{storeName}</p>
      <p className="truncate text-xs text-white/55">{subtitle}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] hover:underline"
        >
          ← Store
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/auth/sign-out", { method: "POST" });
            window.location.assign("/sign-in");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-white/70 hover:bg-red-500/10 hover:text-red-400"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function VendorNav({
  storeName,
  subtitle,
  badges = { orders: 0, products: 0, payments: 0 },
}: {
  storeName: string;
  subtitle: string;
  badges?: VendorNavBadges;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  const totalAttention = badges.orders + badges.products + badges.payments;

  return (
    <>
      <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <BrandLogo
            href="/dashboard/vendor"
            size="sm"
            showWordmark={false}
            className="relative"
            badge={
              totalAttention > 0 ? (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--danger)] ring-2 ring-white" />
              ) : null
            }
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {storeName}
            </p>
            <p className="truncate text-sm font-semibold">{current?.label ?? "Dashboard"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--foreground)]"
          aria-label="Open seller menu"
        >
          <Menu className="h-5 w-5" />
          {totalAttention > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
              {totalAttention > 9 ? "9+" : totalAttention}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[var(--z-drawer)] lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="absolute inset-y-0 left-0 flex w-[17.5rem] max-w-[88vw] flex-col bg-[#171719] text-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Seller menu"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
              <BrandLogo
                href="/"
                size="md"
                theme="dark"
                wordmark={storeName}
                sublabel="Seller workspace"
                className="min-w-0 flex-1"
                onClick={() => setOpen(false)}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <HoverScrollRegion
              className="dashboard-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4"
              axis="y"
              highlightOnHover={false}
            >
              <NavLinks
                pathname={pathname}
                badges={badges}
                onNavigate={() => setOpen(false)}
              />
            </HoverScrollRegion>
            <div className="shrink-0 border-t border-white/10 p-3">
              <UserCard storeName={storeName} subtitle={subtitle} />
            </div>
          </div>
        </div>
      ) : null}

      <aside className="dashboard-sidebar sticky top-0 hidden h-dvh w-[15.75rem] shrink-0 flex-col self-start border-r border-white/8 bg-[#171719] text-white lg:flex">
        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <BrandLogo
            href="/"
            size="md"
            theme="dark"
            wordmark={storeName}
            sublabel="Seller workspace"
            priority
          />
        </div>

        <HoverScrollRegion
          className="dashboard-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4"
          axis="y"
        >
          <NavLinks pathname={pathname} badges={badges} />
        </HoverScrollRegion>

        <div className="shrink-0 border-t border-white/10 p-3">
          <UserCard storeName={storeName} subtitle={subtitle} />
        </div>
      </aside>
    </>
  );
}
