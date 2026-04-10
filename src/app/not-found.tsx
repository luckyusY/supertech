import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell py-12">
      <div className="soft-card px-6 py-12 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Route not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
          The page you tried to open is not in this marketplace yet.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Head back to the storefront or the vendor directory while we keep
          expanding the platform.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
          >
            Go home
          </Link>
          <Link
            href="/vendors"
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
          >
            Browse vendors
          </Link>
        </div>
      </div>
    </div>
  );
}
