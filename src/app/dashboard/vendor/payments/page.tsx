import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { VendorPaymentForm } from "@/components/vendor-payment-form";
import { getVendorBySlug } from "@/lib/marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Payment method — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorPaymentsPage() {
  const { currentVendor } = await loadVendorContext("/dashboard/vendor/payments");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={CreditCard}
        eyebrow="Get paid"
        title="Payment method"
        description="Set the MTN MoMoPay merchant details buyers use to pay you directly."
      />
      <div className="mt-6">
        <VendorPaymentForm
          vendorSlug={currentVendor.slug}
          initialMerchantCode={currentVendor.momoMerchantCode ?? ""}
          initialBusinessName={currentVendor.momoBusinessName ?? ""}
          canEdit={!getVendorBySlug(currentVendor.slug)}
        />
      </div>
    </div>
  );
}
