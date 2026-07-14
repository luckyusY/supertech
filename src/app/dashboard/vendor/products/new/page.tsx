import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { getProductListingCategories } from "@/lib/public-marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";
import { VendorProductNewWorkspace } from "@/components/vendor-product-new-workspace";

export const metadata: Metadata = {
  title: "Add New Product — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorNewProductPage() {
  const { availableVendors, initialVendorSlug, canSwitchVendor } = await loadVendorContext(
    "/dashboard/vendor/products/new",
  );
  const categories = await getProductListingCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Plus}
        eyebrow="Catalog"
        title="Add New Product"
        description="Submit a new product for review to be listed on your store."
      />
      <div className="mt-6">
        <VendorProductNewWorkspace
          availableVendors={availableVendors}
          initialVendorSlug={initialVendorSlug}
          canSwitchVendor={canSwitchVendor}
          categories={categories}
        />
      </div>
    </div>
  );
}
