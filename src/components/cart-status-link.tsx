"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type CartStatusLinkProps = {
  compact?: boolean;
};

export function CartStatusLink({ compact = false }: CartStatusLinkProps) {
  const { itemCount } = useCart();

  if (compact) {
    return (
      <Link
        href="/cart"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/55 bg-white text-[var(--foreground)] shadow-sm"
        aria-label={`Cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[var(--foreground)] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-md border border-white/55 bg-white px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm"
    >
      <ShoppingBag className="h-4 w-4" />
      Cart
      <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[11px] text-white">
        {itemCount > 99 ? "99+" : itemCount}
      </span>
    </Link>
  );
}
