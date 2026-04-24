"use client";

import { useEffect, useState } from "react";
import { ProductSubmissionForm } from "@/components/product-submission-form";
import { VendorProductSubmissions } from "@/components/vendor-product-submissions";
import type { Vendor } from "@/lib/marketplace";

type VendorProductWorkspaceProps = {
  availableVendors: Vendor[];
  initialVendorSlug: string;
  canSwitchVendor: boolean;
  categories: string[];
};

export function VendorProductWorkspace({
  availableVendors,
  initialVendorSlug,
  canSwitchVendor,
  categories,
}: VendorProductWorkspaceProps) {
  const [vendorSlug, setVendorSlug] = useState(initialVendorSlug);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setVendorSlug(initialVendorSlug);
  }, [initialVendorSlug]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
      <ProductSubmissionForm
        availableVendors={availableVendors}
        canSwitchVendor={canSwitchVendor}
        vendorSlug={vendorSlug}
        categories={categories}
        onVendorChange={setVendorSlug}
        onSubmitted={() => setRefreshKey((current) => current + 1)}
      />
      <div className="soft-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Submission timeline
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          Recent uploads for this vendor
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {canSwitchVendor
            ? "Switching the vendor selector updates both the submission form and this review list."
            : "This review list stays locked to the signed-in vendor account."}
        </p>
        <div className="mt-6">
          <VendorProductSubmissions
            vendorSlug={vendorSlug}
            refreshKey={refreshKey}
            categories={categories}
            onUpdated={() => setRefreshKey((current) => current + 1)}
          />
        </div>
      </div>
    </div>
  );
}
