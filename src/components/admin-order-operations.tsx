"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, MessageSquareMore, RefreshCw, Search } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EmptyState } from "@/components/ui";
import { getPageSlice, TablePagination } from "@/components/ui/table-pagination";
import { ORDER_STATUS_META, type OrderRequestStatus } from "@/lib/product-rules";
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

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending_confirmation", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

type AdminOrdersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; orders: OrderRecord[] };

function isActiveStatus(status: OrderStatus) {
  return ["confirmed", "preparing", "ready_for_delivery", "out_for_delivery"].includes(status);
}

export function AdminOrderOperations() {
  const [state, setState] = useState<AdminOrdersState>({ status: "loading" });
  const [statusDrafts, setStatusDrafts] = useState<Record<string, OrderStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadOrders() {
    try {
      const response = await fetch("/api/order-requests?limit=200", {
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
    if (state.status !== "ready") return null;
    return {
      pending: state.orders.filter((o) => o.status === "pending_confirmation").length,
      active: state.orders.filter((o) => isActiveStatus(o.status)).length,
      revenue: state.orders
        .filter((o) => o.status !== "cancelled")
        .reduce((total, order) => total + order.estimatedTotal, 0),
      total: state.orders.length,
    };
  }, [state]);

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
        order.customerEmail,
        order.customerPhone,
        order.productName,
        order.vendorName,
        order.city,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [state, filter, query]);

  const pageSlice = useMemo(
    () => getPageSlice(filteredOrders, page, pageSize),
    [filteredOrders, page, pageSize],
  );

  function saveOrder(id: string) {
    const status = statusDrafts[id];
    const internalNote = noteDrafts[id] ?? "";

    startTransition(async () => {
      try {
        const response = await fetch(`/api/order-requests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, internalNote }),
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
      <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        Loading order queue…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <EmptyState
        title="Unable to load orders"
        description={state.message}
        action={
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (state.orders.length === 0) {
    return (
      <EmptyState
        title="No order requests yet"
        description="When shoppers request orders, they will appear here for confirmation and fulfillment."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pending confirmation", value: metrics?.pending ?? 0 },
          { label: "Active fulfillment", value: metrics?.active ?? 0 },
          { label: "In queue", value: metrics?.total ?? 0 },
          { label: "Estimated value", value: formatPrice(metrics?.revenue ?? 0) },
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

      {/* Command bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilter(item.id);
                setPage(1);
              }}
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
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search ID, customer, vendor…"
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 text-sm font-semibold"
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          {actionError}
        </div>
      ) : null}

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders match this filter"
          description="Clear search or switch status filters to see more of the queue."
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)]">
          <div
            className="dashboard-table-scroll overflow-auto"
            style={{ maxHeight: "min(32rem, calc(100dvh - 14rem))" }}
          >
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="sticky top-0 z-[1]">
                <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)] text-xs uppercase tracking-[0.1em] text-[var(--muted)] shadow-[0_1px_0_var(--line)]">
                  <th className="w-12 bg-[var(--neutral-50)] px-3 py-3 font-semibold">#</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">Request</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">Customer</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">Items</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">Status</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">Total</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">Updated</th>
                  <th className="bg-[var(--neutral-50)] px-3 py-3 font-semibold">
                    <span className="sr-only">Expand</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.rows.map((order, index) => {
                  const open = expandedId === order.id;
                  return (
                    <OrderRow
                      key={order.id}
                      order={order}
                      rowNumber={pageSlice.rowOffset + index + 1}
                      open={open}
                      onToggle={() => setExpandedId(open ? null : order.id)}
                      statusDraft={statusDrafts[order.id] ?? order.status}
                      noteDraft={noteDrafts[order.id] ?? ""}
                      onStatusChange={(value) =>
                        setStatusDrafts((current) => ({ ...current, [order.id]: value }))
                      }
                      onNoteChange={(value) =>
                        setNoteDrafts((current) => ({ ...current, [order.id]: value }))
                      }
                      onSave={() => saveOrder(order.id)}
                      isPending={isPending}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          <TablePagination
            page={pageSlice.page}
            pageSize={pageSize}
            total={pageSlice.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  rowNumber,
  open,
  onToggle,
  statusDraft,
  noteDraft,
  onStatusChange,
  onNoteChange,
  onSave,
  isPending,
}: {
  order: OrderRecord;
  rowNumber: number;
  open: boolean;
  onToggle: () => void;
  statusDraft: OrderStatus;
  noteDraft: string;
  onStatusChange: (value: OrderStatus) => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-[var(--line)] bg-white hover:bg-[var(--neutral-50)]",
          open && "bg-[var(--accent-soft)]/40",
        )}
      >
        <td className="px-3 py-3">
          <span className="font-numeric text-caption text-[var(--muted)]">{rowNumber}</span>
        </td>
        <td className="px-3 py-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em]">
            {order.requestId}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{order.vendorName}</p>
        </td>
        <td className="px-3 py-3">
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-xs text-[var(--muted)]">{order.city}</p>
        </td>
        <td className="px-3 py-3 text-[var(--muted)]">
          {order.requestType === "cart_quote"
            ? `${order.itemCount} items · ${order.quantity} units`
            : `${order.quantity} × ${order.productName}`}
        </td>
        <td className="px-3 py-3">
          <OrderStatusBadge status={order.status} />
        </td>
        <td className="px-3 py-3 font-semibold tabular-nums">
          {formatPrice(order.estimatedTotal)}
        </td>
        <td className="whitespace-nowrap px-3 py-3 text-xs text-[var(--muted)]">
          {formatDateTime(order.updatedAt)}
        </td>
        <td className="px-3 py-3">
          <button
            type="button"
            onClick={onToggle}
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
          <td colSpan={8} className="px-3 py-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Line items
                  </p>
                  <div className="mt-3 space-y-2">
                    {order.lineItems.map((item) => (
                      <div
                        key={`${order.id}-${item.productSlug}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.productName}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {item.vendorName} · {item.quantity} units
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold">{formatPrice(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4 text-sm">
                    <p className="font-semibold">Contact</p>
                    <p className="mt-2 text-[var(--muted)]">{order.customerEmail}</p>
                    <p className="text-[var(--muted)]">{order.customerPhone}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Prefers {order.contactPreference.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4 text-sm">
                    <p className="font-semibold">Delivery</p>
                    <p className="mt-2 text-[var(--muted)]">{order.city}</p>
                    <p className="text-[var(--muted)]">{order.deliveryAddress}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Pay: {order.paymentPreference.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
                {order.notes ? (
                  <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4 text-sm">
                    <p className="font-semibold">Customer notes</p>
                    <p className="mt-2 text-[var(--muted)]">{order.notes}</p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquareMore className="h-4 w-4 text-[var(--accent)]" />
                  Update order
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--muted)]" htmlFor={`status-${order.id}`}>
                      Status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={statusDraft}
                      onChange={(event) => onStatusChange(event.target.value as OrderStatus)}
                      className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 py-2 text-sm"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_META[status].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--muted)]" htmlFor={`note-${order.id}`}>
                      Internal note
                    </label>
                    <textarea
                      id={`note-${order.id}`}
                      value={noteDraft}
                      onChange={(event) => onNoteChange(event.target.value)}
                      rows={4}
                      placeholder="Fulfillment notes, callbacks…"
                      className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={onSave}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                    Save update
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
