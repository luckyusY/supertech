"use client";

import { useMemo, useState } from "react";
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
import { formatDateTime } from "@/lib/utils";
import type { ProductEventRecord } from "@/lib/product-events";

const EVENT_LABELS: Record<string, string> = {
  search_submit: "Search submitted",
  search_suggest_click: "Search suggestion click",
  pdp_primary_cta: "PDP primary CTA",
  pdp_add_to_cart: "Add to cart",
  pdp_whatsapp: "WhatsApp from PDP",
  catalog_empty_request: "Empty catalog → request",
  request_product_start: "Request product start",
  track_order_view: "Track order view",
  become_vendor_click: "Become vendor click",
};

function summarizeProps(props: Record<string, unknown>) {
  const entries = Object.entries(props).slice(0, 4);
  if (entries.length === 0) return "—";
  return entries
    .map(([key, value]) => `${key}=${String(value ?? "")}`)
    .join(" · ")
    .slice(0, 120);
}

export function AdminEventsStream({ events }: { events: ProductEventRecord[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const slice = useMemo(() => getPageSlice(events, page, pageSize), [events, page, pageSize]);

  if (events.length === 0) {
    return (
      <p className="px-5 py-8 text-sm text-[var(--muted)] sm:px-6">
        Waiting for the first tracked interactions.
      </p>
    );
  }

  return (
    <div>
      <DataTable minWidth="36rem" className="rounded-none border-0 shadow-none">
        <DataTableHead>
          <DataTableTh className="w-12">#</DataTableTh>
          <DataTableTh>When</DataTableTh>
          <DataTableTh>Event</DataTableTh>
          <DataTableTh>Path</DataTableTh>
          <DataTableTh>Props</DataTableTh>
        </DataTableHead>
        <DataTableBody>
          {slice.rows.map((event, i) => (
            <DataTableRow key={event.id}>
              <DataTableTd>
                <RowNumber index={i} offset={slice.rowOffset} />
              </DataTableTd>
              <DataTableTd className="whitespace-nowrap text-[var(--muted)]">
                {formatDateTime(event.createdAt)}
              </DataTableTd>
              <DataTableTd className="font-medium">
                {EVENT_LABELS[event.name] ?? event.name}
              </DataTableTd>
              <DataTableTd className="max-w-[10rem] truncate text-[var(--muted)]">
                {event.path ?? "—"}
              </DataTableTd>
              <DataTableTd className="max-w-[14rem] truncate font-mono text-xs text-[var(--muted)]">
                {summarizeProps(event.props)}
              </DataTableTd>
            </DataTableRow>
          ))}
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
