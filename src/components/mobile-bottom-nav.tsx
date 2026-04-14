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
      {/* Blur backdrop */}
      <div className="border-t border-[var(--line)] bg-white/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const isCart = item.href === "/cart";

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-1 px-4 py-1.5"
              >
                <span className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-[var(--foreground)] text-white scale-105"
                    : "text-[var(--muted)]"
                }`}>
                  <item.icon className="h-5 w-5" />
                  {isCart && itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
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
