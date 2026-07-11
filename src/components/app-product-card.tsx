"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { getVendorBySlug, type Product } from "@/lib/marketplace";
import { buildBuyBoxPlan, isBigTicketMode, getMarketplaceMode } from "@/lib/product-rules";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppHref } from "@/lib/whatsapp";

type AppProductCardProps = {
  product: Product;
};

export function AppProductCard({ product }: AppProductCardProps) {
  const vendor = getVendorBySlug(product.vendorSlug);
  const { addItem } = useCart();
  const vendorName = vendor?.name ?? product.vendorSlug;
  const mode = getMarketplaceMode(product.category);
  const bigTicket = isBigTicketMode(mode);
  const plan = buildBuyBoxPlan({
    category: product.category,
    productSlug: product.slug,
    stockLabel: product.stockLabel,
    vendorSlug: product.vendorSlug,
  });
  const discount =
    !bigTicket && product.compareAt
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : null;
  const whatsappHref = getWhatsAppHref(
    vendor?.whatsappNumber ?? product.vendorWhatsAppNumber,
    `Hello ${vendorName}, I am interested in ${product.name} on SuperTech.`,
  );
  const orderHref = plan.primary.href ?? `/order?product=${encodeURIComponent(product.slug)}`;

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
    <article className="flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-1)]">
      <Link href={`/products/${product.slug}`} className="block transition active:opacity-90">
        <div className="relative aspect-[1.05] overflow-hidden bg-[var(--neutral-50)]">
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="176px"
          />
          <div className="absolute left-2 top-2 flex gap-1">
            {discount ? (
              <span className="rounded bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-bold text-[var(--accent)]">
                -{discount}%
              </span>
            ) : null}
            {bigTicket ? (
              <span className="rounded bg-[var(--info-soft)] px-2 py-1 text-[10px] font-bold text-[var(--info)]">
                {mode === "motors" ? "Motors" : "Property"}
              </span>
            ) : null}
            <span className="max-w-[6.5rem] truncate rounded bg-white/92 px-2 py-1 text-[10px] font-semibold text-[var(--foreground)]">
              {product.badge}
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {vendorName}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--foreground)]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[var(--foreground)]">
                {formatPrice(product.price)}
                {bigTicket ? (
                  <span className="ml-1 text-[10px] font-semibold uppercase text-[var(--muted)]">
                    asking
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--muted)]">
                <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-auto grid grid-cols-[1fr_44px] gap-2 border-t border-[var(--line)] p-2">
        {plan.showAddToCart ? (
          <button
            type="button"
            onClick={handleAdd}
            className="app-tap inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 text-xs font-bold text-white hover:bg-[var(--accent-hover)]"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </button>
        ) : (
          <Link
            href={orderHref}
            className="app-tap inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 text-xs font-bold text-white hover:bg-[var(--accent-hover)]"
          >
            {bigTicket ? "Enquire" : "Request"}
          </Link>
        )}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="app-tap grid h-10 place-items-center rounded-[var(--radius-sm)] bg-[#1fae5b] text-white"
          aria-label={`Chat about ${product.name}`}
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
      className="app-tap inline-flex h-9 items-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-3 text-xs font-bold text-[var(--accent)]"
    >
      Request
    </Link>
  );
}
