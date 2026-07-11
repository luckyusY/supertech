import type { Metadata } from "next";
import { Store } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminVendorsTable } from "@/components/admin-vendors-table";
import { requirePageSession } from "@/lib/auth";
import { getAdminVendors } from "@/lib/public-marketplace";

export const metadata: Metadata = {
  title: "Manage Vendors — Admin",
};

export const dynamic = "force-dynamic";

export default async function ManageVendorsPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  const vendors = await getAdminVendors();
  const activeCount = vendors.filter((v) => !v.disabled).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Store}
        eyebrow="Sellers"
        title="Manage vendors"
        description="Search, open detail, edit profiles, disable built-in stores, or remove accounts."
        actions={
          <>
            <span className="rounded-full bg-[var(--info-soft)] px-3 py-1 text-xs font-semibold text-[var(--info)]">
              {activeCount} active
            </span>
            {vendors.length > activeCount ? (
              <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                {vendors.length - activeCount} disabled
              </span>
            ) : null}
          </>
        }
      />

      <div className="mt-6">
        <AdminVendorsTable vendors={vendors} />
      </div>
    </div>
  );
}
