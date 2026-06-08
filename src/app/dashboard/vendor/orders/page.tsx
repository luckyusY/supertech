import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { VendorOrderQueue } from "@/components/vendor-order-queue";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Orders — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const { availableVendors, initialVendorSlug, canSwitchVendor } = await loadVendorContext(
    "/dashboard/vendor/orders",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={ShoppingBag}
        eyebrow="Fulfillment"
        title="Order queue"
        description="Confirm, prepare, and fulfill the orders coming into your store."
      />
      <div className="mt-6 soft-card p-6 sm:p-8">
        <VendorOrderQueue
          availableVendors={availableVendors}
          initialVendorSlug={initialVendorSlug}
          canSwitchVendor={canSwitchVendor}
        />
      </div>
    </div>
  );
}
