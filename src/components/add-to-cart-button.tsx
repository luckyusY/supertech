"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/utils";

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
    if (!didAdd) return;
    const t = window.setTimeout(() => setDidAdd(false), 2000);
    return () => window.clearTimeout(t);
  }, [didAdd]);

  function handleAddToCart() {
    addItem(item);
    setDidAdd(true);
    toast.success(`${item.name} added to cart`, {
      description: `${formatPrice(item.price)} · from ${item.vendorName}`,
      duration: 2500,
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleAddToCart}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${
          didAdd
            ? "bg-[rgba(26,123,112,0.12)] text-[var(--teal)]"
            : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white"
        }`}
      >
        {didAdd ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {didAdd ? "Added to cart" : "Add to cart"}
      </button>
      {didAdd && (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold hover:bg-[var(--foreground)] hover:text-white transition-colors"
        >
          View cart
        </Link>
      )}
    </div>
  );
}
