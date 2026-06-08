import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, PenLine } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getProductSubmissions } from "@/lib/product-submissions";
import { products as seedProducts } from "@/lib/marketplace";
import { getAdminProductHiddenSlugs } from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminToggleButton } from "@/components/admin-toggle-button";
import { deleteProductAction, toggleProductAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Products — Admin",
};

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending_review: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-600",
  seed: "bg-[rgba(8,145,178,0.1)] text-[var(--teal)]",
  disabled: "bg-amber-50 text-amber-600",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Approved",
  pending_review: "Pending",
  rejected: "Rejected",
  seed: "Built-in",
  disabled: "Disabled",
};

function WriteBlogLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/blog/write?product=${encodeURIComponent(slug)}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
    >
      <PenLine className="h-3 w-3" />
      Write blog
    </Link>
  );
}

export default async function ManageProductsPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/products" });

  const [submissions, hiddenSlugs] = await Promise.all([
    hasMongoConfig()
      ? getProductSubmissions({ limit: 100 }).catch(() => [])
      : Promise.resolve([]),
    getAdminProductHiddenSlugs(),
  ]);

  const activeSeeds = seedProducts.filter((p) => !hiddenSlugs.has(p.slug)).length;
  const disabledSeeds = seedProducts.length - activeSeeds;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={Package}
        eyebrow="Catalog"
        title="Manage Products"
        description="Browse every listing, disable built-in products, and write AI blog stories for any product."
        actions={
          <>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {activeSeeds + submissions.length} active
            </span>
            {disabledSeeds > 0 ? (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                {disabledSeeds} disabled
              </span>
            ) : null}
          </>
        }
      />

      {/* Vendor-submitted products */}
      {submissions.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Vendor submissions ({submissions.length})
          </p>
          <div className="mt-3 overflow-x-auto rounded-[1.25rem] border border-[var(--line)] bg-white">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
                  {["Product", "Vendor", "Category", "Price", "Status", "Date", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-[var(--muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr
                    key={sub.id}
                    className={`border-b border-[var(--line)] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[rgba(15,23,42,0.015)]"}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {sub.heroImage ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--line)]">
                            <Image src={sub.heroImage} alt={sub.name} fill className="object-cover" />
                          </div>
                        ) : null}
                        <div>
                          <p className="font-semibold">{sub.name}</p>
                          <p className="text-xs text-[var(--muted)]">{sub.submissionId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">{sub.vendorName}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-[10px] font-medium">
                        {sub.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(sub.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[sub.status]}`}>
                        {STATUS_LABELS[sub.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {sub.status === "approved" ? <WriteBlogLink slug={sub.slug} /> : null}
                        <AdminDeleteButton onDelete={deleteProductAction.bind(null, sub.id, false)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Built-in seed products */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Built-in products ({seedProducts.length})
        </p>
        <div className="mt-3 overflow-x-auto rounded-[1.25rem] border border-[var(--line)] bg-white">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
                {["Product", "Vendor", "Category", "Price", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-[var(--muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seedProducts.map((product, i) => {
                const isDisabled = hiddenSlugs.has(product.slug);
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-[var(--line)] last:border-0 ${
                      isDisabled
                        ? "opacity-50"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-[rgba(15,23,42,0.015)]"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.heroImage ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--line)]">
                            <Image src={product.heroImage} alt={product.name} fill className="object-cover" />
                          </div>
                        ) : null}
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-[var(--muted)]">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--muted)]">{product.vendorSlug}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-[10px] font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isDisabled ? STATUS_STYLES.disabled : STATUS_STYLES.seed}`}>
                        {isDisabled ? STATUS_LABELS.disabled : STATUS_LABELS.seed}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!isDisabled ? <WriteBlogLink slug={product.slug} /> : null}
                        <AdminToggleButton
                          disabled={isDisabled}
                          onToggle={toggleProductAction.bind(null, product.slug, isDisabled)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
