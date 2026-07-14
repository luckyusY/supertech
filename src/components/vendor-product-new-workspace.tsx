"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductSubmissionForm } from "@/components/product-submission-form";
import type { Vendor } from "@/lib/marketplace";

type VendorProductNewWorkspaceProps = {
  availableVendors: Vendor[];
  initialVendorSlug: string;
  canSwitchVendor: boolean;
  categories: string[];
};

export function VendorProductNewWorkspace({
  availableVendors,
  initialVendorSlug,
  canSwitchVendor,
  categories,
}: VendorProductNewWorkspaceProps) {
  const [vendorSlug, setVendorSlug] = useState(initialVendorSlug);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl">
      <ProductSubmissionForm
        availableVendors={availableVendors}
        canSwitchVendor={canSwitchVendor}
        vendorSlug={vendorSlug}
        categories={categories}
        onVendorChange={setVendorSlug}
        onSubmitted={() => {
          // After successfully submitting a product, go back to the products list
          router.push("/dashboard/vendor/products");
          router.refresh();
        }}
      />
    </div>
  );
}
