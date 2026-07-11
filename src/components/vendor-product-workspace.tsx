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
      <div className="soft-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Your catalog
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
          Submissions & live listings
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {canSwitchVendor
            ? "Vendor switch updates both the form and this list."
            : "Pending, approved, and rejected listings for your store."}
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
