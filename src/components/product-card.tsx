"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { ProductCardGallery } from "@/components/product-card-gallery";
import { useCart } from "@/components/cart-provider";
import { getVendorBySlug, type Product } from "@/lib/marketplace";
import { buildBuyBoxPlan, getMarketplaceMode, isBigTicketMode } from "@/lib/product-rules";
import { cn, formatPrice } from "@/lib/utils";
import { getWhatsAppHref } from "@/lib/whatsapp";

type ProductCardProps = {
  product: Product;
  index?: number;
};

const WISHLIST_KEY = "supertech.wishlist";

function readWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeWishlist(slugs: string[]) {
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(slugs));
}

/**
 * Retail-first product card with multi-image Swiper + Framer Motion.
 */
export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const reduceMotion = useReducedMotion();
  const vendor = getVendorBySlug(product.vendorSlug);
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const mode = getMarketplaceMode(product.category);
  const bigTicket = isBigTicketMode(mode);
  const plan = buildBuyBoxPlan({
    category: product.category,
    productSlug: product.slug,
    stockLabel: product.stockLabel,
    vendorSlug: product.vendorSlug,
  });

  const galleryImages = useMemo(() => {
    const list = [product.heroImage, ...(product.gallery ?? [])];
    return list;
  }, [product.gallery, product.heroImage]);

  useEffect(() => {
    setWishlisted(readWishlist().includes(product.slug));
  }, [product.slug]);

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
      description: `${formatPrice(product.price)} · from ${vendor?.name ?? "SuperTech"}`,
      duration: 2400,
    });
  }

  function handleWishlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const current = readWishlist();
    const next = wishlisted
      ? current.filter((slug) => slug !== product.slug)
      : [...new Set([...current, product.slug])];
    writeWishlist(next);
    setWishlisted(!wishlisted);
    toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist", {
      duration: 1800,
    });
  }

  const discount =
    !bigTicket && product.compareAt && product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : null;
  const vendorName = vendor?.name ?? product.vendorSlug;
  const whatsappHref = getWhatsAppHref(
    vendor?.whatsappNumber ?? product.vendorWhatsAppNumber,
    `Hello ${vendorName}, I am interested in ${product.name} on SuperTech.`,
  );
  const orderHref = plan.primary.href ?? `/order?product=${encodeURIComponent(product.slug)}`;
  const primaryLabel = plan.showAddToCart
    ? "Add to cart"
    : bigTicket
      ? "Enquire"
      : "Request";

  return (
    <motion.article
      data-reveal-item
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-10px", amount: 0.15 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index, 10) * 0.03,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
              transition: { type: "spring", stiffness: 420, damping: 28 },
            }
      }
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-md)]",
        "border border-[var(--line)] bg-[var(--surface)]",
        "shadow-[var(--elevation-0)] transition-[box-shadow,border-color] duration-200",
        "hover:border-[rgba(232,119,10,0.28)] hover:shadow-[var(--elevation-2)]",
      )}
    >
      {/* Media — Swiper when gallery has multiple images */}
      <div className="relative">
        <ProductCardGallery
          images={galleryImages}
          alt={product.name}
          href={`/products/${product.slug}`}
        />

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[70%] flex-col items-start gap-1">
          {discount ? (
            <motion.span
              initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
              className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-2 py-0.5 text-[11px] font-bold tabular-nums text-white shadow-sm"
            >
              -{discount}%
            </motion.span>
          ) : null}
          {bigTicket ? (
            <span className="rounded-[var(--radius-sm)] bg-[var(--info)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-sm">
              {mode === "motors" ? "Motors" : "Property"}
            </span>
          ) : product.badge ? (
            <span className="max-w-full truncate rounded-[var(--radius-sm)] bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground)] shadow-sm">
              {product.badge}
            </span>
          ) : null}
        </div>

        <motion.button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          whileTap={reduceMotion ? undefined : { scale: 0.88 }}
          className={cn(
            "absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full",
            "border border-black/5 bg-white/95 shadow-sm backdrop-blur-sm transition-colors",
            wishlisted
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--accent)]",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-current")} />
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2.5 sm:px-3 sm:pb-3 sm:pt-3">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <span className="min-w-0 truncate font-medium">{vendorName}</span>
          <span className="shrink-0 text-[var(--line)]" aria-hidden>
            ·
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-[var(--foreground)]">
            <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
            {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="mt-1.5 block min-h-[2.5rem]">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.01em] text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)] sm:text-sm sm:leading-5">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-[1.05rem] font-bold tabular-nums tracking-[-0.03em] text-[var(--foreground)] sm:text-lg">
              {formatPrice(product.price)}
            </span>
            {bigTicket ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                asking
              </span>
            ) : null}
            {product.compareAt && product.compareAt > product.price && !bigTicket ? (
              <span className="text-xs tabular-nums text-[var(--muted)] line-through">
                {formatPrice(product.compareAt)}
              </span>
            ) : null}
          </div>
          {!bigTicket && discount ? (
            <p className="mt-0.5 text-[11px] font-medium text-[var(--success)]">
              Save {formatPrice((product.compareAt ?? 0) - product.price)}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">{product.stockLabel}</p>
          )}
        </div>

        <div className="mt-auto flex gap-1.5 pt-3">
          {plan.showAddToCart ? (
            <motion.button
              type="button"
              onClick={handleQuickAdd}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              className={cn(
                "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)]",
                "bg-[var(--accent)] px-2 text-xs font-bold text-white",
                "transition-colors hover:bg-[var(--accent-hover)]",
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{primaryLabel}</span>
            </motion.button>
          ) : (
            <Link
              href={orderHref}
              className={cn(
                "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)]",
                "bg-[var(--accent)] px-2 text-xs font-bold text-white",
                "transition-colors hover:bg-[var(--accent-hover)] active:scale-[0.98]",
              )}
            >
              <span className="truncate">{primaryLabel}</span>
            </Link>
          )}
          <motion.a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat with ${vendorName} on WhatsApp about ${product.name}`}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]",
              "border border-[var(--line)] bg-[var(--surface)] text-[#128C7E]",
              "transition-colors hover:border-[#128C7E]/40 hover:bg-[#e8f8f1]",
            )}
          >
            <MessageCircle className="h-4 w-4" />
          </motion.a>
        </div>
      </div>
    </motion.article>
  );
}
