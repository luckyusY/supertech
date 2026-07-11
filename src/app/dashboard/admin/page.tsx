import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getOrderRequestOperationsSnapshot } from "@/lib/order-requests";
import { getProductSubmissions } from "@/lib/product-submissions";
import { getPublicProducts, getPublicVendors } from "@/lib/public-marketplace";
import { getVendorApplications } from "@/lib/vendor-applications";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Marketplace control room — attention queues, orders, and platform health.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin",
  });

  const mongo = hasMongoConfig();

  const [operationsSnapshot, vendorApplications, productSubmissions, vendors, products] =
    await Promise.all([
      mongo ? getOrderRequestOperationsSnapshot().catch(() => null) : Promise.resolve(null),
      mongo ? getVendorApplications().catch(() => []) : Promise.resolve([]),
      mongo
        ? getProductSubmissions({ status: "pending_review" }).catch(() => [])
        : Promise.resolve([]),
      getPublicVendors().catch(() => []),
      getPublicProducts().catch(() => []),
    ]);

  const pendingApplicationsCount = vendorApplications.filter((a) => a.status === "pending").length;
  const pendingProductsCount = productSubmissions.length;
  const pendingOrders = operationsSnapshot?.pendingConfirmation ?? 0;
  const activeFulfillment = operationsSnapshot?.activeFulfillment ?? 0;

  const attentionItems = [
    {
      href: "/dashboard/admin/orders",
      label: "Orders awaiting confirmation",
      count: pendingOrders,
      tone: "warning" as const,
      icon: ShoppingBag,
      cta: "Review orders",
    },
    {
      href: "/dashboard/admin/approvals",
      label: "Vendor applications pending",
      count: pendingApplicationsCount,
      tone: "warning" as const,
      icon: BadgeCheck,
      cta: "Open approvals",
    },
    {
      href: "/dashboard/admin/products",
      label: "Product submissions to review",
      count: pendingProductsCount,
      tone: "info" as const,
      icon: Package,
      cta: "Review products",
    },
    {
      href: "/dashboard/admin/orders",
      label: "Active fulfillment",
      count: activeFulfillment,
      tone: "neutral" as const,
      icon: TrendingUp,
      cta: "View pipeline",
    },
  ].filter((item) => item.count > 0 || item.label === "Orders awaiting confirmation");

  const needsActionCount = pendingOrders + pendingApplicationsCount + pendingProductsCount;

  const metricCards = [
    {
      label: "Gross marketplace value",
      value: operationsSnapshot ? formatPrice(operationsSnapshot.estimatedRevenue) : "—",
      icon: TrendingUp,
      color: "text-[var(--info)]",
      bg: "bg-[var(--info-soft)]",
    },
    {
      label: "Needs action today",
      value: String(needsActionCount),
      icon: AlertCircle,
      color: "text-[var(--warning)]",
      bg: "bg-[var(--warning-soft)]",
    },
    {
      label: "Live products",
      value: String(products.length),
      icon: Package,
      color: "text-[var(--accent)]",
      bg: "bg-[var(--accent-soft)]",
    },
    {
      label: "Active vendors",
      value: String(vendors.length),
      icon: Store,
      color: "text-[var(--success)]",
      bg: "bg-[var(--success-soft)]",
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow={dateLabel}
        title={`Welcome back, ${session.name.split(" ")[0]}.`}
        description="Clear what needs you first — then scan marketplace health."
      />

      {/* Attention — primary ops surface */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Attention
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              {needsActionCount > 0
                ? `${needsActionCount} item${needsActionCount === 1 ? "" : "s"} need action`
                : "You’re caught up"}
            </h2>
          </div>
          <Link
            href="/dashboard/admin/orders"
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Open orders
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {attentionItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="soft-card group flex items-center gap-4 p-4 transition-shadow hover:shadow-md"
            >
              <span
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
                  item.tone === "warning"
                    ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                    : item.tone === "info"
                      ? "bg-[var(--info-soft)] text-[var(--info)]"
                      : "bg-[var(--neutral-100)] text-[var(--foreground)]"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em]">{item.count}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] opacity-80 group-hover:opacity-100">
                {item.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="soft-card p-5">
            <div className={`inline-flex rounded-[var(--radius-md)] p-2 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Mobile section grid */}
      <div className="mt-6 xl:hidden">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          All sections
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { href: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag },
            { href: "/dashboard/admin/approvals", label: "Approvals", icon: BadgeCheck },
            { href: "/dashboard/admin/products", label: "Products", icon: Package },
            { href: "/dashboard/admin/vendors", label: "Vendors", icon: Store },
            { href: "/dashboard/admin/events", label: "Events", icon: TrendingUp },
          ].map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="soft-card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
            >
              <span className="inline-flex rounded-[var(--radius-md)] bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                <page.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">{page.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Vendor health table */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Vendor health</h2>
          </div>
          <span className="rounded-full bg-[var(--info-soft)] px-3 py-1 text-xs font-semibold text-[var(--info)]">
            {vendors.length} sellers
          </span>
        </div>
        <div
          className="dashboard-table-scroll mt-6 overflow-auto rounded-[var(--radius-lg)] border border-[var(--line)]"
          style={{ maxHeight: "min(28rem, calc(100dvh - 16rem))" }}
        >
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="sticky top-0 z-[1]">
              <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)] shadow-[0_1px_0_var(--line)]">
                {["Vendor", "Location", "Products", "Fulfillment", "Rating"].map((h) => (
                  <th
                    key={h}
                    className="bg-[var(--neutral-50)] px-5 py-3 text-left font-semibold text-[var(--muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--muted)]">
                    No vendors yet.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor, i) => (
                  <tr
                    key={vendor.id}
                    className={`border-b border-[var(--line)] last:border-0 ${
                      i % 2 === 0 ? "bg-white" : "bg-[var(--neutral-50)]"
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold">{vendor.name}</td>
                    <td className="px-5 py-4 text-[var(--muted)]">{vendor.location}</td>
                    <td className="px-5 py-4">{vendor.activeProducts}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--success)]">
                        {vendor.fulfillmentRate}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                      <span className="ml-1 text-[var(--muted)]">/ 5</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
