import type { Metadata } from "next";
import { Package } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import {
  AdminProductsTable,
  type AdminProductRow,
} from "@/components/admin-products-table";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { products as seedProducts } from "@/lib/marketplace";
import { getProductSubmissions } from "@/lib/product-submissions";
import { getAdminProductHiddenSlugs } from "@/lib/public-marketplace";

export const metadata: Metadata = {
  title: "Manage Products — Admin",
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  approved: "Approved",
  pending_review: "Pending",
  rejected: "Rejected",
  seed: "Built-in",
  disabled: "Disabled",
};

export default async function ManageProductsPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });

  const [submissions, hiddenSlugs] = await Promise.all([
    hasMongoConfig()
      ? getProductSubmissions({ limit: 500 }).catch(() => [])
      : Promise.resolve([]),
    getAdminProductHiddenSlugs(),
  ]);

  const activeSeeds = seedProducts.filter((p) => !hiddenSlugs.has(p.slug)).length;
  const disabledSeeds = seedProducts.length - activeSeeds;

  const submissionRows: AdminProductRow[] = submissions.map((sub) => ({
    id: sub.id,
    slug: sub.slug,
    name: sub.name,
    vendorLabel: sub.vendorName,
    category: sub.category,
    price: sub.price,
    heroImage: sub.heroImage,
    status: sub.status,
    statusLabel: STATUS_LABELS[sub.status] ?? sub.status,
    dateLabel: new Date(sub.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    kind: "submission",
    submissionId: sub.submissionId,
  }));

  const seedRows: AdminProductRow[] = seedProducts.map((product) => {
    const isDisabled = hiddenSlugs.has(product.slug);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      vendorLabel: product.vendorSlug,
      category: product.category,
      price: product.price,
      heroImage: product.heroImage,
      status: isDisabled ? "disabled" : "seed",
      statusLabel: isDisabled ? STATUS_LABELS.disabled : STATUS_LABELS.seed,
      kind: "seed",
      disabled: isDisabled,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Package}
        eyebrow="Catalog"
        title="Manage products"
        description="Search listings, paginate long catalogs, disable built-ins, and open AI blog tools."
        actions={
          <>
            <span className="rounded-full bg-[var(--info-soft)] px-3 py-1 text-xs font-semibold text-[var(--info)]">
              {activeSeeds + submissions.filter((s) => s.status === "approved").length} live-ish
            </span>
            {disabledSeeds > 0 ? (
              <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                {disabledSeeds} disabled seeds
              </span>
            ) : null}
          </>
        }
      />

      {submissionRows.length > 0 ? (
        <div className="mt-6">
          <AdminProductsTable title="Vendor submissions" rows={submissionRows} />
        </div>
      ) : null}

      <div className="mt-8">
        <AdminProductsTable title="Built-in products" rows={seedRows} />
      </div>
    </div>
  );
}
