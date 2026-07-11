"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  MapPin,
  Package,
  Search,
  Settings2,
  Star,
} from "lucide-react";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminToggleButton } from "@/components/admin-toggle-button";
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
import {
  deleteVendorAction,
  toggleVendorAction,
} from "@/app/dashboard/admin/vendors/actions";
import type { AdminVendorRecord } from "@/lib/public-marketplace";

export function AdminVendorsTable({ vendors }: { vendors: AdminVendorRecord[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) =>
      [v.name, v.slug, v.location, v.headline, ...(v.categories ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [vendors, query]);

  const slice = getPageSlice(filtered, page, pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search vendors…"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        <p className="text-caption text-[var(--muted)]">
          <span className="font-numeric font-semibold text-[var(--foreground)]">
            {filtered.length}
          </span>{" "}
          vendors
        </p>
      </div>

      <DataTable minWidth="52rem">
        <DataTableHead>
          <DataTableTh className="w-12">#</DataTableTh>
          <DataTableTh>Vendor</DataTableTh>
          <DataTableTh>Location</DataTableTh>
          <DataTableTh>Categories</DataTableTh>
          <DataTableTh numeric>Products</DataTableTh>
          <DataTableTh numeric>Rating</DataTableTh>
          <DataTableTh>Joined</DataTableTh>
          <DataTableTh>Actions</DataTableTh>
        </DataTableHead>
        <DataTableBody>
          {slice.rows.length === 0 ? (
            <DataTableRow>
              <DataTableTd className="py-10 text-center text-[var(--muted)]" colSpan={8}>
                No vendors match your search.
              </DataTableTd>
            </DataTableRow>
          ) : (
            slice.rows.map((vendor, i) => (
              <DataTableRow key={vendor.slug} muted={vendor.disabled}>
                <DataTableTd>
                  <RowNumber index={i} offset={slice.rowOffset} />
                </DataTableTd>
                <DataTableTd>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/admin/vendors/${vendor.slug}`}
                        className="font-semibold hover:text-[var(--accent)]"
                      >
                        {vendor.name}
                      </Link>
                      {vendor.isSeed ? (
                        <span className="rounded-full bg-[var(--info-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--info)]">
                          Built-in
                        </span>
                      ) : null}
                      {vendor.disabled ? (
                        <span className="rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--warning)]">
                          Disabled
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-caption text-[var(--muted)]">
                      {vendor.headline}
                    </p>
                  </div>
                </DataTableTd>
                <DataTableTd>
                  <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {vendor.location}
                  </span>
                </DataTableTd>
                <DataTableTd>
                  <div className="flex flex-wrap gap-1">
                    {vendor.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[10px] font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                    {vendor.categories.length > 2 ? (
                      <span className="text-[10px] text-[var(--muted)]">
                        +{vendor.categories.length - 2}
                      </span>
                    ) : null}
                  </div>
                </DataTableTd>
                <DataTableTd numeric>
                  <span className="inline-flex items-center justify-end gap-1">
                    <Package className="h-3.5 w-3.5 text-[var(--muted)]" />
                    {vendor.activeProducts}
                  </span>
                </DataTableTd>
                <DataTableTd numeric>
                  <span className="inline-flex items-center justify-end gap-1">
                    <Star className="h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
                    {vendor.rating > 0 ? vendor.rating.toFixed(1) : "—"}
                  </span>
                </DataTableTd>
                <DataTableTd className="text-[var(--muted)]">{vendor.joined}</DataTableTd>
                <DataTableTd>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/dashboard/admin/vendors/${vendor.slug}`}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-xs font-bold text-[var(--accent)]"
                    >
                      <Settings2 className="h-3 w-3" />
                      Manage
                    </Link>
                    <Link
                      href={`/vendors/${vendor.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1.5 text-xs font-medium"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
                    {vendor.isSeed ? (
                      <AdminToggleButton
                        disabled={vendor.disabled}
                        onToggle={toggleVendorAction.bind(null, vendor.slug, vendor.disabled)}
                      />
                    ) : (
                      <AdminDeleteButton
                        onDelete={deleteVendorAction.bind(null, vendor.slug, false)}
                      />
                    )}
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
