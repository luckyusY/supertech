"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};

export function TablePagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(total, safePage * pageSize);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--neutral-50)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        className,
      )}
    >
      <p className="text-caption text-[var(--muted)]">
        Showing{" "}
        <span className="font-numeric font-semibold text-[var(--foreground)]">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-numeric font-semibold text-[var(--foreground)]">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-caption text-[var(--muted)]">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-2 text-sm font-medium text-[var(--foreground)]"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-[var(--foreground)] disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4.5rem] text-center text-caption font-medium text-[var(--foreground)]">
            <span className="font-numeric">{safePage}</span>
            <span className="text-[var(--muted)]"> / {totalPages}</span>
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-[var(--foreground)] disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function getPageSlice<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    total,
    totalPages,
    rows: items.slice(start, start + pageSize),
    rowOffset: start,
  };
}
