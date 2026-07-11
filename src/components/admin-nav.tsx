"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  FileText,
  KeyRound,
  LayoutDashboard,
  Menu,
  Package,
  Shapes,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { HoverScrollRegion } from "@/components/hover-scroll-region";
import type { AdminNavBadges } from "@/lib/dashboard-attention";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, badgeKey: null },
  { href: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag, badgeKey: "orders" as const },
  {
    href: "/dashboard/admin/approvals",
    label: "Approvals",
    icon: BadgeCheck,
    badgeKey: "approvals" as const,
  },
  {
    href: "/dashboard/admin/products",
    label: "Products",
    icon: Package,
    badgeKey: "products" as const,
  },
  { href: "/dashboard/admin/vendors", label: "Vendors", icon: Store, badgeKey: null },
  { href: "/dashboard/admin/blogs", label: "Blogs", icon: FileText, badgeKey: null },
  { href: "/dashboard/admin/categories", label: "Categories", icon: Shapes, badgeKey: null },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3, badgeKey: null },
  { href: "/dashboard/admin/events", label: "Product events", icon: Activity, badgeKey: null },
  { href: "/dashboard/admin/ai", label: "AI Studio", icon: Sparkles, badgeKey: null },
  { href: "/dashboard/admin/recovery", label: "Recovery", icon: KeyRound, badgeKey: null },
  { href: "/dashboard/admin/profile", label: "Profile", icon: UserRound, badgeKey: null },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/admin") return pathname === href;
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
  badges: AdminNavBadges;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin">
      <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        Manage
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
                aria-label={`${count} pending`}
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

function UserCard({ name, email }: { name: string; email: string }) {
  return (
    <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
      <p className="truncate text-sm font-semibold">{name}</p>
      <p className="truncate text-xs text-white/55">{email}</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] hover:underline"
      >
        ← Back to store
      </Link>
    </div>
  );
}

export function AdminNav({
  name,
  email,
  badges = { orders: 0, approvals: 0, products: 0 },
}: {
  name: string;
  email: string;
  badges?: AdminNavBadges;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  const totalAttention = badges.orders + badges.approvals + badges.products;

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <BrandLogo
            href="/dashboard/admin"
            size="sm"
            showWordmark={false}
            className="relative"
            badge={
              totalAttention > 0 ? (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-white" />
              ) : null
            }
          />
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Admin
            </p>
            <p className="truncate text-sm font-semibold">{current?.label ?? "Dashboard"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--foreground)]"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
          {totalAttention > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
              {totalAttention > 9 ? "9+" : totalAttention}
            </span>
          ) : null}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-[var(--z-drawer)] lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute inset-y-0 left-0 flex w-[17.5rem] max-w-[88vw] flex-col bg-[#171719] text-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4">
              <BrandLogo
                href="/"
                size="md"
                theme="dark"
                wordmark="SuperTech"
                sublabel="Admin"
                onClick={() => setOpen(false)}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
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
              <UserCard name={name} email={email} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop sticky sidebar */}
      <aside className="dashboard-sidebar sticky top-0 hidden h-dvh w-[15.75rem] shrink-0 flex-col self-start border-r border-white/8 bg-[#171719] text-white lg:flex">
        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <BrandLogo
            href="/"
            size="md"
            theme="dark"
            wordmark="SuperTech"
            sublabel="Admin console"
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
          <UserCard name={name} email={email} />
        </div>
      </aside>
    </>
  );
}
