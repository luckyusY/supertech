"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/cart-provider";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/catalog", icon: Grid3X3 },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Account", href: "/sign-in", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden">
      <div className="border-t border-[var(--line)] bg-white shadow-[0_-4px_18px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-1.5 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const isCart = item.href === "/cart";

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <span className={`relative flex h-9 w-9 items-center justify-center rounded-md transition-all ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)]"
                }`}>
                  <item.icon className="h-5 w-5" />
                  {isCart && itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--red)] text-[9px] font-bold text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-medium ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
