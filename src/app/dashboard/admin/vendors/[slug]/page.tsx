import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Package,
  Star,
  Store,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminVendorEditForm } from "@/components/admin-vendor-edit-form";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminToggleButton } from "@/components/admin-toggle-button";
import {
  deleteVendorAction,
  toggleVendorAction,
} from "@/app/dashboard/admin/vendors/actions";
import { requirePageSession } from "@/lib/auth";
import { getAdminVendorBySlug } from "@/lib/public-marketplace";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getAdminVendorBySlug(slug);
  return {
    title: vendor ? `${vendor.name} — Admin` : "Vendor not found",
  };
}

export default async function AdminVendorDetailPage({ params }: PageProps) {
  await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin/vendors",
  });
  const { slug } = await params;
  const vendor = await getAdminVendorBySlug(slug);
  if (!vendor) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/dashboard/admin/vendors"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
        All vendors
      </Link>

      <AdminPageHeader
        icon={Store}
        eyebrow={vendor.isSeed ? "Built-in vendor" : "Mongo vendor"}
        title={vendor.name}
        description={vendor.headline}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/vendors/${vendor.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Public store
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
        }
      />

      {/* Snapshot */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Snapshot
          label="Products"
          value={String(vendor.activeProducts)}
          icon={<Package className="h-4 w-4" />}
        />
        <Snapshot
          label="Rating"
          value={vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}
          icon={<Star className="h-4 w-4" />}
        />
        <Snapshot
          label="Location"
          value={vendor.location}
          icon={<MapPin className="h-4 w-4" />}
        />
        <Snapshot
          label="Status"
          value={vendor.disabled ? "Disabled" : "Active"}
          icon={<Store className="h-4 w-4" />}
        />
      </div>

      {vendor.coverImage ? (
        <div className="relative mt-6 h-40 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] sm:h-48">
          <Image
            src={vendor.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="896px"
          />
          <div
            className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow"
            style={{ backgroundColor: vendor.accent }}
          >
            {vendor.logoMark || vendor.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <AdminVendorEditForm vendor={vendor} />
      </div>
    </div>
  );
}

function Snapshot({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="soft-card p-4">
      <div className="flex items-center gap-2 text-[var(--muted)]">
        {icon}
        <span className="text-caption font-medium">{label}</span>
      </div>
      <p className="mt-2 truncate text-title font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}
