import type { Metadata } from "next";
import { Package } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { VendorProductWorkspace } from "@/components/vendor-product-workspace";
import { getProductListingCategories } from "@/lib/public-marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Products — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorProductsPage() {
  const { availableVendors, initialVendorSlug, canSwitchVendor } = await loadVendorContext(
    "/dashboard/vendor/products",
  );
  const categories = await getProductListingCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Package}
        eyebrow="Catalog"
        title="Products"
        description="Submit new products for review and manage your existing listings."
      />
      <div className="mt-6">
        <VendorProductWorkspace
          availableVendors={availableVendors}
          initialVendorSlug={initialVendorSlug}
          canSwitchVendor={canSwitchVendor}
          categories={categories}
        />
      </div>
    </div>
  );
}
