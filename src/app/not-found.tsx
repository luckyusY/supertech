import Link from "next/link";
import { EmptySearchIllustration } from "@/components/app-graphics";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <div className="page-shell py-12">
      <div className="soft-card relative overflow-hidden bg-white px-6 py-12 text-center sm:px-8">
        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />

        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" sublabel="Marketplace" />
        </div>
        <EmptySearchIllustration className="mx-auto mb-6 h-28 w-28" />

        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Route not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
          The page you tried to open is not in this marketplace yet.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Head back to the storefront or the vendor directory while we keep
          expanding the platform.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Go home
          </Link>
          <Link
            href="/vendors"
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            Browse vendors
          </Link>
        </div>
      </div>
    </div>
  );
}
