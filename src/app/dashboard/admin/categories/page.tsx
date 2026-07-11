import type { Metadata } from "next";
import { LayoutGrid } from "lucide-react";
import { AdminAddCategoryForm } from "@/components/admin-add-category-form";
import { AdminCategoriesTable } from "@/components/admin-categories-table";
import { AdminPageHeader } from "@/components/admin-page-header";
import { requirePageSession } from "@/lib/auth";
import { getPublicCategorySummaries } from "@/lib/public-marketplace";

export const metadata: Metadata = {
  title: "Manage Categories - Admin",
};

export const dynamic = "force-dynamic";

export default async function ManageCategoriesPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/categories" });
  const categories = await getPublicCategorySummaries();
  const visibleCount = categories.filter((category) => !category.hidden).length;
  const hiddenCount = categories.length - visibleCount;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={LayoutGrid}
        eyebrow="Storefront"
        title="Manage categories"
        description="Hide or show categories across header, homepage shelves, and catalog filters."
        actions={
          <>
            <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
              {visibleCount} visible
            </span>
            {hiddenCount > 0 ? (
              <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                {hiddenCount} hidden
              </span>
            ) : null}
          </>
        }
      />

      <div className="mt-6 soft-card p-5 sm:p-6">
        <AdminAddCategoryForm />
      </div>

      <div className="mt-6">
        <AdminCategoriesTable categories={categories} />
      </div>
    </div>
  );
}
