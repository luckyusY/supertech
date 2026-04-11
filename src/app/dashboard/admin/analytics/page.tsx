import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, DollarSign, Package, Store } from "lucide-react";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { vendors, products } from "@/lib/marketplace";
import { getAllPayoutSummaries } from "@/lib/payouts";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Analytics · Admin",
  description: "Marketplace-wide revenue, payout, and seller performance analytics.",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/analytics" });

  const COMMISSION = 0.08;

  let totalGross = 0;
  let totalNet = 0;
  let vendorRows: {
    vendorName: string;
    vendorSlug: string;
    grossSales: number;
    netPayout: number;
    activeProducts: number;
    fulfillmentRate: string;
  }[] = [];

  if (hasMongoConfig()) {
    const summaries = await getAllPayoutSummaries().catch(() => []);
    totalNet = summaries.reduce((s, p) => s + p.totalPaid + p.totalPending, 0);
    totalGross = Math.round(totalNet / (1 - COMMISSION));
    vendorRows = summaries.map((s) => {
      const v = vendors.find((vv) => vv.slug === s.vendorSlug);
      return {
        vendorName: s.vendorName,
        vendorSlug: s.vendorSlug,
        grossSales: Math.round((s.totalPaid + s.totalPending) / (1 - COMMISSION)),
        netPayout: s.totalPaid + s.totalPending,
        activeProducts: v?.activeProducts ?? 0,
        fulfillmentRate: v?.fulfillmentRate ?? "—",
      };
    });
  } else {
    totalGross = 42800;
    totalNet = 39376;
    vendorRows = vendors.map((v) => ({
      vendorName: v.name,
      vendorSlug: v.slug,
      grossSales: Math.round(8000 + (v.reviewCount % 5) * 1000),
      netPayout: Math.round(7000 + (v.reviewCount % 5) * 900),
      activeProducts: v.activeProducts,
      fulfillmentRate: v.fulfillmentRate,
    }));
  }

  const totalCommission = Math.round(totalGross * COMMISSION);
  const avgFulfillment =
    vendors.reduce((s, v) => s + parseFloat(v.fulfillmentRate), 0) / vendors.length;

  const metrics = [
    { label: "Gross marketplace sales", value: formatPrice(totalGross), icon: DollarSign },
    { label: "Commission earned (8%)", value: formatPrice(totalCommission), icon: BarChart3 },
    { label: "Net paid to vendors", value: formatPrice(totalNet), icon: Store },
    { label: "Total products", value: String(products.length), icon: Package },
  ];

  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin dashboard
        </Link>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Phase 4 · Analytics
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Marketplace performance
            </h1>
          </div>
          <span className="rounded-full bg-[rgba(16,32,25,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Live
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5"
            >
              <m.icon className="h-5 w-5 text-[var(--accent)]" />
              <p className="mt-4 text-sm text-[var(--muted)]">{m.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Vendor breakdown */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">Seller performance</h2>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[rgba(16,32,25,0.03)]">
                  {["Vendor", "Gross sales", "Net payout", "Products", "Fulfillment"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left font-semibold text-[var(--muted)]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {vendorRows.map((row) => (
                  <tr
                    key={row.vendorSlug}
                    className="border-b border-[var(--line)] bg-white last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold">{row.vendorName}</td>
                    <td className="px-5 py-4">{formatPrice(row.grossSales)}</td>
                    <td className="px-5 py-4 text-[var(--teal)]">
                      {formatPrice(row.netPayout)}
                    </td>
                    <td className="px-5 py-4">{row.activeProducts}</td>
                    <td className="px-5 py-4">{row.fulfillmentRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Avg fulfillment bar */}
        <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">
            Average fulfillment rate across all sellers
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            {avgFulfillment.toFixed(1)}%
          </p>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(16,32,25,0.08)]">
            <div
              className="h-full rounded-full bg-[var(--teal)]"
              style={{ width: `${avgFulfillment}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
