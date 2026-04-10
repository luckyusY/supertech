"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatPrice } from "@/lib/utils";

type OrderRequestSummary = {
  id: string;
  requestId: string;
  status: string;
  productName: string;
  vendorName: string;
  quantity: number;
  estimatedTotal: number;
  customerName: string;
  city: string;
  paymentPreference: string;
  contactPreference: string;
  createdAt: string;
};

type InboxState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; orders: OrderRequestSummary[] };

export function OrderRequestInbox() {
  const [state, setState] = useState<InboxState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      try {
        const response = await fetch("/api/order-requests?limit=6", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load order requests.");
        }

        const payload = (await response.json()) as { orders: OrderRequestSummary[] };

        if (isActive) {
          setState({ status: "ready", orders: payload.orders });
        }
      } catch {
        if (isActive) {
          setState({ status: "error" });
        }
      }
    }

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="mt-6 rounded-[1.3rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        Loading recent manual order requests...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-6 rounded-[1.3rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        MongoDB order requests could not be loaded right now.
      </div>
    );
  }

  if (state.orders.length === 0) {
    return (
      <div className="mt-6 rounded-[1.3rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        No manual order requests yet. New customer requests from `/order` will appear here.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {state.orders.map((request) => (
        <div
          key={request.id}
          className="rounded-[1.3rem] border border-[var(--line)] bg-white p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em]">{request.requestId}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {request.customerName} ordered {request.quantity} x {request.productName}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {request.vendorName} | {request.city}
              </p>
            </div>
            <div className="text-sm text-[var(--muted)] sm:text-right">
              <p className="font-semibold text-[var(--foreground)]">
                {formatPrice(request.estimatedTotal)}
              </p>
              <p className="mt-1">{formatDateTime(request.createdAt)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgba(26,123,112,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--teal)]">
              {request.status.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-[rgba(16,32,25,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {request.paymentPreference.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-[rgba(16,32,25,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {request.contactPreference}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
