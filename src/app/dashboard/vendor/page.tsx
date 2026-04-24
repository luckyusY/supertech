import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  ImagePlus,
  Package,
  PackageSearch,
  ShoppingBag,
  Star,
  Wallet,
} from "lucide-react";
import { VendorOrderQueue } from "@/components/vendor-order-queue";
import { VendorPayoutSummary } from "@/components/vendor-payout-summary";
import { VendorProductWorkspace } from "@/components/vendor-product-workspace";
import { getAccessibleVendorsAsync, requirePageSession } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";
import { vendorDashboardHighlights } from "@/lib/marketplace";
import { getProductListingCategories } from "@/lib/public-marketplace";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your products, orders, and payouts.",
};

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const session = await requirePageSession({
    roles: ["vendor", "admin"],
    nextPath: "/dashboard/vendor",
  });
  const integrationStatus = getIntegrationStatus();
  const availableVendors = await getAccessibleVendorsAsync(session);
  const categories = await getProductListingCategories();
  const initialVendorSlug = availableVendors[0]?.slug ?? "";
  const canSwitchVendor = session.role === "admin";
  const currentVendor = availableVendors[0];

  if (!initialVendorSlug) {
    redirect("/forbidden");
  }

  const highlightIcons = [ShoppingBag, Package, Star];

  return (
    <div className="page-shell py-8">
      {/* Header */}
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Seller workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {currentVendor ? currentVendor.name : session.name}
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              {session.role === "admin"
                ? "You have admin access to all vendor workspaces."
                : `Manage your products, fulfill orders, and track your earnings.`}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {vendorDashboardHighlights.map((item, i) => {
                const Icon = highlightIcons[i] ?? Package;
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5"
                  >
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                    <p className="mt-4 text-sm text-[var(--muted)]">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick info panel */}
          <div className="dark-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
              Account
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Signed in as</p>
                <p className="mt-0.5 font-semibold text-white">{session.name}</p>
              </div>
              {currentVendor && (
                <>
                  <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">Store</p>
                    <p className="mt-0.5 font-semibold text-white">{currentVendor.name}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">Location</p>
                    <p className="mt-0.5 font-semibold text-white">{currentVendor.location}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">Fulfillment rate</p>
                    <p className="mt-0.5 font-semibold text-[var(--teal)]">{currentVendor.fulfillmentRate}</p>
                  </div>
                </>
              )}
            </div>

            {/* Upload status */}
            <div className="mt-4 rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-[rgba(255,255,255,0.55)]" />
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Image uploads</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                {integrationStatus.cloudinaryServer.configured
                  ? "Ready"
                  : "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product workspace */}
      <div className="mt-6">
        <VendorProductWorkspace
          availableVendors={availableVendors}
          initialVendorSlug={initialVendorSlug}
          canSwitchVendor={canSwitchVendor}
          categories={categories}
        />
      </div>

      {/* Order queue + onboarding */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <PackageSearch className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Order queue</h2>
          </div>
          <div className="mt-6">
            <VendorOrderQueue
              availableVendors={availableVendors}
              initialVendorSlug={initialVendorSlug}
              canSwitchVendor={canSwitchVendor}
            />
          </div>
        </section>

        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Seller checklist</h2>
          </div>
          <div className="mt-5 space-y-3">
            {[
              "Products reviewed and brand-checked",
              "Product images uploaded via gallery",
              "Orders routed with fulfillment expectations set",
              "Payout method confirmed with marketplace",
            ].map((item, i) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.2rem] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(8,145,178,0.12)] text-xs font-bold text-[var(--teal)]">
                  {i + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Payouts */}
      <div className="mt-6">
        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Payouts &amp; commissions</h2>
          </div>
          <div className="mt-6">
            <VendorPayoutSummary />
          </div>
        </section>
      </div>
    </div>
  );
}
