import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { VendorCard } from "@/components/vendor-card";
import { getPublicVendors } from "@/lib/public-marketplace";

export const metadata: Metadata = {
  title: "Vendors — SuperTech",
  description: "Browse all verified sellers on the SuperTech marketplace.",
};

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await getPublicVendors();

  return (
    <div className="page-shell py-5 sm:py-8">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Seller directory</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Our vendors</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Every seller on SuperTech is reviewed for product quality, fulfillment reliability, and customer service before going live.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 rounded-[var(--radius-md)] border border-[rgba(8,145,178,0.25)] bg-[rgba(8,145,178,0.06)] px-4 py-3 text-sm sm:flex">
          <BadgeCheck className="h-5 w-5 text-[var(--teal)]" />
          <span className="font-semibold">{vendors.length} verified sellers</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </div>
  );
}
