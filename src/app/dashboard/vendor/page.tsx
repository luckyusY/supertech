import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ImagePlus, PackageSearch } from "lucide-react";
import { VendorOrderQueue } from "@/components/vendor-order-queue";
import { VendorProductWorkspace } from "@/components/vendor-product-workspace";
import { getAccessibleVendors, requirePageSession } from "@/lib/auth";
import { getIntegrationStatus } from "@/lib/integrations";
import { sellerChecklist, vendorDashboardHighlights } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Seller-side dashboard starter for the marketplace.",
};

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const session = await requirePageSession({
    roles: ["vendor", "admin"],
    nextPath: "/dashboard/vendor",
  });
  const integrationStatus = getIntegrationStatus();
  const availableVendors = getAccessibleVendors(session);
  const initialVendorSlug = availableVendors[0]?.slug ?? "";
  const canSwitchVendor = session.role === "admin";

  if (!initialVendorSlug) {
    redirect("/forbidden");
  }

  return (
    <div className="page-shell py-8">
      <div className="dark-card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
              Vendor workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Seller operations with room for real product publishing flows.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(255,255,255,0.76)]">
              This seller workspace now covers real product publishing and vendor-filtered
              order visibility while the marketplace is still running without online payments.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-[rgba(255,255,255,0.78)]">
              Signed in as {session.name}
              {session.role === "vendor" && availableVendors[0]
                ? ` for ${availableVendors[0].name}`
                : " with admin vendor-switch access"}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {vendorDashboardHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4"
                >
                  <p className="text-sm text-[rgba(255,255,255,0.62)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
              Publishing checklist
            </p>
            <div className="mt-5 space-y-3">
              {sellerChecklist.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-[rgba(255,255,255,0.76)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <VendorProductWorkspace
          availableVendors={availableVendors}
          initialVendorSlug={initialVendorSlug}
          canSwitchVendor={canSwitchVendor}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <PackageSearch className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Seller fulfillment queue
            </h2>
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
            <ImagePlus className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Upload readiness
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {[
              {
                label: "Cloudinary server",
                value: integrationStatus.cloudinaryServer.configured
                  ? "Signed uploads ready"
                  : "Missing server credentials",
              },
              {
                label: "Cloudinary client",
                value: integrationStatus.cloudinaryClient.configured
                  ? "Delivery URL ready"
                  : "Expose cloud name for client widgets",
              },
              {
                label: "Upload endpoint",
                value: "/api/cloudinary/sign",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.25rem] border border-[var(--line)] bg-white/70 p-4"
              >
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                  {item.value}
                </p>
              </div>
            ))}
            <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-[rgba(16,32,25,0.03)] p-4 text-sm leading-7 text-[var(--muted)]">
              This vendor dashboard now spans Phase 2 and Phase 3. Sellers can upload
              product images to Cloudinary, submit products for review, and track the
              manual order queue that belongs to their storefront.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
