import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, DollarSign, Package, Store, TrendingUp } from "lucide-react";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { vendors, products } from "@/lib/marketplace";
import { getAllPayoutSummaries } from "@/lib/payouts";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Analytics · Admin",
  description: "Marketplace-wide revenue, payout, and seller performance.",
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

  const topVendor = vendorRows.sort((a, b) => b.grossSales - a.grossSales)[0];

  const metrics = [
    {
      label: "Gross marketplace sales",
      value: formatPrice(totalGross),
      icon: TrendingUp,
      color: "text-[var(--teal)]",
      bg: "bg-[rgba(8,145,178,0.08)]",
      sub: "Total customer spend",
    },
    {
      label: "Platform commission",
      value: formatPrice(totalCommission),
      icon: BarChart3,
      color: "text-[var(--accent)]",
      bg: "bg-[rgba(37,99,235,0.08)]",
      sub: "8% of gross sales",
    },
    {
      label: "Net paid to vendors",
      value: formatPrice(totalNet),
      icon: DollarSign,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      sub: "After commission deduction",
    },
    {
      label: "Listed products",
      value: String(products.length),
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: `Across ${vendors.length} vendors`,
    },
  ];

  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Marketplace
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Analytics
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(8,145,178,0.25)] bg-[rgba(8,145,178,0.08)] px-4 py-2 text-sm font-semibold text-[var(--teal)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--teal)]" />
            Live data
          </span>
        </div>

        {/* Metrics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5"
            >
              <div className={`inline-flex rounded-[0.75rem] p-2 ${m.bg}`}>
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">{m.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{m.value}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue split visual */}
        <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-6">
          <p className="text-sm font-semibold text-[var(--muted)]">Revenue split</p>
          <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
            <div
              className="h-full bg-[var(--teal)] transition-all"
              style={{ width: `${((totalNet / totalGross) * 100).toFixed(1)}%` }}
            />
            <div
              className="h-full bg-[var(--accent)]"
              style={{ width: `${((totalCommission / totalGross) * 100).toFixed(1)}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />
              Vendor payouts ({((totalNet / totalGross) * 100).toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              Platform commission ({((totalCommission / totalGross) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Vendor breakdown */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Seller performance</h2>
            {topVendor && (
              <span className="rounded-full border border-[var(--line)] bg-white/72 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                Top seller: {topVendor.vendorName}
              </span>
            )}
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
                  {["Vendor", "Gross sales", "Net payout", "Commission", "Products", "Fulfillment"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-[var(--muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendorRows.map((row, i) => (
                  <tr
                    key={row.vendorSlug}
                    className={`border-b border-[var(--line)] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[rgba(15,23,42,0.015)]"}`}
                  >
                    <td className="px-5 py-4 font-semibold">{row.vendorName}</td>
                    <td className="px-5 py-4">{formatPrice(row.grossSales)}</td>
                    <td className="px-5 py-4 font-semibold text-[var(--teal)]">
                      {formatPrice(row.netPayout)}
                    </td>
                    <td className="px-5 py-4 text-[var(--accent)]">
                      {formatPrice(Math.round(row.grossSales * COMMISSION))}
                    </td>
                    <td className="px-5 py-4">{row.activeProducts}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(8,145,178,0.1)] px-2.5 py-0.5 text-xs font-semibold text-[var(--teal)]">
                        {row.fulfillmentRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Avg fulfillment bar */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(15,23,42,0.03)] p-6">
            <p className="text-sm font-semibold text-[var(--muted)]">
              Average fulfillment rate
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[var(--teal)]">
              {avgFulfillment.toFixed(1)}%
            </p>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
              <div
                className="h-full rounded-full bg-[var(--teal)]"
                style={{ width: `${avgFulfillment}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">Across {vendors.length} active sellers</p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(15,23,42,0.03)] p-6">
            <p className="text-sm font-semibold text-[var(--muted)]">
              Average payout per vendor
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
              {formatPrice(Math.round(totalNet / (vendors.length || 1)))}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Total {formatPrice(totalNet)} distributed across {vendors.length} sellers at 92% of gross.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-start">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-white"
          >
            <Store className="h-4 w-4" />
            Back to control room
          </Link>
        </div>
      </div>
    </div>
  );
}
