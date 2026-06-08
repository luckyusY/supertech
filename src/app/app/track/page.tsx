import Link from "next/link";
import { Search } from "lucide-react";
import { AppBottomTabs } from "@/components/app-bottom-tabs";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { getOrderTrackingStatusMessage, getPublicOrderTracking } from "@/lib/order-requests";
import { formatDateTime, formatPrice } from "@/lib/utils";

type AppTrackPageProps = {
  searchParams: Promise<{ requestId?: string; email?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AppTrackPage({ searchParams }: AppTrackPageProps) {
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
  const showNotFound = Boolean(normalizedRequestId && normalizedEmail) && !order;

  return (
    <div className="min-h-screen bg-[#f3f6f2] pb-24 text-[#102019]">
      <header className="sticky top-0 z-40 border-b border-black/6 bg-[#f3f6f2]/92 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#66736b]">
            Order tracking
          </p>
          <h1 className="text-2xl font-black tracking-[-0.04em]">Track</h1>
        </div>
      </header>
      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <form action="/app/track" className="rounded-lg bg-white p-4 shadow-sm">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-black">Request ID</span>
              <input
                name="requestId"
                defaultValue={normalizedRequestId}
                placeholder="ORQ-20260411-ABCD"
                className="mt-2 h-12 w-full rounded-lg border border-black/10 px-4 text-sm font-semibold uppercase outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={normalizedEmail}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-lg border border-black/10 px-4 text-sm font-semibold outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#102019] text-sm font-black text-white"
          >
            <Search className="h-4 w-4" />
            Track order
          </button>
        </form>

        {showNotFound ? (
          <div className="rounded-lg bg-white p-4 text-sm leading-6 text-[#66736b] shadow-sm">
            No matching order found. Check the request ID and email, then try again.
          </div>
        ) : null}

        {order ? (
          <section className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#66736b]">
                  {order.requestId}
                </p>
                <h2 className="mt-1 text-xl font-black">{order.customerName}</h2>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#66736b]">
              {getOrderTrackingStatusMessage(order.status)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Info label="Total" value={formatPrice(order.estimatedTotal)} />
              <Info label="Items" value={`${order.itemCount}`} />
              <Info label="City" value={order.city} />
              <Info label="Updated" value={formatDateTime(order.updatedAt)} />
            </div>
          </section>
        ) : (
          <section className="rounded-lg bg-[#102019] p-4 text-white">
            <h2 className="text-xl font-black">No account needed</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Use your request ID and email from checkout to follow the latest status.
            </p>
            <Link href="/app/shop" className="mt-4 inline-flex text-sm font-black text-[#f4c95d]">
              Continue shopping
            </Link>
          </section>
        )}
      </main>
      <AppBottomTabs />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f3f6f2] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#66736b]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}
