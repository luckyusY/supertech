"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/utils";

export function AppCartPanel() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <section className="rounded-lg bg-white p-6 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-10 w-10 text-[#f68b1e]" />
        <h2 className="mt-3 text-xl font-black">Your cart is empty</h2>
        <p className="mt-2 text-sm leading-6 text-[#66736b]">
          Add products from the app shop and they will appear here.
        </p>
        <Link
          href="/app/shop"
          className="mt-5 inline-flex h-12 items-center justify-center rounded-lg bg-[#102019] px-5 text-sm font-black text-white"
        >
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#66736b]">
          {itemCount} items
        </p>
        <h2 className="mt-1 text-2xl font-black">{formatPrice(subtotal)}</h2>
      </section>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.slug} className="flex gap-3 rounded-lg bg-white p-3 shadow-sm">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f3f6f2]">
              <Image src={item.heroImage} alt={item.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-black leading-5">{item.name}</p>
              <p className="mt-1 text-xs font-bold text-[#66736b]">{item.vendorName}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-black">{formatPrice(item.price * item.quantity)}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                    className="grid h-8 w-8 place-items-center rounded-md bg-[#f3f6f2]"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="grid h-8 min-w-8 place-items-center px-1 text-sm font-black">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                    className="grid h-8 w-8 place-items-center rounded-md bg-[#f3f6f2]"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="grid h-8 w-8 place-items-center rounded-md bg-[#fde7ea] text-[#f04438]"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Link
        href="/order"
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#f68b1e] text-sm font-black text-white"
      >
        Continue checkout
      </Link>
    </div>
  );
}
