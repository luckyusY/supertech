"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Plus, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { getVendorBySlug, type Product } from "@/lib/marketplace";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppHref } from "@/lib/whatsapp";

type AppProductCardProps = {
  product: Product;
};

export function AppProductCard({ product }: AppProductCardProps) {
  const vendor = getVendorBySlug(product.vendorSlug);
  const { addItem } = useCart();
  const vendorName = vendor?.name ?? product.vendorSlug;
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : null;
  const whatsappHref = getWhatsAppHref(
    vendor?.whatsappNumber ?? product.vendorWhatsAppNumber,
    `Hello ${vendorName}, I am interested in ${product.name} on SuperTech.`,
  );

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      vendorSlug: product.vendorSlug,
      vendorName,
      heroImage: product.heroImage,
      price: product.price,
      badge: product.badge,
      accent: product.accent,
    });

    toast.success("Added to cart", {
      description: product.name,
      duration: 1800,
    });
  }

  return (
    <article className="min-w-[11rem] overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_8px_22px_rgba(16,32,25,0.08)]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[1.05] overflow-hidden bg-[#f4f5f3]">
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="176px"
          />
          <div className="absolute left-2 top-2 flex gap-1">
            {discount ? (
              <span className="rounded bg-[#102019] px-2 py-1 text-[10px] font-black text-white">
                -{discount}%
              </span>
            ) : null}
            <span className="max-w-[6.5rem] truncate rounded bg-white/92 px-2 py-1 text-[10px] font-bold text-[#102019]">
              {product.badge}
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#6a756f]">
            {vendorName}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5 text-[#102019]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-black text-[#102019]">
                {formatPrice(product.price)}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6a756f]">
                <Star className="h-3 w-3 fill-[#f4c95d] text-[#f4c95d]" />
                {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="grid grid-cols-[1fr_44px] gap-2 border-t border-black/6 p-2">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#f68b1e] px-3 text-xs font-black text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          Add
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#1fae5b] text-white"
          aria-label={`Chat with ${vendorName}`}
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

export function AppRequestButton() {
  return (
    <Link
      href="/request-product"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#102019] px-4 text-sm font-black text-white"
    >
      <Plus className="h-4 w-4" />
      Request item
    </Link>
  );
}
