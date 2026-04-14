import type { Metadata } from "next";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { BecomeVendorForm } from "@/components/become-vendor-form";
import { getAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Become a Vendor",
  description: "Apply to sell your tech products on SuperTech Marketplace.",
};

export const dynamic = "force-dynamic";

export default async function BecomeVendorPage() {
  const session = await getAuthSession();

  if (!session) {
    return (
      <div className="page-shell py-16">
        <div className="soft-card mx-auto max-w-lg p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(37,99,235,0.1)]">
            <LogIn className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
            Sign in to apply
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            You need a SuperTech account to apply as a vendor. Sign in or create a free account first — it only takes a minute.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-in?next=/become-vendor"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
            <Link
              href="/sign-up?next=/become-vendor"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BecomeVendorForm
      prefill={{ name: session.name, email: session.email }}
    />
  );
}
