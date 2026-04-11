"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function CartStatusLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
    >
      <ShoppingBag className="h-4 w-4" />
      Cart
      <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-xs text-white">
        {itemCount}
      </span>
    </Link>
  );
}
