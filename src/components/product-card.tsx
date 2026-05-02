"use client";

import { Heart, MessageCircle, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { getVendorBySlug, type Product } from "@/lib/marketplace";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppHref } from "@/lib/whatsapp";

type ProductCardProps = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const vendor = getVendorBySlug(product.vendorSlug);
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  function handleQuickAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    addItem({
      slug: product.slug,
      name: product.name,
      vendorSlug: product.vendorSlug,
      vendorName: vendor?.name ?? product.vendorSlug,
      heroImage: product.heroImage,
      price: product.price,
      badge: product.badge,
      accent: product.accent,
    });

    toast.success(`${product.name} added to cart`, {
      description: `${formatPrice(product.price)} - from ${vendor?.name ?? "SuperTech"}`,
      duration: 2400,
    });
  }

  function handleWishlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setWishlisted((value) => !value);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", {
      duration: 1800,
    });
  }

  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : null;
  const vendorName = vendor?.name ?? product.vendorSlug;
  const whatsappHref = getWhatsAppHref(
    vendor?.whatsappNumber ?? product.vendorWhatsAppNumber,
    `Hello ${vendorName}, I am interested in ${product.name} on SuperTech.`,
  );
  const hasRating = product.reviewCount > 0;

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-sm transition-all duration-200 motion-safe:animate-[fade-in-up_0.35s_ease-out_backwards] hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.18)]"
    >
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        aria-label={`View ${product.name}`}
      />

      <div className="relative aspect-square overflow-hidden bg-[#f7f7f7]">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 45vw"
        />

        {discount ? (
          <span className="absolute left-2 top-2 z-20 rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-white shadow-sm sm:px-2 sm:text-[11px]">
            -{discount}%
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-all hover:scale-110 ${
            wishlisted ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--accent)]"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {product.badge ? (
          <span className="absolute bottom-2 left-2 z-20 max-w-[calc(100%-1rem)] truncate rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:text-[10px]">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {vendor?.name ?? "SuperTech"}
        </p>

        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] break-words text-[13px] font-medium leading-5 text-[var(--foreground)] sm:min-h-[2.75rem] sm:text-sm">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted)] sm:text-xs">
          <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          <span className="font-medium text-[var(--foreground)]">
            {hasRating ? product.rating.toFixed(1) : "New"}
          </span>
          {hasRating ? <span>({product.reviewCount})</span> : null}
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-tight text-[var(--foreground)] sm:text-lg">
              {formatPrice(product.price)}
            </span>
            {product.compareAt ? (
              <span className="text-[11px] text-[var(--muted)] line-through sm:text-xs">
                {formatPrice(product.compareAt)}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 truncate text-[10px] text-[var(--muted)] sm:text-[11px]">
            {product.compareAt
              ? `Save ${formatPrice(product.compareAt - product.price)}`
              : product.stockLabel}
          </p>

          <div className="relative z-20 mt-2.5 flex gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-2 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.98] sm:text-sm"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="truncate">Add to cart</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat with ${vendorName} on WhatsApp about ${product.name}`}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1fae5b] text-white transition-colors hover:bg-[#178d49] active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
