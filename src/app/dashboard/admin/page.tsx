import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  BadgeCheck,
  CheckCircle2,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminOrderOperations } from "@/components/admin-order-operations";
import { ProductApprovalInbox } from "@/components/product-approval-inbox";
import { VendorApplicationsInbox } from "@/components/vendor-applications-inbox";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { vendors, products } from "@/lib/marketplace";
import { getOrderRequestOperationsSnapshot } from "@/lib/order-requests";
import { getVendorApplications } from "@/lib/vendor-applications";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Marketplace control room — orders, approvals, vendors, and performance.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin",
  });

  const [operationsSnapshot, vendorApplications] = await Promise.all([
    hasMongoConfig() ? getOrderRequestOperationsSnapshot().catch(() => null) : Promise.resolve(null),
    hasMongoConfig() ? getVendorApplications().catch(() => []) : Promise.resolve([]),
  ]);
  const pendingApplicationsCount = vendorApplications.filter((a) => a.status === "pending").length;

  const metricCards = [
    {
      label: "Gross marketplace value",
      value: operationsSnapshot ? formatPrice(operationsSnapshot.estimatedRevenue) : "$42,800",
      icon: TrendingUp,
      color: "text-[var(--teal)]",
      bg: "bg-[rgba(26,123,112,0.08)]",
    },
    {
      label: "Pending confirmations",
      value: operationsSnapshot ? String(operationsSnapshot.pendingConfirmation) : "3",
      icon: BadgeCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active fulfillment",
      value: operationsSnapshot ? String(operationsSnapshot.activeFulfillment) : "6",
      icon: ShoppingBag,
      color: "text-[var(--accent)]",
      bg: "bg-[rgba(228,90,54,0.08)]",
    },
    {
      label: "Live products",
      value: String(products.length),
      icon: Package,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="page-shell py-8">
      {/* Header */}
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {dateLabel}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Welcome back, {session.name.split(" ")[0]}.
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              Here&apos;s what&apos;s happening across the marketplace today.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5"
                >
                  <div className={`inline-flex rounded-[0.75rem] p-2 ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <p className="mt-4 text-sm text-[var(--muted)]">{card.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Platform overview */}
          <div className="dark-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
              Platform overview
            </p>
            <div className="mt-5 space-y-4">
              {[
                { icon: Store, label: "Verified sellers", value: `${vendors.length} active` },
                { icon: Package, label: "Listed products", value: `${products.length} live` },
                { icon: Users, label: "Marketplace status", value: "Open to buyers" },
                { icon: CheckCircle2, label: "Buyer protection", value: "Enabled on all orders" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-[rgba(255,255,255,0.55)]" />
                    <p className="text-sm text-[rgba(255,255,255,0.76)]">{item.label}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/admin/analytics"
              className="mt-6 flex items-center justify-between rounded-[1.2rem] bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View analytics
              </span>
              <span className="text-[rgba(255,255,255,0.5)]">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Vendor health */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Vendor health</h2>
          </div>
          <span className="rounded-full bg-[rgba(26,123,112,0.1)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
            {vendors.length} sellers
          </span>
        </div>
        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[rgba(16,32,25,0.03)]">
                {["Vendor", "Location", "Products", "Fulfillment", "Rating"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-[var(--muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, i) => (
                <tr
                  key={vendor.id}
                  className={`border-b border-[var(--line)] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[rgba(16,32,25,0.015)]"}`}
                >
                  <td className="px-5 py-4 font-semibold">{vendor.name}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{vendor.location}</td>
                  <td className="px-5 py-4">{vendor.activeProducts}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(26,123,112,0.1)] px-2.5 py-0.5 text-xs font-semibold text-[var(--teal)]">
                      {vendor.fulfillmentRate}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                    <span className="ml-1 text-[var(--muted)]">/ 5</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor applications */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Vendor applications</h2>
          </div>
          {pendingApplicationsCount > 0 && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
              {pendingApplicationsCount} pending
            </span>
          )}
        </div>
        <div className="mt-6">
          <VendorApplicationsInbox
            initialApplications={vendorApplications.map((a) => ({
              ...a,
              _id: String(a._id),
              createdAt: a.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>

      {/* Order operations + Product approvals */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Order management</h2>
          </div>
          <div className="mt-6">
            <AdminOrderOperations />
          </div>
        </section>

        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Product approvals</h2>
          </div>
          <div className="mt-6">
            <ProductApprovalInbox />
          </div>
        </section>
      </div>
    </div>
  );
}
