"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { toast } from "sonner";
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

export function ProductCard({ product, index = 0 }: ProductCardProps) {
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

  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : null;
  const vendorName = vendor?.name ?? product.vendorSlug;
  const whatsappHref = getWhatsAppHref(
    vendor?.whatsappNumber ?? product.vendorWhatsAppNumber,
    `Hello ${vendorName}, I am interested in ${product.name} on SuperTech.`,
  );
  const orderHref = plan.primary.href ?? `/order?product=${encodeURIComponent(product.slug)}`;

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
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--line)] bg-white transition-shadow duration-200 hover:shadow-[var(--elevation-2)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--neutral-50)]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" tabIndex={-1}>
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 45vw"
          />
        </Link>

        <div className="pointer-events-none absolute left-1.5 right-10 top-1.5 z-10 flex flex-nowrap gap-1 overflow-hidden sm:left-2 sm:right-11 sm:top-2">
          {discount && !bigTicket ? (
            <span className="shrink-0 rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] sm:px-2 sm:py-1 sm:text-[11px]">
              -{discount}%
            </span>
          ) : null}
          {bigTicket ? (
            <span className="shrink-0 rounded bg-[var(--info-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--info)] sm:px-2 sm:py-1 sm:text-[11px]">
              {mode === "motors" ? "Motors" : "Property"}
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
          className={cn(
            "absolute right-1.5 top-1.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-white/92 shadow-sm transition-colors sm:right-2 sm:top-2",
            wishlisted
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-white/80 text-[var(--muted)] hover:text-[var(--accent)]",
          )}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[10px] sm:tracking-[0.14em]">
          {vendorName}
        </p>
        <Link href={`/products/${product.slug}`} className="mt-1">
          <h3 className="min-h-[2.5rem] line-clamp-2 text-[13px] font-medium leading-5 text-[var(--foreground)] hover:text-[var(--accent)] sm:min-h-[2.75rem] sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:mt-2">
          <span className="text-base font-bold tracking-[-0.02em] text-[var(--foreground)] sm:text-lg">
            {formatPrice(product.price)}
            {bigTicket ? (
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                asking
              </span>
            ) : null}
          </span>
          {product.compareAt && !bigTicket ? (
            <span className="text-[11px] text-[var(--muted)] line-through sm:text-xs">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-[10px] text-[var(--muted)] sm:text-[11px]">
          {bigTicket
            ? product.stockLabel
            : product.compareAt
              ? `You save ${formatPrice(product.compareAt - product.price)}`
              : product.stockLabel}
        </p>

        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted)] sm:mt-2 sm:text-xs">
          <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
          <span>{product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}</span>
          <span>({product.reviewCount})</span>
        </div>

        {/* Actions are real controls — not covered by a full-card link */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">
          {plan.showAddToCart ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex h-9 min-w-0 items-center justify-center gap-1 rounded-[var(--radius-sm)] bg-[var(--accent)] px-2 text-[11px] font-bold text-white transition-colors hover:bg-[var(--accent-hover)] sm:text-xs"
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Add</span>
            </button>
          ) : (
            <Link
              href={orderHref}
              className="inline-flex h-9 min-w-0 items-center justify-center gap-1 rounded-[var(--radius-sm)] bg-[var(--accent)] px-2 text-[11px] font-bold text-white transition-colors hover:bg-[var(--accent-hover)] sm:text-xs"
            >
              <span className="truncate">{bigTicket ? "Enquire" : "Request"}</span>
            </Link>
          )}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat with ${vendorName} on WhatsApp about ${product.name}`}
            className="inline-flex h-9 min-w-0 items-center justify-center gap-1 rounded-[var(--radius-sm)] bg-[#1fae5b] px-2 text-[11px] font-bold text-white transition-colors hover:bg-[#178d49] sm:text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Chat</span>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
