import type { Metadata } from "next";
import { ImagePlus, PackageSearch } from "lucide-react";
import { VendorProductWorkspace } from "@/components/vendor-product-workspace";
import { getIntegrationStatus } from "@/lib/integrations";
import { sellerChecklist, vendorDashboardHighlights, vendorOrders } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Seller-side dashboard starter for the marketplace.",
};

export default function VendorDashboardPage() {
  const integrationStatus = getIntegrationStatus();

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
              This shell is ready for role-based auth, inventory forms, image uploads,
              and vendor-specific order management once we connect real persistence.
            </p>
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
        <VendorProductWorkspace />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <PackageSearch className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">
              Recent order queue
            </h2>
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
            <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
              <thead className="bg-[rgba(16,32,25,0.04)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Buyer</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] bg-white">
                {vendorOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 font-semibold">{order.id}</td>
                    <td className="px-4 py-4">{order.buyer}</td>
                    <td className="px-4 py-4">{order.item}</td>
                    <td className="px-4 py-4 text-[var(--teal)]">{order.status}</td>
                    <td className="px-4 py-4 font-semibold">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              This vendor dashboard is now in Phase 2. Sellers can upload product
              images to Cloudinary, submit products for review, and track approval
              status without needing payments first.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
