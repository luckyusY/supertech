import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access Restricted",
  description: "This role does not have permission to open that area.",
};

export default function ForbiddenPage() {
  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Restricted area
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          This account does not have permission for that workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Sign in with a different role or head back to the storefront. Admin and
          vendor areas are now protected separately.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
