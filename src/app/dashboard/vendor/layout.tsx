import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { VendorNav } from "@/components/vendor-nav";
import { getAccessibleVendorsAsync, requirePageSession } from "@/lib/auth";
import { getVendorNavBadges } from "@/lib/dashboard-attention";

export const dynamic = "force-dynamic";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const session = await requirePageSession({
    roles: ["vendor", "admin"],
    nextPath: "/dashboard/vendor",
  });
  const availableVendors = await getAccessibleVendorsAsync(session);
  const currentVendor = availableVendors[0];

  if (!currentVendor) {
    redirect("/forbidden");
  }

  const subtitle = session.role === "admin" ? "Admin access" : session.email;
  const hasPaymentMethod = Boolean(
    currentVendor.momoMerchantCode?.trim() || currentVendor.momoBusinessName?.trim(),
  );
  const badges = await getVendorNavBadges({
    vendorSlug: currentVendor.slug,
    hasPaymentMethod,
  });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] lg:flex-row">
      <VendorNav storeName={currentVendor.name} subtitle={subtitle} badges={badges} />
      <div className="min-w-0 flex-1" id="main-content">
        {children}
      </div>
    </div>
  );
}
