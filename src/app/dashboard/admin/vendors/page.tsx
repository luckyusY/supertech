import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Package, Star, Store } from "lucide-react";
import { requirePageSession } from "@/lib/auth";
import { getPublicVendors } from "@/lib/public-marketplace";

export const metadata: Metadata = {
  title: "Manage Vendors — Admin",
};

export const dynamic = "force-dynamic";

export default async function ManageVendorsPage() {
  await requirePageSession({ roles: ["admin"], nextPath: "/dashboard/admin/vendors" });
  const vendors = await getPublicVendors();

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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">Manage Vendors</h1>
          </div>
          <span className="rounded-full bg-[rgba(8,145,178,0.1)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
            {vendors.length} sellers
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.03)]">
                {["Vendor", "Location", "Categories", "Products", "Rating", "Joined", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-[var(--muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, i) => (
                <tr
                  key={vendor.slug}
                  className={`border-b border-[var(--line)] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[rgba(15,23,42,0.015)]"}`}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold">{vendor.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{vendor.headline?.slice(0, 50)}{vendor.headline && vendor.headline.length > 50 ? "…" : ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-[var(--muted)]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {vendor.location}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {vendor.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className="rounded-full bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-[10px] font-medium">
                          {cat}
                        </span>
                      ))}
                      {vendor.categories.length > 2 && (
                        <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                          +{vendor.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-[var(--muted)]" />
                      {vendor.activeProducts}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{vendor.rating > 0 ? vendor.rating.toFixed(1) : "—"}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{vendor.joined}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/vendors/${vendor.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium hover:bg-[rgba(15,23,42,0.04)]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
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
