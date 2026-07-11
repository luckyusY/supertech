import type { Metadata } from "next";
import { Activity, MousePointerClick, Radio } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/ui";
import { requirePageSession } from "@/lib/auth";
import { getProductEventsSnapshot } from "@/lib/product-events";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product events — Admin",
  description: "Shopper UX signals: search, PDP CTAs, and conversion funnels.",
};

export const dynamic = "force-dynamic";

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

export default async function AdminEventsPage() {
  await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin/events",
  });

  const snapshot = await getProductEventsSnapshot(50);
  const maxCount = Math.max(...snapshot.byName.map((row) => row.count), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Activity}
        eyebrow="Insights"
        title="Product events"
        description="Lightweight UX signals from search, PDP actions, and shopper tools. Use this to validate design changes."
      />

      {!snapshot.configured ? (
        <div className="mt-6">
          <EmptyState
            icon={<Radio className="h-6 w-6" />}
            title="MongoDB not configured"
            description="Product events are accepted by the API, but storage requires MONGODB_URI. Events still push to dataLayer in the browser."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Events (all time)"
              value={String(snapshot.total)}
              icon={Activity}
            />
            <MetricCard
              label="Last 24 hours"
              value={String(snapshot.last24h)}
              icon={MousePointerClick}
            />
            <MetricCard
              label="Event types"
              value={String(snapshot.byName.length)}
              icon={Radio}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_1.2fr]">
            <section className="soft-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-[-0.03em]">By event</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Counts across stored product events.
              </p>
              {snapshot.byName.length === 0 ? (
                <p className="mt-6 text-sm text-[var(--muted)]">
                  No events stored yet. Browse the storefront and trigger search or PDP actions.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {snapshot.byName.map((row) => (
                    <li key={row.name}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-[var(--foreground)]">
                          {EVENT_LABELS[row.name] ?? row.name}
                        </span>
                        <span className="font-semibold tabular-nums">{row.count}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--neutral-100)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent)]"
                          style={{ width: `${Math.max(6, (row.count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="soft-card overflow-hidden">
              <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold tracking-[-0.03em]">Recent stream</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Latest {snapshot.recent.length} events (newest first).
                </p>
              </div>
              {snapshot.recent.length === 0 ? (
                <p className="px-5 py-8 text-sm text-[var(--muted)] sm:px-6">
                  Waiting for the first tracked interactions.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--line)] bg-[var(--neutral-50)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                        <th className="px-4 py-3 font-semibold">When</th>
                        <th className="px-4 py-3 font-semibold">Event</th>
                        <th className="px-4 py-3 font-semibold">Path</th>
                        <th className="px-4 py-3 font-semibold">Props</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.recent.map((event) => (
                        <tr
                          key={event.id}
                          className="border-b border-[var(--line)] last:border-0"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                            {formatDateTime(event.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {EVENT_LABELS[event.name] ?? event.name}
                          </td>
                          <td className="max-w-[10rem] truncate px-4 py-3 text-[var(--muted)]">
                            {event.path ?? "—"}
                          </td>
                          <td className="max-w-[14rem] truncate px-4 py-3 font-mono text-xs text-[var(--muted)]">
                            {summarizeProps(event.props)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="soft-card p-5">
      <div className="inline-flex rounded-[var(--radius-md)] bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function summarizeProps(props: Record<string, unknown>) {
  const entries = Object.entries(props).slice(0, 4);
  if (entries.length === 0) return "—";
  return entries
    .map(([key, value]) => `${key}=${String(value ?? "")}`)
    .join(" · ")
    .slice(0, 120);
}
