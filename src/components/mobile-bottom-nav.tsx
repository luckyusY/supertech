"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, PackageSearch, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

/** Photo Factory–style 5-tab mobile dock */
const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/catalog", icon: Grid3X3 },
  { label: "Request", href: "/request-product", icon: PackageSearch },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Account", href: "/account", icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[var(--z-header)] sm:hidden">
      <div className="border-t border-[var(--line)] bg-[var(--background-strong)] text-white shadow-[0_-6px_24px_rgba(0,0,0,0.18)]">
        <div className="grid grid-cols-5 px-1 py-1 pb-safe">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const isCart = item.href === "/cart";
            const isShop = item.href === "/catalog";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-semibold",
                  isActive ? "text-[var(--gold)]" : "text-white/70",
                  isShop && isActive && "border-t-[3px] border-[var(--gold)] pt-[3px]",
                )}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {isCart && itemCount > 0 ? (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent)] px-0.5 text-[9px] font-bold text-white">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
