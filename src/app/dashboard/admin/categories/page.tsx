import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, EyeOff, LayoutGrid, Package, Store } from "lucide-react";
import { AdminAddCategoryForm } from "@/components/admin-add-category-form";
import { AdminEditCategoryButton } from "@/components/admin-edit-category-button";
import { AdminVisibilityButton } from "@/components/admin-visibility-button";
import { requirePageSession } from "@/lib/auth";
import { getPublicCategorySummaries } from "@/lib/public-marketplace";
import { toggleCategoryVisibilityAction } from "./actions";

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
    <div className="page-shell py-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin dashboard
        </Link>
      </div>

      <div className="mt-4 soft-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-[var(--accent)]" />
              <h1 className="text-3xl font-semibold tracking-[-0.04em]">Manage Categories</h1>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Hide or show storefront categories across the header, mobile menu, homepage shelves,
              and catalog filters. Products stay in the global catalog unless you remove them
              separately.
            </p>
            <div className="mt-4">
              <AdminAddCategoryForm />
            </div>
          </div>

          <div className="grid gap-2 sm:min-w-[220px]">
            <div className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Visible
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{visibleCount}</p>
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Hidden
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{hiddenCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.25rem] border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
                {["Category", "Products", "Vendors", "Status", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left font-semibold text-[var(--muted)]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category.name}
                  className={`border-b border-[var(--line)] last:border-0 ${
                    index % 2 === 0 ? "bg-white" : "bg-[rgba(15,23,42,0.015)]"
                  }`}
                >
                  <td className="px-5 py-4 font-semibold">{category.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]">
                      <Package className="h-3.5 w-3.5 text-[var(--muted)]" />
                      {category.productCount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]">
                      <Store className="h-3.5 w-3.5 text-[var(--muted)]" />
                      {category.vendorCount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        category.hidden
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {category.hidden ? <EyeOff className="h-3 w-3" /> : null}
                      {category.hidden ? "Hidden from navigation" : "Visible"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <AdminEditCategoryButton name={category.name} />
                      <Link
                        href={`/catalog?category=${encodeURIComponent(category.name)}`}
                        target="_blank"
                        className="inline-flex items-center rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[rgba(15,23,42,0.04)]"
                      >
                        View
                      </Link>
                      <AdminVisibilityButton
                        visible={!category.hidden}
                        onToggle={toggleCategoryVisibilityAction.bind(null, category.name, category.hidden)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
