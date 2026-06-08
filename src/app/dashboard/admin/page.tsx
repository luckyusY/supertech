import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
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
      bg: "bg-[rgba(8,145,178,0.08)]",
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
      bg: "bg-[rgba(37,99,235,0.08)]",
    },
    {
      label: "Live products",
      value: String(products.length),
      icon: Package,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  const shortcuts = [
    {
      href: "/dashboard/admin/orders",
      label: "Order management",
      desc: "Confirm, fulfill, and track customer orders",
      icon: ShoppingBag,
    },
    {
      href: "/dashboard/admin/approvals",
      label: "Approvals queue",
      desc: `${pendingApplicationsCount} vendor application${pendingApplicationsCount === 1 ? "" : "s"} pending`,
      icon: BadgeCheck,
    },
    {
      href: "/dashboard/admin/products",
      label: "Manage products",
      desc: "Browse, disable, and write blogs for listings",
      icon: Package,
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow={dateLabel}
        title={`Welcome back, ${session.name.split(" ")[0]}.`}
        description="Here's what's happening across the marketplace today."
      />

      {/* Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="soft-card p-5">
            <div className={`inline-flex rounded-[0.75rem] p-2 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Quick shortcuts */}
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="soft-card group flex items-start gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <span className="inline-flex rounded-[0.75rem] bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold">
                  {item.label}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-[var(--muted)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Platform overview */}
        <div className="dark-card p-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
            Platform overview
          </p>
          <div className="mt-5 space-y-3">
            {[
              { icon: Store, label: "Verified sellers", value: `${vendors.length} active` },
              { icon: Package, label: "Listed products", value: `${products.length} live` },
              { icon: Users, label: "Marketplace status", value: "Open to buyers" },
              { icon: CheckCircle2, label: "Buyer protection", value: "Enabled" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-[rgba(255,255,255,0.55)]" />
                  <p className="text-sm text-[rgba(255,255,255,0.76)]">{item.label}</p>
                </div>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor health */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Vendor health</h2>
          </div>
          <span className="rounded-full bg-[rgba(8,145,178,0.1)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
            {vendors.length} sellers
          </span>
        </div>
        <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-[var(--line)]">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
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
                  className={`border-b border-[var(--line)] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[rgba(15,23,42,0.015)]"}`}
                >
                  <td className="px-5 py-4 font-semibold">{vendor.name}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{vendor.location}</td>
                  <td className="px-5 py-4">{vendor.activeProducts}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(8,145,178,0.1)] px-2.5 py-0.5 text-xs font-semibold text-[var(--teal)]">
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
    </div>
  );
}
