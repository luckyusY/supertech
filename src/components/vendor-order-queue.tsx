"use client";

import { useEffect, useMemo, useState } from "react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { Vendor } from "@/lib/marketplace";
import { formatDateTime, formatPrice } from "@/lib/utils";

type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

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

export function VendorOrderQueue({
  availableVendors,
  initialVendorSlug,
  canSwitchVendor,
}: VendorOrderQueueProps) {
  const [vendorSlug, setVendorSlug] = useState(initialVendorSlug);
  const [state, setState] = useState<VendorQueueState>({ status: "loading" });

  useEffect(() => {
    setVendorSlug(initialVendorSlug);
  }, [initialVendorSlug]);

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/order-requests?vendorSlug=${encodeURIComponent(vendorSlug)}&limit=10`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Unable to load vendor order queue.");
        }

        const payload = (await response.json()) as { orders: VendorOrderRecord[] };

        if (isActive) {
          setState({ status: "ready", orders: payload.orders });
        }
      } catch {
        if (isActive) {
          setState({ status: "error" });
        }
      }
    }

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, [vendorSlug]);

  const metrics = useMemo(() => {
    if (state.status !== "ready") {
      return null;
    }

    const vendorRevenue = state.orders.reduce((total, order) => {
      const vendorLines = order.lineItems.filter((item) => item.vendorSlug === vendorSlug);

      return (
        total +
        vendorLines.reduce((lineTotal, lineItem) => lineTotal + lineItem.lineTotal, 0)
      );
    }, 0);

    return {
      openOrders: state.orders.filter((order) => order.status !== "completed").length,
      activeFulfillment: state.orders.filter((order) =>
        ["confirmed", "preparing", "ready_for_delivery", "out_for_delivery"].includes(
          order.status,
        ),
      ).length,
      sharedCarts: state.orders.filter((order) => order.itemCount > 1).length,
      vendorRevenue,
    };
  }, [state, vendorSlug]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Fulfillment lane
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Real order requests filtered for a seller
          </h2>
        </div>
        <div className="min-w-[240px]">
          {canSwitchVendor ? (
            <>
              <label className="text-sm font-semibold" htmlFor="vendorOrderQueueVendor">
                Vendor
              </label>
              <select
                id="vendorOrderQueueVendor"
                value={vendorSlug}
                onChange={(event) => setVendorSlug(event.target.value)}
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              >
                {availableVendors.map((vendor) => (
                  <option key={vendor.slug} value={vendor.slug}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Vendor</p>
              <div className="mt-2 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium">
                {availableVendors[0]?.name ?? "Assigned vendor"}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Visible orders", value: metrics?.openOrders ?? 0 },
          { label: "Active fulfillment", value: metrics?.activeFulfillment ?? 0 },
          { label: "Shared carts", value: metrics?.sharedCarts ?? 0 },
          { label: "Seller subtotal", value: formatPrice(metrics?.vendorRevenue ?? 0) },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4"
          >
            <p className="text-sm text-[var(--muted)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {state.status === "loading" ? (
        <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
          Loading vendor order queue...
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
          Unable to load vendor order queue right now.
        </div>
      ) : null}

      {state.status === "ready" && state.orders.length === 0 ? (
        <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
          No manual orders yet for this vendor.
        </div>
      ) : null}

      {state.status === "ready"
        ? state.orders.map((order) => {
            const vendorLineItems = order.lineItems.filter(
              (item) => item.vendorSlug === vendorSlug,
            );
            const vendorSubtotal = vendorLineItems.reduce(
              (total, item) => total + item.lineTotal,
              0,
            );

            return (
              <div
                key={order.id}
                className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {order.requestId}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {order.customerName}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                      {order.city} | {order.customerPhone}
                    </p>
                  </div>
                  <div className="space-y-3 lg:text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-sm text-[var(--muted)]">
                      Updated {formatDateTime(order.updatedAt)}
                    </p>
                    <p className="text-2xl font-semibold tracking-[-0.04em]">
                      {formatPrice(vendorSubtotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(15,23,42,0.03)] p-4">
                    <p className="text-sm font-semibold">Items for this vendor</p>
                    <div className="mt-3 space-y-3">
                      {vendorLineItems.map((item) => (
                        <div
                          key={`${order.id}-${item.productSlug}`}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-[var(--muted)]">{item.quantity} units</p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                        </div>
                      ))}
                    </div>
                    {order.itemCount > vendorLineItems.length ? (
                      <div className="mt-4 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
                        This request also includes products from other vendors, so the
                        total cart will be coordinated from the admin side.
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                      <p className="text-sm font-semibold">Order profile</p>
                      <p className="mt-3 text-sm text-[var(--muted)]">
                        {order.requestType === "cart_quote" ? "Cart quote" : "Single-item request"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {order.paymentPreference.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Created {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    {order.notes ? (
                      <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                        <p className="text-sm font-semibold">Customer notes</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                          {order.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
}
