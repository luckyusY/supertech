"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, RefreshCw, Search } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EmptyState } from "@/components/ui";
import type { Vendor } from "@/lib/marketplace";
import type { OrderRequestStatus } from "@/lib/product-rules";
import { cn, formatDateTime, formatPrice } from "@/lib/utils";

type OrderStatus = OrderRequestStatus;

type OrderLineItem = {
  productSlug: string;
  productName: string;
  vendorSlug: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type VendorOrderRecord = {
  id: string;
  requestId: string;
  status: OrderStatus;
  requestType: "single_product" | "cart_quote";
  productName: string;
  vendorName: string;
  quantity: number;
  itemCount: number;
  estimatedTotal: number;
  lineItems: OrderLineItem[];
  customerName: string;
  customerPhone: string;
  city: string;
  paymentPreference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type VendorQueueState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; orders: VendorOrderRecord[] };

type VendorOrderQueueProps = {
  availableVendors: Vendor[];
  initialVendorSlug: string;
  canSwitchVendor: boolean;
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending_confirmation", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function isActiveStatus(status: OrderStatus) {
  return ["confirmed", "preparing", "ready_for_delivery", "out_for_delivery"].includes(status);
}

function vendorSubtotal(order: VendorOrderRecord, vendorSlug: string) {
  return order.lineItems
    .filter((item) => item.vendorSlug === vendorSlug)
    .reduce((total, item) => total + item.lineTotal, 0);
}

export function VendorOrderQueue({
  availableVendors,
  initialVendorSlug,
  canSwitchVendor,
}: VendorOrderQueueProps) {
  const [vendorSlug, setVendorSlug] = useState(initialVendorSlug);
  const [state, setState] = useState<VendorQueueState>({ status: "loading" });
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setVendorSlug(initialVendorSlug);
  }, [initialVendorSlug]);

  async function loadOrders(slug: string) {
    setState({ status: "loading" });
    try {
      const response = await fetch(
        `/api/order-requests?vendorSlug=${encodeURIComponent(slug)}&limit=50`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Unable to load vendor order queue.");
      const payload = (await response.json()) as { orders: VendorOrderRecord[] };
      setState({ status: "ready", orders: payload.orders });
    } catch {
      setState({ status: "error" });
    }
  }

  useEffect(() => {
    let isActive = true;
    void (async () => {
      setState({ status: "loading" });
      try {
        const response = await fetch(
          `/api/order-requests?vendorSlug=${encodeURIComponent(vendorSlug)}&limit=50`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("fail");
        const payload = (await response.json()) as { orders: VendorOrderRecord[] };
        if (isActive) setState({ status: "ready", orders: payload.orders });
      } catch {
        if (isActive) setState({ status: "error" });
      }
    })();
    return () => {
      isActive = false;
    };
  }, [vendorSlug]);

  const metrics = useMemo(() => {
    if (state.status !== "ready") return null;
    const openOrders = state.orders.filter(
      (order) => order.status !== "completed" && order.status !== "cancelled",
    ).length;
    const activeFulfillment = state.orders.filter((order) => isActiveStatus(order.status)).length;
    const pending = state.orders.filter((o) => o.status === "pending_confirmation").length;
    const vendorRevenue = state.orders.reduce(
      (total, order) => total + vendorSubtotal(order, vendorSlug),
      0,
    );
    return { openOrders, activeFulfillment, pending, vendorRevenue };
  }, [state, vendorSlug]);

  const filteredOrders = useMemo(() => {
    if (state.status !== "ready") return [];
    const q = query.trim().toLowerCase();
    return state.orders.filter((order) => {
      if (filter === "pending_confirmation" && order.status !== "pending_confirmation") return false;
      if (filter === "completed" && order.status !== "completed") return false;
      if (filter === "cancelled" && order.status !== "cancelled") return false;
      if (filter === "active" && !isActiveStatus(order.status)) return false;
      if (!q) return true;
      const haystack = [
        order.requestId,
        order.customerName,
        order.customerPhone,
        order.productName,
        order.city,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [state, filter, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Fulfillment
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
            Orders for your store
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Shared carts may include other sellers — only your lines are listed.
          </p>
        </div>
        <div className="min-w-[220px]">
          {canSwitchVendor ? (
            <>
              <label className="text-xs font-semibold text-[var(--muted)]" htmlFor="vendorOrderQueueVendor">
                Vendor
              </label>
              <select
                id="vendorOrderQueueVendor"
                value={vendorSlug}
                onChange={(event) => setVendorSlug(event.target.value)}
                className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
              >
                {availableVendors.map((vendor) => (
                  <option key={vendor.slug} value={vendor.slug}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--neutral-50)] px-3 py-2.5 text-sm font-semibold">
              {availableVendors[0]?.name ?? "Your store"}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open orders", value: metrics?.openOrders ?? 0 },
          { label: "Pending confirmation", value: metrics?.pending ?? 0 },
          { label: "Active fulfillment", value: metrics?.activeFulfillment ?? 0 },
          { label: "Seller subtotal", value: formatPrice(metrics?.vendorRevenue ?? 0) },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4"
          >
            <p className="text-sm text-[var(--muted)]">{metric.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-[-0.04em]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                filter === item.id
                  ? "bg-[var(--foreground)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="relative min-w-0 flex-1 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ID, customer, city…"
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadOrders(vendorSlug)}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {state.status === "loading" ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
          Loading order queue…
        </div>
      ) : null}

      {state.status === "error" ? (
        <EmptyState
          title="Unable to load orders"
          description="Check your connection and try again."
          action={
            <button
              type="button"
              onClick={() => void loadOrders(vendorSlug)}
              className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          }
        />
      ) : null}

      {state.status === "ready" && state.orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When customers request your products, they will show up here for fulfillment."
        />
      ) : null}

      {state.status === "ready" && state.orders.length > 0 && filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders match this filter"
          description="Clear search or switch status filters."
        />
      ) : null}

      {state.status === "ready" && filteredOrders.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)] text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                  <th className="px-3 py-3 font-semibold">Request</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Your items</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Your total</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-3 py-3 font-semibold">
                    <span className="sr-only">Expand</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const lines = order.lineItems.filter((item) => item.vendorSlug === vendorSlug);
                  const subtotal = lines.reduce((t, item) => t + item.lineTotal, 0);
                  const open = expandedId === order.id;
                  const multiVendor = order.itemCount > lines.length;

                  return (
                    <Fragment key={order.id}>
                      <tr
                        className={cn(
                          "border-b border-[var(--line)] bg-white hover:bg-[var(--neutral-50)]",
                          open && "bg-[var(--accent-soft)]/40",
                        )}
                      >
                        <td className="px-3 py-3">
                          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em]">
                            {order.requestId}
                          </p>
                          {multiVendor ? (
                            <p className="mt-0.5 text-[10px] font-semibold text-[var(--warning)]">
                              Shared cart
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-xs text-[var(--muted)]">{order.city}</p>
                        </td>
                        <td className="px-3 py-3 text-[var(--muted)]">
                          {lines.length === 1
                            ? `${lines[0].quantity} × ${lines[0].productName}`
                            : `${lines.length} lines · ${lines.reduce((n, l) => n + l.quantity, 0)} units`}
                        </td>
                        <td className="px-3 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-3 py-3 font-semibold tabular-nums">
                          {formatPrice(subtotal)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-[var(--muted)]">
                          {formatDateTime(order.updatedAt)}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(open ? null : order.id)}
                            aria-expanded={open}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-white"
                            aria-label={open ? "Collapse order" : "Expand order"}
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                            />
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)]">
                          <td colSpan={7} className="px-3 py-4">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                              <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                                  Items for your store
                                </p>
                                <div className="mt-3 space-y-2">
                                  {lines.map((item) => (
                                    <div
                                      key={`${order.id}-${item.productSlug}`}
                                      className="flex items-center justify-between gap-3 text-sm"
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate font-medium">{item.productName}</p>
                                        <p className="text-xs text-[var(--muted)]">
                                          {item.quantity} units · {formatPrice(item.unitPrice)} each
                                        </p>
                                      </div>
                                      <p className="shrink-0 font-semibold">
                                        {formatPrice(item.lineTotal)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                {multiVendor ? (
                                  <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
                                    This request also includes other vendors. SuperTech admin
                                    coordinates the full cart.
                                  </p>
                                ) : null}
                                {order.notes ? (
                                  <div className="mt-3 border-t border-[var(--line)] pt-3">
                                    <p className="text-xs font-semibold text-[var(--muted)]">
                                      Customer notes
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--foreground)]">
                                      {order.notes}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                              <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4 text-sm">
                                <p className="font-semibold">Order profile</p>
                                <dl className="mt-3 space-y-2 text-[var(--muted)]">
                                  <div>
                                    <dt className="text-xs uppercase tracking-[0.12em]">Phone</dt>
                                    <dd className="font-medium text-[var(--foreground)]">
                                      {order.customerPhone}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs uppercase tracking-[0.12em]">Type</dt>
                                    <dd>
                                      {order.requestType === "cart_quote"
                                        ? "Cart quote"
                                        : "Single item"}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs uppercase tracking-[0.12em]">Payment</dt>
                                    <dd>{order.paymentPreference.replaceAll("_", " ")}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-xs uppercase tracking-[0.12em]">Created</dt>
                                    <dd>{formatDateTime(order.createdAt)}</dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
