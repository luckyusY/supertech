import type { Metadata } from "next";
import { Palette } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { VendorStorefrontForm } from "@/components/vendor-storefront-form";
import { getVendorBySlug } from "@/lib/marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Storefront — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorStorefrontPage() {
  const { currentVendor } = await loadVendorContext("/dashboard/vendor/storefront");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Palette}
        eyebrow="Branding"
        title="Storefront"
        description="Customize how your store looks to shoppers — cover image, logo, and headline."
      />
      <div className="mt-6">
        <VendorStorefrontForm
          vendorSlug={currentVendor.slug}
          vendorName={currentVendor.name}
          initialCoverImage={currentVendor.coverImage}
          initialLogoMark={currentVendor.logoMark}
          initialHeadline={currentVendor.headline}
          accent={currentVendor.accent}
          canEdit={!getVendorBySlug(currentVendor.slug)}
        />
      </div>
    </div>
  );
}
