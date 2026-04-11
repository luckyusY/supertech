"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type VendorPayout = {
  payoutId: string;
  period: string;
  grossSales: number;
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  status: string;
  orderCount: number;
  scheduledDate: string;
  paidAt?: string;
};

const statusStyles: Record<string, string> = {
  paid: "bg-[rgba(26,123,112,0.12)] text-[var(--teal)]",
  pending: "bg-[rgba(242,191,99,0.18)] text-[#9c6b0b]",
  processing: "bg-[rgba(228,90,54,0.1)] text-[var(--accent)]",
  on_hold: "bg-[rgba(16,32,25,0.06)] text-[var(--muted)]",
};

export function VendorPayoutSummary() {
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payouts")
      .then((r) => r.json())
      .then((data: { payouts?: VendorPayout[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setPayouts(data.payouts ?? []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load payouts."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-[1.2rem] bg-[rgba(16,32,25,0.05)]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1rem] border border-[rgba(228,90,54,0.3)] bg-[rgba(228,90,54,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
        {error}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No payout records found yet.</p>
    );
  }

  const totalNet = payouts.reduce((s, p) => s + p.netPayout, 0);
  const totalGross = payouts.reduce((s, p) => s + p.grossSales, 0);
  const totalCommission = payouts.reduce((s, p) => s + p.commissionAmount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total gross sales", value: formatPrice(totalGross) },
          { label: "Commission (8%)", value: formatPrice(totalCommission) },
          { label: "Net payout", value: formatPrice(totalNet) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[1.2rem] border border-[var(--line)] bg-white/72 p-4"
          >
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.04em]">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {payouts.map((payout) => (
          <div
            key={payout.payoutId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-4"
          >
            <div>
              <p className="text-sm font-semibold">{payout.period}</p>
              <p className="text-xs text-[var(--muted)]">
                {payout.orderCount} orders · {formatPrice(payout.grossSales)} gross
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatPrice(payout.netPayout)}</p>
              <p className="text-xs text-[var(--muted)]">
                −{formatPrice(payout.commissionAmount)} commission
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusStyles[payout.status] ?? statusStyles.on_hold}`}
            >
              {payout.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
