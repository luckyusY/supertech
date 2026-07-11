"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Home, PackageSearch, ShoppingCart, Store } from "lucide-react";
import { useCart } from "@/components/cart-provider";

const tabs = [
  { label: "Home", href: "/app", icon: Home },
  { label: "Shop", href: "/app/shop", icon: Grid3X3 },
  { label: "Vendors", href: "/app/vendors", icon: Store },
  { label: "Track", href: "/app/track", icon: PackageSearch },
  { label: "Cart", href: "/app/cart", icon: ShoppingCart },
] as const;

export function AppBottomTabs() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[var(--z-header)] border-t border-[var(--line)] bg-[var(--surface)]/96 px-2 pb-safe shadow-[var(--elevation-2)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 py-1.5">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || (tab.href !== "/app" && pathname.startsWith(tab.href));
          const isCart = tab.href === "/app/cart";

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className="app-tap relative flex min-w-0 flex-col items-center gap-0.5 px-1 py-1"
            >
              <span
                className={`relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {isCart && itemCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-bold text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                ) : null}
              </span>
              <span
                className={`truncate text-[10px] font-semibold ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
