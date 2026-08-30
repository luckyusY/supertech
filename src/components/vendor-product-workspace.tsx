"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {canSwitchVendor ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Store:
            </span>
            <select
              value={vendorSlug}
              onChange={(e) => setVendorSlug(e.target.value)}
              className="min-w-0 flex-1 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 sm:flex-none"
            >
              {availableVendors.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Store:
            </span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--neutral-50)] px-4 py-2 text-sm font-semibold">
              {availableVendors[0]?.name ?? "Your store"}
            </span>
          </div>
        )}

        <Link
          href="/dashboard/vendor/products/new"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--elevation-1)] sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Link>
      </div>

      <div className="soft-card p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Your catalog
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
          Submissions & live listings
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {canSwitchVendor
            ? "Pending, approved, and rejected listings for the selected store."
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
