"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeOff, Package, Search, Store } from "lucide-react";
import { AdminEditCategoryButton } from "@/components/admin-edit-category-button";
import { AdminVisibilityButton } from "@/components/admin-visibility-button";
import { toggleCategoryVisibilityAction } from "@/app/dashboard/admin/categories/actions";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
  RowNumber,
} from "@/components/ui/data-table";
import { getPageSlice, TablePagination } from "@/components/ui/table-pagination";

export type AdminCategoryRow = {
  name: string;
  productCount: number;
  vendorCount: number;
  hidden: boolean;
};

export function AdminCategoriesTable({ categories }: { categories: AdminCategoryRow[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const slice = getPageSlice(filtered, page, pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search categories…"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        <p className="text-caption text-[var(--muted)]">
          <span className="font-numeric font-semibold text-[var(--foreground)]">
            {filtered.length}
          </span>{" "}
          categories
        </p>
      </div>

      <DataTable minWidth="40rem">
        <DataTableHead>
          <DataTableTh className="w-12">#</DataTableTh>
          <DataTableTh>Category</DataTableTh>
          <DataTableTh numeric>Products</DataTableTh>
          <DataTableTh numeric>Vendors</DataTableTh>
          <DataTableTh>Status</DataTableTh>
          <DataTableTh>Actions</DataTableTh>
        </DataTableHead>
        <DataTableBody>
          {slice.rows.length === 0 ? (
            <DataTableRow>
              <DataTableTd colSpan={6} className="py-10 text-center text-[var(--muted)]">
                No categories match.
              </DataTableTd>
            </DataTableRow>
          ) : (
            slice.rows.map((category, i) => (
              <DataTableRow key={category.name} muted={category.hidden}>
                <DataTableTd>
                  <RowNumber index={i} offset={slice.rowOffset} />
                </DataTableTd>
                <DataTableTd className="font-semibold">{category.name}</DataTableTd>
                <DataTableTd numeric>
                  <span className="inline-flex items-center justify-end gap-1.5">
                    <Package className="h-3.5 w-3.5 text-[var(--muted)]" />
                    {category.productCount}
                  </span>
                </DataTableTd>
                <DataTableTd numeric>
                  <span className="inline-flex items-center justify-end gap-1.5">
                    <Store className="h-3.5 w-3.5 text-[var(--muted)]" />
                    {category.vendorCount}
                  </span>
                </DataTableTd>
                <DataTableTd>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      category.hidden
                        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                        : "bg-[var(--success-soft)] text-[var(--success)]"
                    }`}
                  >
                    {category.hidden ? <EyeOff className="h-3 w-3" /> : null}
                    {category.hidden ? "Hidden" : "Visible"}
                  </span>
                </DataTableTd>
                <DataTableTd>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <AdminEditCategoryButton name={category.name} />
                    <Link
                      href={`/catalog?category=${encodeURIComponent(category.name)}`}
                      target="_blank"
                      className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--neutral-50)]"
                    >
                      View
                    </Link>
                    <AdminVisibilityButton
                      visible={!category.hidden}
                      onToggle={toggleCategoryVisibilityAction.bind(
                        null,
                        category.name,
                        category.hidden,
                      )}
                    />
                  </div>
                </DataTableTd>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <TablePagination
        page={slice.page}
        pageSize={pageSize}
        total={slice.total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
