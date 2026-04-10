"use client";

import { useState } from "react";
import { vendors } from "@/lib/marketplace";
import { ProductSubmissionForm } from "@/components/product-submission-form";
import { VendorProductSubmissions } from "@/components/vendor-product-submissions";

export function VendorProductWorkspace() {
  const [vendorSlug, setVendorSlug] = useState(vendors[0]?.slug ?? "");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
      <ProductSubmissionForm
        vendorSlug={vendorSlug}
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
          Switching the vendor selector updates both the submission form and this
          review list.
        </p>
        <div className="mt-6">
          <VendorProductSubmissions vendorSlug={vendorSlug} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
