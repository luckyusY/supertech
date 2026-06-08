"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  Palette,
  ShoppingBag,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/vendor/products", label: "Products", icon: Package },
  { href: "/dashboard/vendor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/vendor/ai", label: "AI SEO Studio", icon: Sparkles },
  { href: "/dashboard/vendor/storefront", label: "Storefront", icon: Palette },
  { href: "/dashboard/vendor/payments", label: "Payment method", icon: CreditCard },
  { href: "/dashboard/vendor/payouts", label: "Payouts", icon: Wallet },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/vendor") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-[0.85rem] px-3.5 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-[var(--accent)] text-white shadow-[0_6px_16px_rgba(246,139,30,0.32)]"
                : "text-[rgba(255,255,255,0.66)] hover:bg-white/8 hover:text-white"
            }`}
          >
            <item.icon
              className={`h-[1.05rem] w-[1.05rem] shrink-0 ${
                active ? "text-white" : "text-[rgba(255,255,255,0.5)] group-hover:text-white"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function VendorNav({ storeName, subtitle }: { storeName: string; subtitle: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-[var(--accent)] text-xs font-bold tracking-[0.12em] text-white">
            {storeName.slice(0, 2).toUpperCase()}
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Seller
            </p>
            <p className="text-sm font-semibold">{current?.label ?? "Dashboard"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] border border-[var(--line)] text-[var(--foreground)]"
          aria-label="Open seller menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col bg-[#1f1f21] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-[var(--accent)] text-xs font-bold tracking-[0.12em] text-white">
                  {storeName.slice(0, 2).toUpperCase()}
                </span>
                <p className="truncate text-sm font-semibold">{storeName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-auto rounded-[0.85rem] border border-white/10 bg-white/5 px-3.5 py-3">
              <p className="truncate text-sm font-semibold">{storeName}</p>
              <p className="truncate text-xs text-white/55">{subtitle}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-[16.5rem] shrink-0 flex-col self-stretch bg-[#1f1f21] p-5 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-[var(--accent)] text-xs font-bold tracking-[0.12em] text-white">
            {storeName.slice(0, 2).toUpperCase()}
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Seller workspace
            </p>
            <p className="truncate text-sm font-semibold">{storeName}</p>
          </div>
        </Link>

        <div className="mt-7 flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </div>

        <div className="mt-4 rounded-[0.85rem] border border-white/10 bg-white/5 px-3.5 py-3">
          <p className="truncate text-sm font-semibold">{storeName}</p>
          <p className="truncate text-xs text-white/55">{subtitle}</p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] hover:underline"
          >
            ← Back to store
          </Link>
        </div>
      </aside>
    </>
  );
}
