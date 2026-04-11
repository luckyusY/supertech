"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type AddToCartButtonProps = {
  item: {
    slug: string;
    name: string;
    vendorSlug: string;
    vendorName: string;
    heroImage: string;
    price: number;
    badge: string;
    accent: string;
  };
};

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [didAdd, setDidAdd] = useState(false);

  useEffect(() => {
    if (!didAdd) {
      return;
    }

    const timeout = window.setTimeout(() => setDidAdd(false), 1800);

    return () => window.clearTimeout(timeout);
  }, [didAdd]);

  function handleAddToCart() {
    addItem(item);
    setDidAdd(true);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleAddToCart}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
          didAdd
            ? "bg-[rgba(26,123,112,0.14)] text-[var(--teal)]"
            : "border border-[var(--line)] bg-white text-[var(--foreground)]"
        }`}
      >
        {didAdd ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {didAdd ? "Added to cart" : "Add to quote cart"}
      </button>
      {didAdd ? (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
        >
          View cart
        </Link>
      ) : null}
    </div>
  );
}
