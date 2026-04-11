import type { Metadata } from "next";
import { BadgeCheck, Layers3, Wallet2 } from "lucide-react";
import { AdminOrderOperations } from "@/components/admin-order-operations";
import { ProductApprovalInbox } from "@/components/product-approval-inbox";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { adminQueue, buildPhases, vendors } from "@/lib/marketplace";
import { getOrderRequestOperationsSnapshot } from "@/lib/order-requests";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Marketplace admin shell for approvals, payouts, and vendor health.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin",
  });
  const operationsSnapshot =
    hasMongoConfig()
      ? await getOrderRequestOperationsSnapshot().catch(() => null)
      : null;

  const metricCards = [
    {
      label: "Estimated GMV",
      value: operationsSnapshot ? formatPrice(operationsSnapshot.estimatedRevenue) : "$42.8K",
      icon: Layers3,
    },
    {
      label: "Pending confirmations",
      value: operationsSnapshot ? String(operationsSnapshot.pendingConfirmation) : "3",
      icon: BadgeCheck,
    },
    {
      label: "Active fulfillment",
      value: operationsSnapshot ? String(operationsSnapshot.activeFulfillment) : "6",
      icon: Wallet2,
    },
  ];

  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Marketplace control room
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Admin oversight for approvals, manual orders, payouts, and vendor quality.
            </h1>
            <div className="mt-4 inline-flex rounded-full border border-[var(--line)] bg-white/72 px-4 py-2 text-sm text-[var(--muted)]">
              Signed in as {session.name}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5"
                >
                  <card.icon className="h-5 w-5 text-[var(--accent)]" />
                  <p className="mt-4 text-sm text-[var(--muted)]">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="dark-card p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
              Ops notes
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
              <p>Manual orders now move through a real fulfillment status flow instead of staying as inbox-only leads.</p>
              <p>Shared quote carts still need central coordination, while vendor-specific shipments can be tracked from the seller side.</p>
              <p>Payments can still wait while order operations, seller publishing, and fulfillment discipline mature.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[1.75rem] border border-[var(--line)] bg-white/72 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Manual order operations
              </h2>
              <span className="rounded-full bg-[rgba(26,123,112,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
                Phase 3
              </span>
            </div>
            <div className="mt-6">
              <AdminOrderOperations />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--line)] bg-white/72 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Product approval queue
              </h2>
              <span className="rounded-full bg-[rgba(242,191,99,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9c6b0b]">
                Phase 2
              </span>
            </div>
            <div className="mt-6">
              <ProductApprovalInbox />
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Current roadmap</h2>
            <div className="mt-6 space-y-4">
              {buildPhases.slice(0, 3).map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold tracking-[-0.03em]">{phase.step}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{phase.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[var(--muted)]">Status</p>
                      <p className="font-semibold capitalize">{phase.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-4">
              <p className="font-semibold tracking-[-0.03em]">Vendor review queue</p>
              <div className="mt-4 space-y-3">
                {adminQueue.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p>{entry.name}</p>
                      <p className="text-[var(--muted)]">{entry.category}</p>
                    </div>
                    <div className="text-right text-[var(--muted)]">
                      <p>{entry.stage}</p>
                      <p>{entry.eta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-4">
              <p className="font-semibold tracking-[-0.03em]">Seller health snapshot</p>
              <div className="mt-4 space-y-3">
                {vendors.slice(0, 3).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p>{vendor.name}</p>
                      <p className="text-[var(--muted)]">{vendor.location}</p>
                    </div>
                    <p className="font-semibold">{vendor.fulfillmentRate}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
