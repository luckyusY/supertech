import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Palette, UserRound } from "lucide-react";
import { AccountProfileForm } from "@/components/account-profile-form";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BusinessInfoForm } from "@/components/business-info-form";
import { hasMongoConfig } from "@/lib/integrations";
import { getVendorBySlug } from "@/lib/marketplace";
import { findUserByEmail } from "@/lib/users";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Profile - Vendor",
};

export const dynamic = "force-dynamic";

export default async function VendorProfilePage() {
  const { session, currentVendor } = await loadVendorContext("/dashboard/vendor/profile");
  const userProfile = hasMongoConfig()
    ? await findUserByEmail(session.email).catch(() => null)
    : null;
  const canEditBusiness = !getVendorBySlug(currentVendor.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={UserRound}
        eyebrow="Settings"
        title="Profile"
        description="Manage your seller identity, public business details, and the account information used across SuperTech."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AccountProfileForm
          initialName={userProfile?.name ?? session.name}
          initialPhone={userProfile?.phone ?? ""}
          canEdit={Boolean(userProfile)}
        />
        <BusinessInfoForm
          vendorSlug={currentVendor.slug}
          initialName={currentVendor.name}
          initialLocation={currentVendor.location}
          initialWhatsappNumber={currentVendor.whatsappNumber ?? ""}
          initialCategories={currentVendor.categories}
          canEdit={canEditBusiness}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/vendor/storefront"
          className="soft-card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Palette className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Storefront branding</p>
              <p className="text-sm text-[var(--muted)]">Edit cover, logo, and headline</p>
            </div>
          </div>
          <span className="text-[var(--muted)]">→</span>
        </Link>
        <Link
          href="/dashboard/vendor/payments"
          className="soft-card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Payment method</p>
              <p className="text-sm text-[var(--muted)]">Update MoMoPay merchant details</p>
            </div>
          </div>
          <span className="text-[var(--muted)]">→</span>
        </Link>
      </div>
    </div>
  );
}
