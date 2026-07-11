/**
 * SuperTech product rules — marketplace modes, PDP CTAs, order status language.
 * Source of truth for commerce UX decisions (see docs/PRODUCT_DESIGN_PLAN.md).
 */

export type MarketplaceMode = "shop" | "motors" | "property";

export type CommerceAction =
  | "request_order"
  | "add_to_cart"
  | "whatsapp"
  | "visit_store"
  | "request_product";

export type OrderRequestStatus =
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type StatusTone = "warning" | "info" | "neutral" | "brand" | "success" | "danger";

const MOTORS_CATEGORIES = new Set([
  "Cars for Sale",
  "Cars for Rent",
]);

const PROPERTY_CATEGORIES = new Set([
  "Apartments for Sale",
  "Apartments for Rent",
  "Land for Sale",
  "Commercial Spaces",
]);

/** Map a product category to a marketplace mode. Default: shop. */
export function getMarketplaceMode(category: string): MarketplaceMode {
  if (MOTORS_CATEGORIES.has(category)) return "motors";
  if (PROPERTY_CATEGORIES.has(category)) return "property";
  return "shop";
}

export function isBigTicketMode(mode: MarketplaceMode): boolean {
  return mode === "motors" || mode === "property";
}

/** Heuristic: stock labels that mean we should de-emphasize instant cart. */
export function isOutOfStockLabel(stockLabel: string): boolean {
  const value = stockLabel.trim().toLowerCase();
  return (
    value.includes("out of stock") ||
    value.includes("sold out") ||
    value === "unavailable"
  );
}

export type BuyBoxPlan = {
  mode: MarketplaceMode;
  primary: {
    action: CommerceAction;
    label: string;
    href?: string;
  };
  secondary: {
    action: CommerceAction;
    label: string;
    href?: string;
  } | null;
  tertiary: {
    action: CommerceAction;
    label: string;
    href?: string;
  } | null;
  /** Short helper under CTAs explaining how buying works. */
  howItWorks: string;
  showAddToCart: boolean;
  showMomo: boolean;
  priceLayout: "standard" | "enquiry";
};

type BuildBuyBoxInput = {
  category: string;
  productSlug: string;
  stockLabel: string;
  vendorSlug?: string;
};

/**
 * PDP commerce decision tree.
 * Primary path for shop goods: request order (ops-assisted) + cart.
 * Motors/property: enquire-first, no cart.
 */
export function buildBuyBoxPlan(input: BuildBuyBoxInput): BuyBoxPlan {
  const mode = getMarketplaceMode(input.category);
  const outOfStock = isOutOfStockLabel(input.stockLabel);
  const orderHref = `/order?product=${encodeURIComponent(input.productSlug)}`;
  const storeHref = input.vendorSlug
    ? `/vendors/${encodeURIComponent(input.vendorSlug)}`
    : "/vendors";

  if (outOfStock) {
    return {
      mode,
      primary: {
        action: "request_product",
        label: "Request this product",
        href: `/request-product?hint=${encodeURIComponent(input.productSlug)}`,
      },
      secondary: {
        action: "whatsapp",
        label: "Message seller",
      },
      tertiary: null,
      howItWorks:
        "This listing looks unavailable. Request it and SuperTech will help source it, or message the seller.",
      showAddToCart: false,
      showMomo: false,
      priceLayout: mode === "shop" ? "standard" : "enquiry",
    };
  }

  if (isBigTicketMode(mode)) {
    return {
      mode,
      primary: {
        action: "request_order",
        label: mode === "motors" ? "Enquire about this vehicle" : "Enquire about this listing",
        href: orderHref,
      },
      secondary: {
        action: "whatsapp",
        label: "Message seller",
      },
      tertiary: {
        action: "visit_store",
        label: "Visit store",
        href: storeHref,
      },
      howItWorks:
        "Big-ticket listings are enquiry-led. Send a request or WhatsApp the seller — SuperTech helps coordinate next steps.",
      showAddToCart: false,
      showMomo: true,
      priceLayout: "enquiry",
    };
  }

  // Default shop mode — assisted checkout spine
  return {
    mode: "shop",
    primary: {
      action: "request_order",
      label: "Request order",
      href: orderHref,
    },
    secondary: {
      action: "add_to_cart",
      label: "Add to cart",
    },
    tertiary: {
      action: "whatsapp",
      label: "Message seller",
    },
    howItWorks:
      "Request an order for SuperTech-assisted checkout, or add to cart and checkout when ready. Pay with MoMoPay or your preferred method.",
    showAddToCart: true,
    showMomo: true,
    priceLayout: "standard",
  };
}

export const ORDER_STATUS_META: Record<
  OrderRequestStatus,
  { label: string; tone: StatusTone; description: string }
> = {
  pending_confirmation: {
    label: "Pending confirmation",
    tone: "warning",
    description: "Your order request reached the marketplace team.",
  },
  confirmed: {
    label: "Confirmed",
    tone: "info",
    description: "The order is confirmed and the seller is notified.",
  },
  preparing: {
    label: "Preparing",
    tone: "neutral",
    description: "The seller is preparing your items.",
  },
  ready_for_delivery: {
    label: "Ready for delivery",
    tone: "info",
    description: "Your order is packed and ready to go.",
  },
  out_for_delivery: {
    label: "Out for delivery",
    tone: "brand",
    description: "Your order is on the way.",
  },
  completed: {
    label: "Completed",
    tone: "success",
    description: "Order delivered or marked complete.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "danger",
    description: "This order was cancelled.",
  },
};

export const ORDER_STATUS_FLOW = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "out_for_delivery",
  "completed",
] as const satisfies readonly Exclude<OrderRequestStatus, "cancelled">[];

export type OrderStatusFlowStep = (typeof ORDER_STATUS_FLOW)[number];

export const MODE_LABELS: Record<MarketplaceMode, string> = {
  shop: "Shop",
  motors: "Motors",
  property: "Property",
};

export const TRUST_POINTS = [
  {
    id: "verified",
    title: "Verified sellers",
    body: "Sellers are reviewed by SuperTech before products go live.",
  },
  {
    id: "track",
    title: "Trackable orders",
    body: "Every order request gets a status timeline you can follow.",
  },
  {
    id: "local-pay",
    title: "Local payments",
    body: "MoMoPay and other local payment preferences supported.",
  },
  {
    id: "request",
    title: "Request what’s missing",
    body: "If you can’t find it, request the product and we’ll help source it.",
  },
] as const;
