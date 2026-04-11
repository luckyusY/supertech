"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MessageSquareMore, RefreshCw } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
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

type OrderRecord = {
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
  customerEmail: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  paymentPreference: string;
  contactPreference: string;
  notes: string;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};

const statusOptions: OrderStatus[] = [
  "pending_confirmation",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "out_for_delivery",
  "completed",
  "cancelled",
];

type AdminOrdersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; orders: OrderRecord[] };

function formatStatus(status: OrderStatus) {
  return status.replaceAll("_", " ");
}

export function AdminOrderOperations() {
  const [state, setState] = useState<AdminOrdersState>({ status: "loading" });
  const [statusDrafts, setStatusDrafts] = useState<Record<string, OrderStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadOrders() {
    try {
      const response = await fetch("/api/order-requests?limit=12", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load order operations.");
      }

      const payload = (await response.json()) as { orders: OrderRecord[] };

      setStatusDrafts(
        Object.fromEntries(payload.orders.map((order) => [order.id, order.status])),
      );
      setNoteDrafts(
        Object.fromEntries(payload.orders.map((order) => [order.id, order.internalNote ?? ""])),
      );
      setState({ status: "ready", orders: payload.orders });
      setActionError("");
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unable to load order operations.",
      });
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const metrics = useMemo(() => {
    if (state.status !== "ready") {
      return null;
    }

    return {
      pending: state.orders.filter((order) => order.status === "pending_confirmation").length,
      active: state.orders.filter((order) =>
        ["confirmed", "preparing", "ready_for_delivery", "out_for_delivery"].includes(
          order.status,
        ),
      ).length,
      revenue: state.orders
        .filter((order) => order.status !== "cancelled")
        .reduce((total, order) => total + order.estimatedTotal, 0),
      sharedCarts: state.orders.filter((order) => order.itemCount > 1).length,
    };
  }, [state]);

  function saveOrder(id: string) {
    const status = statusDrafts[id];
    const internalNote = noteDrafts[id] ?? "";

    startTransition(async () => {
      try {
        const response = await fetch(`/api/order-requests/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            internalNote,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Unable to update order.");
        }

        await loadOrders();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to update order.");
      }
    });
  }

  if (state.status === "loading") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        Loading manual order operations...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        {state.message}
      </div>
    );
  }

  if (state.orders.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        No manual order requests yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Pending confirmation", value: metrics?.pending ?? 0 },
          { label: "Active fulfillment", value: metrics?.active ?? 0 },
          { label: "Shared carts", value: metrics?.sharedCarts ?? 0 },
          { label: "Estimated revenue", value: formatPrice(metrics?.revenue ?? 0) },
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

      {actionError ? (
        <div className="rounded-[1rem] border border-[rgba(228,90,54,0.3)] bg-[rgba(228,90,54,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
          {actionError}
        </div>
      ) : null}

      {state.orders.map((order) => (
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
                {order.requestType === "cart_quote"
                  ? `${order.quantity} units across ${order.itemCount} items`
                  : `${order.quantity} x ${order.productName}`}{" "}
                for {order.vendorName}
              </p>
            </div>
            <div className="space-y-3 lg:text-right">
              <OrderStatusBadge status={order.status} />
              <p className="text-sm text-[var(--muted)]">
                Updated {formatDateTime(order.updatedAt)}
              </p>
              <p className="text-2xl font-semibold tracking-[-0.04em]">
                {formatPrice(order.estimatedTotal)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-4">
                <p className="text-sm font-semibold">Line items</p>
                <div className="mt-3 space-y-3">
                  {order.lineItems.map((item) => (
                    <div
                      key={`${order.id}-${item.productSlug}`}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-[var(--muted)]">
                          {item.vendorName} | {item.quantity} units
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                  <p className="text-sm font-semibold">Customer contact</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{order.customerEmail}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{order.customerPhone}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {order.contactPreference.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                  <p className="text-sm font-semibold">Delivery</p>
                  <p className="mt-3 text-sm text-[var(--muted)]">{order.city}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {order.deliveryAddress}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {order.paymentPreference.replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              {order.notes ? (
                <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-4">
                  <p className="text-sm font-semibold">Customer notes</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{order.notes}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquareMore className="h-4 w-4 text-[var(--accent)]" />
                Order control panel
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-semibold" htmlFor={`status-${order.id}`}>
                    Status
                  </label>
                  <select
                    id={`status-${order.id}`}
                    value={statusDrafts[order.id] ?? order.status}
                    onChange={(event) =>
                      setStatusDrafts((current) => ({
                        ...current,
                        [order.id]: event.target.value as OrderStatus,
                      }))
                    }
                    className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold" htmlFor={`note-${order.id}`}>
                    Internal note
                  </label>
                  <textarea
                    id={`note-${order.id}`}
                    value={noteDrafts[order.id] ?? ""}
                    onChange={(event) =>
                      setNoteDrafts((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="Add fulfillment notes, callback summaries, or handoff details."
                    className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => saveOrder(order.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                  Save order update
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
