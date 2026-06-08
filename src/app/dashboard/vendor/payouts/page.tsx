import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { VendorPayoutSummary } from "@/components/vendor-payout-summary";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Payouts — Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorPayoutsPage() {
  await loadVendorContext("/dashboard/vendor/payouts");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Wallet}
        eyebrow="Earnings"
        title="Payouts & commissions"
        description="Track what you've earned, what's pending, and what's been paid out."
      />
      <div className="mt-6 soft-card p-6 sm:p-8">
        <VendorPayoutSummary />
      </div>
    </div>
  );
}
