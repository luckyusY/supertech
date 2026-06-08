import type { Metadata } from "next";
import { BadgeCheck, Store } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ProductApprovalInbox } from "@/components/product-approval-inbox";
import { VendorApplicationsInbox } from "@/components/vendor-applications-inbox";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getVendorApplications } from "@/lib/vendor-applications";

export const metadata: Metadata = {
  title: "Approvals — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/approvals" });

  const vendorApplications = hasMongoConfig()
    ? await getVendorApplications().catch(() => [])
    : [];
  const pendingApplicationsCount = vendorApplications.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={BadgeCheck}
        eyebrow="Review queue"
        title="Approvals"
        description="Review product submissions and vendor applications before they go live."
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Product approvals</h2>
          </div>
          <div className="mt-6">
            <ProductApprovalInbox />
          </div>
        </section>

        <section className="soft-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-xl font-semibold tracking-[-0.04em]">Vendor applications</h2>
            </div>
            {pendingApplicationsCount > 0 ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                {pendingApplicationsCount} pending
              </span>
            ) : null}
          </div>
          <div className="mt-6">
            <VendorApplicationsInbox
              initialApplications={vendorApplications.map((a) => ({
                ...a,
                _id: String(a._id),
                createdAt: a.createdAt.toISOString(),
              }))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
