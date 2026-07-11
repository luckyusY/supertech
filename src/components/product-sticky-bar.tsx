"use client";

import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { trackEvent } from "@/lib/client-analytics";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ProductStickyBarProps = {
  slug: string;
  name: string;
  price: number;
  stockLabel: string;
  vendorSlug: string;
  vendorName: string;
  heroImage: string;
  badge: string;
  accent: string;
  primaryHref?: string;
  primaryLabel?: string;
  showAddToCart?: boolean;
};

/**
 * Photo Factory–style sticky purchase bar:
 * desktop bottom strip + mobile bar above the dock.
 */
export function ProductStickyBar({
  slug,
  name,
  price,
  stockLabel,
  vendorSlug,
  vendorName,
  heroImage,
  badge,
  accent,
  primaryHref,
  primaryLabel = "Buy now",
  showAddToCart = true,
}: ProductStickyBarProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(t);
  }, [added]);

  function handleAdd() {
    addItem({
      slug,
      name,
      vendorSlug,
      vendorName,
      heroImage,
      price,
      badge,
      accent,
    });
    setAdded(true);
    trackEvent("pdp_add_to_cart", {
      product: slug,
      vendor: vendorSlug,
      price,
      source: "sticky_bar",
    });
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 hidden border-t border-[var(--line)] bg-[var(--surface)]/95 shadow-[0_-6px_24px_rgba(0,0,0,0.12)] backdrop-blur-md transition-transform duration-300 sm:block",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="page-shell flex items-center gap-4 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{name}</p>
          <p className="text-xs font-semibold text-[var(--accent)]">{stockLabel}</p>
        </div>
        <p className="shrink-0 text-[22px] font-bold tabular-nums tracking-[-0.02em]">
          {formatPrice(price)}
        </p>
        {showAddToCart ? (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-[var(--accent-hover)]"
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </>
            )}
          </button>
        ) : null}
        {primaryHref ? (
          <Link
            href={primaryHref}
            onClick={() =>
              trackEvent("pdp_primary_cta", {
                product: slug,
                source: "sticky_bar",
                label: primaryLabel,
              })
            }
            className="inline-flex min-w-40 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {primaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
