/**
 * Lightweight product analytics for SuperTech UX measurement.
 * Events are sent to /api/events (best-effort) and mirrored to dataLayer when present.
 */

export type AnalyticsEventName =
  | "search_submit"
  | "search_suggest_click"
  | "pdp_primary_cta"
  | "pdp_add_to_cart"
  | "pdp_whatsapp"
  | "catalog_empty_request"
  | "request_product_start"
  | "track_order_view"
  | "become_vendor_click";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __supertechEvents?: Array<{ name: string; props: AnalyticsProps; at: string }>;
  }
}

export function trackEvent(name: AnalyticsEventName, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event: name,
    ...props,
    path: window.location.pathname,
    ts: new Date().toISOString(),
  };

  // GTM / tag manager compatibility
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  // Session ring buffer for local debugging
  window.__supertechEvents = window.__supertechEvents ?? [];
  window.__supertechEvents.push({
    name,
    props,
    at: payload.ts,
  });
  if (window.__supertechEvents.length > 50) {
    window.__supertechEvents.shift();
  }

  // Best-effort server ingest (no await — never block UI)
  try {
    const body = JSON.stringify({ name, props, path: payload.path, ts: payload.ts });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
    } else {
      void fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // ignore network errors
  }
}
