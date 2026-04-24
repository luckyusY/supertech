"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { getVendorBySlug, type Product } from "@/lib/marketplace";
import { formatPrice } from "@/lib/utils";

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{
        duration: 0.35,
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-md border border-[#e4e4e7] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(0,0,0,0.12)] sm:rounded-lg"
    >
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10 rounded-md sm:rounded-lg"
        aria-label={`View ${product.name}`}
      />

      <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f7f7] sm:aspect-square">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 45vw"
        />

        <div className="absolute left-1.5 right-10 top-1.5 z-20 flex flex-nowrap gap-1 overflow-hidden sm:left-2 sm:right-11 sm:top-2 sm:gap-1.5">
          {discount ? (
            <span className="shrink-0 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] sm:px-2 sm:py-1 sm:text-[11px]">
              -{discount}%
            </span>
          ) : null}
          <span className="min-w-0 truncate rounded bg-white/92 px-1.5 py-0.5 text-[9px] font-semibold text-[var(--foreground)] shadow-sm sm:px-2 sm:py-1 sm:text-[10px]">
            {product.badge}
          </span>
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-1.5 top-1.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-white/92 shadow-sm transition-colors sm:right-2 sm:top-2 ${
            wishlisted
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-white/80 text-[var(--muted)] hover:text-[var(--accent)]"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[10px] sm:tracking-[0.18em]">
          {vendor?.name ?? "SuperTech"}
        </p>
        <h3 className="mt-1 min-h-[2.5rem] break-words line-clamp-2 text-[13px] font-medium leading-5 text-[var(--foreground)] sm:min-h-[2.75rem] sm:text-sm">
          {product.name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:mt-2 sm:gap-x-2">
          <span className="text-base font-bold text-[var(--foreground)] sm:text-lg sm:tracking-[-0.03em]">
            {formatPrice(product.price)}
          </span>
          {product.compareAt ? (
            <span className="text-[11px] text-[var(--muted)] line-through sm:text-xs">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
        </div>

        {product.compareAt ? (
          <p className="mt-0.5 truncate text-[10px] text-[var(--muted)] sm:mt-1 sm:text-[11px]">
            You save {formatPrice(product.compareAt - product.price)}
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[10px] text-[var(--muted)] sm:mt-1 sm:text-[11px]">{product.stockLabel}</p>
        )}

        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted)] sm:mt-2 sm:text-xs">
          <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          <span>{product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}</span>
          <span>({product.reviewCount})</span>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          className="relative z-20 mt-2.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] sm:mt-3 sm:h-auto sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm"
        >
          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add to cart</span>
        </button>
      </div>
    </motion.article>
  );
}
