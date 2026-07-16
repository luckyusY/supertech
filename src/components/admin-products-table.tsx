"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { PenLine, Search } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminToggleButton } from "@/components/admin-toggle-button";
import {
  approveProductAction,
  deleteProductAction,
  rejectProductAction,
  toggleProductAction,
} from "@/app/dashboard/admin/products/actions";
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
import { formatPrice } from "@/lib/utils";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  vendorLabel: string;
  category: string;
  price: number;
  heroImage?: string;
  status: "approved" | "pending_review" | "rejected" | "seed" | "disabled";
  statusLabel: string;
  dateLabel?: string;
  kind: "submission" | "seed";
  disabled?: boolean;
  submissionId?: string;
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-[var(--success-soft)] text-[var(--success)]",
  pending_review: "bg-[var(--warning-soft)] text-[var(--warning)]",
  rejected: "bg-[var(--danger-soft)] text-[var(--danger)]",
  seed: "bg-[var(--info-soft)] text-[var(--info)]",
  disabled: "bg-[var(--warning-soft)] text-[var(--warning)]",
};

function WriteBlogLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/blog/write?product=${encodeURIComponent(slug)}`}
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
    >
      <PenLine className="h-3 w-3" />
      Blog
    </Link>
  );
}

export function AdminProductsTable({
  title,
  rows,
}: {
  title: string;
  rows: AdminProductRow[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.slug, row.vendorLabel, row.category, row.statusLabel]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const slice = getPageSlice(filtered, page, pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-overline text-[var(--muted)]">{title}</p>
          <p className="mt-1 text-caption text-[var(--muted)]">
            <span className="font-numeric font-semibold text-[var(--foreground)]">
              {filtered.length}
            </span>{" "}
            items
          </p>
        </div>
        <label className="relative block min-w-0 sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <DataTable minWidth="48rem">
        <DataTableHead>
          <DataTableTh className="w-12">#</DataTableTh>
          <DataTableTh>Product</DataTableTh>
          <DataTableTh>Vendor</DataTableTh>
          <DataTableTh>Category</DataTableTh>
          <DataTableTh numeric>Price</DataTableTh>
          <DataTableTh>Status</DataTableTh>
          {rows.some((r) => r.dateLabel) ? <DataTableTh>Date</DataTableTh> : null}
          <DataTableTh>Actions</DataTableTh>
        </DataTableHead>
        <DataTableBody>
          {slice.rows.length === 0 ? (
            <DataTableRow>
              <DataTableTd colSpan={8} className="py-10 text-center text-[var(--muted)]">
                No products match this filter.
              </DataTableTd>
            </DataTableRow>
          ) : (
            slice.rows.map((row, i) => (
              <DataTableRow key={row.id} muted={row.disabled || row.status === "disabled"}>
                <DataTableTd>
                  <RowNumber index={i} offset={slice.rowOffset} />
                </DataTableTd>
                <DataTableTd>
                  <div className="flex items-center gap-3">
                    {row.heroImage ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--line)]">
                        <Image src={row.heroImage} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-semibold">{row.name}</p>
                      <p className="truncate text-caption text-[var(--muted)]">
                        {row.submissionId ?? row.slug}
                      </p>
                    </div>
                  </div>
                </DataTableTd>
                <DataTableTd className="text-[var(--muted)]">{row.vendorLabel}</DataTableTd>
                <DataTableTd>
                  <span className="rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[10px] font-medium">
                    {row.category}
                  </span>
                </DataTableTd>
                <DataTableTd numeric className="font-semibold">
                  {formatPrice(row.price)}
                </DataTableTd>
                <DataTableTd>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[row.status] ?? STATUS_STYLES.seed}`}
                  >
                    {row.statusLabel}
                  </span>
                </DataTableTd>
                {rows.some((r) => r.dateLabel) ? (
                  <DataTableTd className="text-[var(--muted)]">{row.dateLabel ?? "—"}</DataTableTd>
                ) : null}
                <DataTableTd>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {row.kind === "submission" ? (
                      <>
                        {row.status === "approved" || row.status === "disabled" ? (
                          <>
                            {!row.disabled ? <WriteBlogLink slug={row.slug} /> : null}
                            <AdminToggleButton
                              disabled={Boolean(row.disabled)}
                              onToggle={toggleProductAction.bind(
                                null,
                                row.slug,
                                Boolean(row.disabled),
                              )}
                            />
                            <button
                              disabled={isPending}
                              onClick={() => {
                                if (confirm("Send this back to the vendor for updates?")) {
                                  startTransition(async () => { await rejectProductAction(row.submissionId!); });
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--warning-soft)] bg-[var(--warning-soft)]/20 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-[var(--warning-soft)] transition-colors disabled:opacity-50"
                            >
                              Request Update
                            </button>
                          </>
                        ) : null}
                        {row.status === "pending_review" ? (
                          <>
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(async () => { await approveProductAction(row.submissionId!); })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={isPending}
                              onClick={() => startTransition(async () => { await rejectProductAction(row.submissionId!); })}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50"
                            >
                              Request Update
                            </button>
                          </>
                        ) : null}
                        <AdminDeleteButton
                          onDelete={deleteProductAction.bind(null, row.id, false)}
                        />
                      </>
                    ) : (
                      <>
                        {!row.disabled ? <WriteBlogLink slug={row.slug} /> : null}
                        <AdminToggleButton
                          disabled={Boolean(row.disabled)}
                          onToggle={toggleProductAction.bind(
                            null,
                            row.slug,
                            Boolean(row.disabled),
                          )}
                        />
                      </>
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
