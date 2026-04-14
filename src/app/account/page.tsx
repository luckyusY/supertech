import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  LogOut,
  MapPin,
  Package,
  PackageSearch,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getProductRequestsByCustomerEmail } from "@/lib/product-requests";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your orders and product requests.",
};

export const dynamic = "force-dynamic";

const statusStyles: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-600" },
  sourcing: { label: "Sourcing", className: "bg-amber-50 text-amber-600" },
  found: { label: "Found", className: "bg-[rgba(8,145,178,0.1)] text-[var(--teal)]" },
  unavailable: { label: "Unavailable", className: "bg-[rgba(15,23,42,0.06)] text-[var(--muted)]" },
};

export default async function AccountPage() {
  const session = await requirePageSession({
    nextPath: "/account",
  });

  const requests = hasMongoConfig()
    ? await getProductRequestsByCustomerEmail(session.email).catch(() => [])
    : [];

  const isVendorOrAdmin = session.role === "admin" || session.role === "vendor";

  return (
    <div className="page-shell py-8">
      {/* Profile header */}
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              My account
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {session.name}
            </h1>
            <p className="mt-3 text-base text-[var(--muted)]">{session.email}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-4 py-2 text-sm font-semibold capitalize">
                <User className="h-4 w-4 text-[var(--accent)]" />
                {session.role}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-4 py-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-[var(--teal)]" />
                Verified account
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <PackageSearch className="h-4 w-4" />
                Track an order
              </Link>
              <Link
                href="/request"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-5 py-2.5 text-sm font-semibold"
              >
                <Package className="h-4 w-4" />
                Request a product
              </Link>
              {isVendorOrAdmin ? (
                <Link
                  href={session.role === "admin" ? "/dashboard/admin" : "/dashboard/vendor"}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-5 py-2.5 text-sm font-semibold"
                >
                  Go to dashboard →
                </Link>
              ) : (
                <Link
                  href="/become-vendor"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-5 py-2.5 text-sm font-semibold"
                >
                  <Store className="h-4 w-4" />
                  Become a vendor
                </Link>
              )}
            </div>
          </div>

          {/* Account info */}
          <div className="dark-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
              Summary
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Product requests</p>
                <p className="mt-0.5 text-2xl font-semibold text-white">{requests.length}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Buyer protection</p>
                <p className="mt-0.5 font-semibold text-[var(--teal)]">Active on all orders</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Support</p>
                <p className="mt-0.5 text-sm font-semibold text-white">Live chat available</p>
              </div>
            </div>
            <form action="/api/auth/sign-out" method="POST" className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3 text-sm font-semibold text-[rgba(255,255,255,0.76)] transition-colors hover:bg-white/12"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Product requests */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">Product requests</h2>
        </div>

        {requests.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-[1.5rem] border border-dashed border-[var(--line)] py-12 text-center">
            <Package className="h-10 w-10 text-[var(--muted)]" />
            <div>
              <p className="font-semibold">No requests yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Can&apos;t find what you&apos;re looking for? Request it and we&apos;ll source it for you.
              </p>
            </div>
            <Link
              href="/request"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Request a product
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((req) => {
              const status = statusStyles[req.status] ?? statusStyles.open;
              return (
                <div
                  key={String(req._id)}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold tracking-[-0.02em]">{req.productName}</p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">{req.category}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{req.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                    {req.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {req.city}
                      </span>
                    )}
                    {req.budget && (
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        Budget: {req.budget}
                      </span>
                    )}
                    <span>
                      {new Date(req.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/products"
          className="soft-card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[rgba(37,99,235,0.1)]">
              <Package className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="font-semibold">Browse products</p>
              <p className="text-sm text-[var(--muted)]">Shop from verified sellers</p>
            </div>
          </div>
          <span className="text-[var(--muted)]">→</span>
        </Link>

        <Link
          href="/track-order"
          className="soft-card flex items-center justify-between gap-4 p-5 transition-shadow hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[rgba(8,145,178,0.1)]">
              <PackageSearch className="h-5 w-5 text-[var(--teal)]" />
            </div>
            <div>
              <p className="font-semibold">Track your order</p>
              <p className="text-sm text-[var(--muted)]">Check delivery status</p>
            </div>
          </div>
          <span className="text-[var(--muted)]">→</span>
        </Link>
      </div>
    </div>
  );
}
