import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { VendorCard } from "@/components/vendor-card";
import { vendors } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Vendors",
  description: "Browse marketplace sellers and their storefront positioning.",
};

export default function VendorsPage() {
  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <SectionHeading
          eyebrow="Seller directory"
          title="Merchants should feel distinct, trustworthy, and easy to compare."
          description="This route gives each seller a visible brand, fast credibility cues, and a direct path into their storefront."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>
    </div>
  );
}
