"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
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

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
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
      description: `${formatPrice(product.price)} · from ${vendor?.name ?? "SuperTech"}`,
      duration: 2500,
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((v) => !v);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", { duration: 1800 });
  }

  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.42, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.08]"
      >
        {/* Image area */}
        <div className="relative aspect-[4/4.2] overflow-hidden bg-[rgba(15,23,42,0.03)]">
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
          />

          {/* Category badge */}
          <div
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: product.accent }}
          >
            {product.badge}
          </div>

          {/* Discount tag */}
          {discount && (
            <div className="absolute right-3 top-3 rounded-full bg-[var(--foreground)] px-2.5 py-0.5 text-[11px] font-bold text-white">
              -{discount}%
            </div>
          )}

          {/* Wishlist button */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute right-3 bottom-14 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all duration-200 sm:bottom-[calc(100%_-_3rem)] sm:right-3 sm:top-auto ${
              wishlisted
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-white/40 bg-white/80 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-white" : ""}`} />
          </button>

          {/* Quick-add — always visible on mobile, slide up on desktop */}
          <div className="absolute inset-x-0 bottom-0 translate-y-0 transition-transform duration-300 sm:translate-y-full sm:group-hover:translate-y-0">
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

        {/* Info */}
        <div className="flex flex-1 flex-col p-4 pt-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {vendor?.name ?? "SuperTech"}
          </p>
          <h3 className="mt-1 font-semibold leading-snug tracking-[-0.02em]">{product.name}</h3>

          <div className="mt-auto flex items-end justify-between pt-3">
            <div>
              <p className="text-xl font-semibold tracking-[-0.04em]">{formatPrice(product.price)}</p>
              {product.compareAt && (
                <p className="text-xs text-[var(--muted)] line-through">{formatPrice(product.compareAt)}</p>
              )}
            </div>
            <span className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
              <Star className="h-3 w-3 fill-[var(--accent)]" />
              {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
