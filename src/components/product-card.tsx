"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Truck } from "lucide-react";
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
      duration: 2500,
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.42,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.94))] shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
    >
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10 rounded-[1.7rem]"
        aria-label={`View ${product.name}`}
      />

      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${product.accent}, rgba(255,255,255,0.9))`,
        }}
      />

      <div className="relative aspect-[4/4.15] overflow-hidden bg-[rgba(15,23,42,0.03)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at top right, ${product.accent}22 0%, transparent 45%)`,
          }}
        />

        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: product.accent }}
          >
            {product.badge}
          </span>
          {discount ? (
            <span className="rounded-full bg-[var(--foreground)] px-2.5 py-1 text-[11px] font-semibold text-white">
              Save {discount}%
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-200 ${
            wishlisted
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-white/40 bg-white/82 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-white" : ""}`} />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-0 transition-transform duration-300 sm:translate-y-full sm:group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 bg-[var(--foreground)] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)]"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-4 pt-3.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
          {vendor?.name ?? "SuperTech"}
        </p>
        <h3 className="mt-1 font-semibold leading-snug tracking-[-0.02em]">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
          {product.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(15,23,42,0.05)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]">
            {product.stockLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(37,99,235,0.08)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent)]">
            <Truck className="h-3 w-3" />
            {product.shipWindow}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xl font-semibold tracking-[-0.04em]">
              {formatPrice(product.price)}
            </p>
            {product.compareAt ? (
              <p className="text-xs text-[var(--muted)]">
                <span className="line-through">{formatPrice(product.compareAt)}</span>
              </p>
            ) : (
              <p className="text-xs text-[var(--muted)]">Fresh catalog pick</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
            <Star className="h-3 w-3 fill-[var(--accent)]" />
            {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
