"use client";

import Link from "next/link";
import { MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { MomoPayCard } from "@/components/momo-pay-card";
import { Badge, Button, Price } from "@/components/ui";
import { trackEvent } from "@/lib/client-analytics";
import { buildBuyBoxPlan, MODE_LABELS } from "@/lib/product-rules";
import type { Product } from "@/lib/marketplace";
import { cn } from "@/lib/utils";

export type ProductBuyBoxProps = {
  product: Product;
  vendorName: string;
  vendorSlug?: string;
  whatsappHref: string;
  momo: {
    merchantCode: string;
    businessName: string;
    dialCode: string;
  };
  ratingLabel: string;
};

export function ProductBuyBox({
  product,
  vendorName,
  vendorSlug,
  whatsappHref,
  momo,
  ratingLabel,
}: ProductBuyBoxProps) {
  const plan = buildBuyBoxPlan({
    category: product.category,
    productSlug: product.slug,
    stockLabel: product.stockLabel,
    vendorSlug: vendorSlug ?? product.vendorSlug,
  });

  const cartItem = {
    slug: product.slug,
    name: product.name,
    vendorSlug: product.vendorSlug,
    vendorName,
    heroImage: product.heroImage,
    price: product.price,
    badge: product.badge,
    accent: product.accent,
  };

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {product.category}
            </p>
            <Badge variant="brand">{MODE_LABELS[plan.mode]}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-[-0.03em] sm:text-4xl sm:tracking-[-0.05em]">
            {product.name}
          </h1>

          <Price
            value={product.price}
            compareAt={product.compareAt}
            size="lg"
            layout={plan.priceLayout}
            className="mt-5 sm:mt-6"
          />

          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            <span
              className="rounded-full px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm"
              style={{ backgroundColor: product.accent }}
            >
              {product.badge}
            </span>
            <Badge variant="neutral">{product.stockLabel}</Badge>
            <Badge variant="neutral">{ratingLabel}</Badge>
          </div>
        </div>

        {/* How buying works */}
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--neutral-50)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            How buying works
          </p>
          <p className="mt-1.5 text-sm leading-6 text-[var(--foreground)]">{plan.howItWorks}</p>
        </div>

        {/* Primary + secondary actions */}
        <div className="grid gap-3">
          {plan.primary.href ? (
            <Link
              href={plan.primary.href}
              className="block w-full"
              onClick={() =>
                trackEvent("pdp_primary_cta", {
                  product: product.slug,
                  mode: plan.mode,
                  action: plan.primary.action,
                  label: plan.primary.label,
                })
              }
            >
              <Button variant="primary" size="lg" fullWidth className="sm:w-auto sm:min-w-[12rem]">
                {plan.primary.label}
              </Button>
            </Link>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {plan.showAddToCart ? (
              <AddToCartButton item={cartItem} className="w-full sm:w-auto" />
            ) : null}

            {plan.secondary?.action === "whatsapp" || plan.tertiary?.action === "whatsapp" ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with ${vendorName} on WhatsApp about ${product.name}`}
                className="inline-flex w-full sm:w-auto"
                onClick={() =>
                  trackEvent("pdp_whatsapp", {
                    product: product.slug,
                    mode: plan.mode,
                    vendor: product.vendorSlug,
                  })
                }
              >
                <Button variant="whatsapp" size="lg" fullWidth className="sm:w-auto">
                  <MessageCircle className="h-4 w-4" />
                  Message seller
                </Button>
              </a>
            ) : null}

            {plan.tertiary?.action === "visit_store" && plan.tertiary.href ? (
              <Link href={plan.tertiary.href} className="inline-flex w-full sm:w-auto">
                <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                  <Store className="h-4 w-4" />
                  {plan.tertiary.label}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        {/* Trust row */}
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
              <span>{product.shipWindow}</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
              <span>Verified seller — reviewed by SuperTech before listing</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
              <span>Trackable order status after you place a request</span>
            </div>
          </div>
        </div>

        {plan.showMomo ? (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
              Pay with MoMoPay
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Dial{" "}
              <span className="font-mono font-semibold text-[var(--foreground)]">{momo.dialCode}</span>{" "}
              or use the merchant code below to pay {vendorName}.
            </p>
            <div className="mt-4">
              <MomoPayCard
                merchantCode={momo.merchantCode}
                businessName={momo.businessName}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Sticky mobile CTA sits above the 5-tab dock (Photo Factory density) */}
      <div
        className={cn(
          "fixed inset-x-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 py-2.5 backdrop-blur-md sm:hidden",
          "bottom-[calc(3.5rem+env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-[var(--muted)]">{product.name}</p>
            <p className="text-base font-semibold tracking-[-0.02em]">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "RWF",
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>
          </div>
          {plan.primary.href ? (
            <Link
              href={plan.primary.href}
              className="shrink-0"
              onClick={() =>
                trackEvent("pdp_primary_cta", {
                  product: product.slug,
                  mode: plan.mode,
                  action: plan.primary.action,
                  source: "sticky_mobile",
                })
              }
            >
              <Button variant="primary" size="md">
                {plan.primary.label}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
