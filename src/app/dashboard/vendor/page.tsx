import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { getIntegrationStatus, hasMongoConfig } from "@/lib/integrations";
import { getOrderRequests } from "@/lib/order-requests";
import { getProductSubmissions } from "@/lib/product-submissions";
import { getPublicVendorProducts } from "@/lib/public-marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your products, orders, and payouts.",
};

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const { session, currentVendor } = await loadVendorContext("/dashboard/vendor");
  const integrationStatus = getIntegrationStatus();
  const mongo = hasMongoConfig();

  const [vendorProducts, submissions, openOrders] = await Promise.all([
    getPublicVendorProducts(currentVendor.slug).catch(() => []),
    mongo
      ? getProductSubmissions({ vendorSlug: currentVendor.slug, limit: 50 }).catch(() => [])
      : Promise.resolve([]),
    mongo
      ? getOrderRequests({ vendorSlug: currentVendor.slug, limit: 50 }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const pendingSubmissions = submissions.filter((s) => s.status === "pending_review").length;
  const liveProducts = vendorProducts.length;
  const openOrderCount = openOrders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  ).length;
  const needsConfirm = openOrders.filter((o) => o.status === "pending_confirmation").length;

  const hasPaymentMethod = Boolean(
    currentVendor.momoMerchantCode?.trim() || currentVendor.momoBusinessName?.trim(),
  );
  const hasStorefrontCopy = Boolean(currentVendor.headline?.trim());
  const hasProducts = liveProducts > 0 || submissions.length > 0;
  const cloudinaryReady = integrationStatus.cloudinaryServer.configured;

  const checklist = [
    {
      id: "profile",
      label: "Complete store profile",
      done: hasStorefrontCopy,
      href: "/dashboard/vendor/storefront",
      hint: "Name, headline, and storefront details",
    },
    {
      id: "payment",
      label: "Set MoMoPay payment method",
      done: hasPaymentMethod,
      href: "/dashboard/vendor/payments",
      hint: "Required so buyers can pay you locally",
    },
    {
      id: "product",
      label: "Submit your first product",
      done: hasProducts,
      href: "/dashboard/vendor/products",
      hint: "Listings go live after SuperTech review",
    },
    {
      id: "images",
      label: "Image uploads ready",
      done: cloudinaryReady,
      href: "/dashboard/vendor/products",
      hint: cloudinaryReady ? "Cloudinary is configured" : "Ask admin if uploads fail",
    },
  ];

  const checklistDone = checklist.filter((item) => item.done).length;
  const nextStep = checklist.find((item) => !item.done);

  const attentionItems = [
    needsConfirm > 0
      ? {
          href: "/dashboard/vendor/orders",
          label: "Orders to confirm",
          count: needsConfirm,
          cta: "Open queue",
        }
      : null,
    openOrderCount > 0
      ? {
          href: "/dashboard/vendor/orders",
          label: "Open orders",
          count: openOrderCount,
          cta: "Fulfill",
        }
      : null,
    pendingSubmissions > 0
      ? {
          href: "/dashboard/vendor/products",
          label: "Products pending review",
          count: pendingSubmissions,
          cta: "View products",
        }
      : null,
    !hasPaymentMethod
      ? {
          href: "/dashboard/vendor/payments",
          label: "Payment method missing",
          count: 1,
          cta: "Set up MoMo",
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    label: string;
    count: number;
    cta: string;
  }>;

  const highlights = [
    { label: "Live products", value: String(liveProducts), icon: Package },
    { label: "Open orders", value: String(openOrderCount), icon: ShoppingBag },
    {
      label: "Rating",
      value: currentVendor.rating > 0 ? currentVendor.rating.toFixed(1) : "New",
      icon: Star,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow="Seller workspace"
        title={currentVendor.name}
        description={
          session.role === "admin"
            ? "You have admin access to this vendor workspace."
            : nextStep
              ? `Next step: ${nextStep.label.toLowerCase()}.`
              : "You’re set up — fulfill orders and grow your catalog."
        }
      />

      {/* Onboarding progress */}
      {checklistDone < checklist.length ? (
        <div className="mt-6 soft-card border-[var(--accent)]/20 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Getting started
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                {checklistDone} of {checklist.length} setup steps complete
              </h2>
            </div>
            {nextStep ? (
              <Link
                href={nextStep.href}
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                {nextStep.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--neutral-100)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${(checklistDone / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {checklist.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-3.5 py-3 transition-colors hover:border-[var(--accent)]"
                >
                  {item.done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted)]" />
                  )}
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        item.done ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{item.hint}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Attention */}
      {attentionItems.length > 0 ? (
        <section className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Needs attention
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {attentionItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="soft-card group flex items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em]">{item.count}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)]">
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Highlights */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.label} className="soft-card p-5">
            <item.icon className="h-5 w-5 text-[var(--accent)]" />
            <p className="mt-4 text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/dashboard/vendor/products",
            label: "Products",
            desc: "Add & manage listings",
            icon: Package,
          },
          {
            href: "/dashboard/vendor/orders",
            label: "Orders",
            desc: "Confirm and fulfill",
            icon: ShoppingBag,
          },
          {
            href: "/dashboard/vendor/payments",
            label: "Payments",
            desc: "MoMoPay merchant details",
            icon: CreditCard,
          },
          {
            href: "/dashboard/vendor/ai",
            label: "AI SEO Studio",
            desc: "Product blogs & copy",
            icon: Sparkles,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="soft-card group flex items-start gap-3 p-4 transition-shadow hover:shadow-md"
          >
            <span className="inline-flex rounded-[var(--radius-md)] bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 font-semibold">
                {item.label}
                <ArrowRight className="h-3.5 w-3.5 text-[var(--muted)] opacity-0 transition-all group-hover:opacity-100" />
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Account snapshot */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="dark-card p-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/55">Store</p>
          <p className="mt-3 text-xl font-semibold text-white">{currentVendor.name}</p>
          <p className="mt-1 text-sm text-white/65">{currentVendor.location}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-white/50">Categories</p>
              <p className="mt-1 font-semibold text-white">{currentVendor.categories.length}</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-white/50">Signed in</p>
              <p className="mt-1 truncate font-semibold text-white">{session.name}</p>
            </div>
          </div>
          <Link
            href={`/vendors/${currentVendor.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:underline"
          >
            <Store className="h-4 w-4" />
            View public storefront
          </Link>
        </div>

        <div className="soft-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Money
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--line)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <CreditCard className="h-4 w-4 text-[var(--accent)]" />
                MoMoPay method
              </span>
              <span
                className={`text-sm font-semibold ${
                  hasPaymentMethod ? "text-[var(--success)]" : "text-[var(--warning)]"
                }`}
              >
                {hasPaymentMethod ? "Configured" : "Missing"}
              </span>
            </div>
            <Link
              href="/dashboard/vendor/payouts"
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--line)] px-4 py-3 transition-colors hover:border-[var(--accent)]"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Wallet className="h-4 w-4 text-[var(--accent)]" />
                Payouts
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
