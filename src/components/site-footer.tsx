import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="page-shell py-10">
      <div className="soft-card flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Shipping on Vercel
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Built for a Vercel-hosted ecommerce MVP with MongoDB for structured
            marketplace data and Cloudinary for media delivery.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <Link href="/vendors">Vendor directory</Link>
          <span className="text-[var(--line)]">/</span>
          <Link href="/dashboard/vendor">Seller shell</Link>
          <span className="text-[var(--line)]">/</span>
          <Link href="/dashboard/admin">Admin shell</Link>
        </div>
      </div>
    </footer>
  );
}
