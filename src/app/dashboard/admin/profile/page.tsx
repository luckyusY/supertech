import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, ShieldCheck, Store, UserRound } from "lucide-react";
import { AccountProfileForm } from "@/components/account-profile-form";
import { AdminPageHeader } from "@/components/admin-page-header";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { findUserByEmail } from "@/lib/users";

export const metadata: Metadata = {
  title: "Profile - Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await requirePageSession({
    roles: ["admin"],
    nextPath: "/dashboard/admin/profile",
  });
  const userProfile = hasMongoConfig()
    ? await findUserByEmail(session.email).catch(() => null)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={UserRound}
        eyebrow="Settings"
        title="Admin profile"
        description="Manage the profile information attached to your admin session."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <AccountProfileForm
          initialName={userProfile?.name ?? session.name}
          initialPhone={userProfile?.phone ?? ""}
          canEdit={Boolean(userProfile)}
        />

        <section className="dark-card p-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
            Admin access
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Signed in as</p>
              <p className="mt-0.5 font-semibold text-white">{session.email}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Role</p>
              <p className="mt-0.5 font-semibold capitalize text-white">{session.role}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[rgba(255,255,255,0.55)]" />
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Permissions</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                Full marketplace dashboard access
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/admin/vendors"
          className="soft-card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Vendor profiles</p>
              <p className="text-sm text-[var(--muted)]">Manage seller accounts and storefronts</p>
            </div>
          </div>
          <span className="text-[var(--muted)]">→</span>
        </Link>
        <Link
          href="/dashboard/admin/recovery"
          className="soft-card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Account recovery</p>
              <p className="text-sm text-[var(--muted)]">Review recovery and access requests</p>
            </div>
          </div>
          <span className="text-[var(--muted)]">→</span>
        </Link>
      </div>
    </div>
  );
}
