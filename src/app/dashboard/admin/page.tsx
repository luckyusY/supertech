import type { Metadata } from "next";
import { BadgeCheck, Layers3, Wallet2 } from "lucide-react";
import { adminQueue, vendors } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Marketplace admin shell for approvals, payouts, and vendor health.",
};

export default function AdminDashboardPage() {
  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Marketplace control room
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Admin oversight for approvals, payouts, and vendor quality.
            </h1>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "Monthly GMV", value: "$42.8K", icon: Layers3 },
                { label: "Pending approvals", value: "3", icon: BadgeCheck },
                { label: "Scheduled payouts", value: "$11.2K", icon: Wallet2 },
              ].map((card) => (
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
              <p>Commission configuration should be enforced before products go live.</p>
              <p>Vendors need clear payout windows and refund responsibility rules.</p>
              <p>High-performing sellers can graduate to dedicated storefront themes later.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[1.75rem] border border-[var(--line)] bg-white/72 p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Vendor review queue
            </h2>
            <div className="mt-6 space-y-4">
              {adminQueue.map((entry) => (
                <div
                  key={entry.name}
                  className="flex flex-col gap-4 rounded-[1.3rem] border border-[var(--line)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.03em]">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{entry.category}</p>
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    <p>{entry.stage}</p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {entry.eta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Seller health snapshot
            </h2>
            <div className="mt-6 space-y-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="rounded-[1.3rem] border border-[var(--line)] bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold tracking-[-0.03em]">{vendor.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{vendor.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[var(--muted)]">Fulfillment</p>
                      <p className="font-semibold">{vendor.fulfillmentRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
