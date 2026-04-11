import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MailCheck, Search, ShieldCheck } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderStatusTimeline } from "@/components/order-status-timeline";
import {
  formatOrderRequestStatus,
  getOrderTrackingStatusMessage,
  getPublicOrderTracking,
} from "@/lib/order-requests";
import { formatDateTime, formatPrice } from "@/lib/utils";

type TrackOrderPageProps = {
  searchParams: Promise<{
    requestId?: string;
    email?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track your SuperTech order in real time using your request ID and email address.",
};

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const { requestId = "", email = "" } = await searchParams;
  const normalizedRequestId = requestId.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const order =
    normalizedRequestId && normalizedEmail
      ? await getPublicOrderTracking({
          requestId: normalizedRequestId,
          customerEmail: normalizedEmail,
        })
      : null;

  const showNotFoundMessage =
    Boolean(normalizedRequestId && normalizedEmail) && !order;

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="soft-card p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Order tracking
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Where is my order?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Enter the request ID from your order confirmation and the email you used
            when placing the order. We'll pull up the latest status instantly.
          </p>

          <form action="/track-order" method="get" className="mt-8 soft-card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="requestId">
                  Request ID
                </label>
                <input
                  id="requestId"
                  name="requestId"
                  defaultValue={normalizedRequestId}
                  placeholder="ORQ-20260411-ABCD"
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm uppercase"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="email">
                  Customer email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={normalizedEmail}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
                No account needed — just your request ID and the email you used at
                checkout. Your order details are private and only visible to you.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
              >
                <Search className="h-4 w-4" />
                Track order
              </button>
            </div>
          </form>

          {showNotFoundMessage ? (
            <div className="mt-6 rounded-[1.2rem] border border-[rgba(228,90,54,0.24)] bg-[rgba(228,90,54,0.08)] px-4 py-4 text-sm leading-7 text-[var(--accent)]">
              We could not find a matching order for that request ID and email.
              Double-check the request ID from your confirmation screen and try again.
            </div>
          ) : null}

          {order ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {order.requestId}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      {order.customerName}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                      {getOrderTrackingStatusMessage(order.status)}
                    </p>
                  </div>
                  <div className="space-y-3 lg:text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-sm text-[var(--muted)]">
                      Last updated {formatDateTime(order.updatedAt)}
                    </p>
                    <p className="text-2xl font-semibold tracking-[-0.04em]">
                      {formatPrice(order.estimatedTotal)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  {[
                    { label: "Request type", value: order.requestType.replaceAll("_", " ") },
                    { label: "Items", value: `${order.itemCount}` },
                    { label: "City", value: order.city },
                    { label: "Payment", value: order.paymentPreference.replaceAll("_", " ") },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.15rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-4"
                    >
                      <p className="text-sm text-[var(--muted)]">{item.label}</p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {order.status === "cancelled" ? (
                <div className="rounded-[1.3rem] border border-[rgba(228,90,54,0.24)] bg-[rgba(228,90,54,0.08)] px-5 py-4 text-sm leading-7 text-[var(--accent)]">
                  This request has been cancelled. If you still want the items, use the
                  catalog or order page to submit a new request.
                </div>
              ) : (
                <OrderStatusTimeline status={order.status} />
              )}

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    Items in this request
                  </p>
                  <div className="mt-5 space-y-4">
                    {order.lineItems.map((item) => (
                      <div
                        key={`${order.requestId}-${item.productName}-${item.vendorName}`}
                        className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] px-4 py-4"
                      >
                        <div>
                          <p className="font-semibold tracking-[-0.02em]">{item.productName}</p>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {item.vendorName} | {item.quantity} units
                          </p>
                        </div>
                        <p className="text-lg font-semibold">{formatPrice(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="dark-card p-6">
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
                      Order snapshot
                    </p>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                      <p>Created {formatDateTime(order.createdAt)}</p>
                      <p>Current stage: {formatOrderRequestStatus(order.status)}</p>
                      <p>Preferred contact: {order.contactPreference}</p>
                    </div>
                  </div>

                  {order.notes ? (
                    <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Your notes
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                        {order.notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            Order stages
          </p>
          <div className="mt-6 space-y-4">
            {[
              {
                icon: MailCheck,
                title: "Order received",
                description:
                  "Your request is in our system and our team has been notified.",
              },
              {
                icon: ShieldCheck,
                title: "Seller confirmed",
                description:
                  "Stock is verified and the seller has accepted the order.",
              },
              {
                icon: Search,
                title: "Out for delivery",
                description:
                  "Your package is on its way and will arrive within the estimated window.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4"
              >
                <item.icon className="h-5 w-5 text-[var(--gold)]" />
                <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[1.3rem] border border-white/10 bg-white/6 p-5">
            <p className="text-sm leading-7 text-[rgba(255,255,255,0.76)]">
              Need to place a new order?
            </p>
            <Link
              href="/order"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)]"
            >
              Shop now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
