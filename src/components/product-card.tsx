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
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View ${product.name}`}
      />

      <div className="relative aspect-[4/4.15] overflow-hidden bg-[var(--background)]">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
        />

        <div className="absolute left-2 top-2 z-20 flex flex-wrap gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: product.accent }}
          >
            {product.badge}
          </span>
          {discount ? (
            <span className="rounded-full bg-[var(--red)] px-2 py-0.5 text-[10px] font-semibold text-white">
              -{discount}%
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-200 ${
            wishlisted
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-white/60 bg-white/90 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Always visible add to cart on mobile */}
        <div className="absolute inset-x-0 bottom-0 z-20 sm:translate-y-full sm:group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-1.5 bg-[var(--accent)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {vendor?.name ?? "SuperTech"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-[var(--accent)]">
            {formatPrice(product.price)}
          </span>
          {product.compareAt ? (
            <span className="text-xs text-[var(--muted)] line-through">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
            {product.stockLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            <Truck className="h-3 w-3" />
            {product.shipWindow}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
            <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
            {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
