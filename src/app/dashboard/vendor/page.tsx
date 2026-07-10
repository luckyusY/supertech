import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Package,
  Sparkles,
  Star,
  ShoppingBag,
  Store,
  UserRound,
  Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { getIntegrationStatus } from "@/lib/integrations";
import { getPublicVendorProducts } from "@/lib/public-marketplace";
import { loadVendorContext } from "@/lib/vendor-dashboard";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your products, orders, and payouts.",
};

export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  const { session, currentVendor } = await loadVendorContext("/dashboard/vendor");
  const integrationStatus = getIntegrationStatus();
  const highlightIcons = [ShoppingBag, Package, Star];
  const vendorProducts = await getPublicVendorProducts(currentVendor.slug).catch(() => []);
  const highlights = [
    { label: "Active products", value: String(vendorProducts.length) },
    { label: "Store categories", value: String(currentVendor.categories.length) },
    { label: "Rating", value: currentVendor.rating > 0 ? currentVendor.rating.toFixed(1) : "New" },
  ];

  const shortcuts = [
    {
      href: "/dashboard/vendor/products",
      label: "Add & manage products",
      desc: "Submit listings and edit your catalog",
      icon: Package,
    },
    {
      href: "/dashboard/vendor/ai",
      label: "Write an SEO blog",
      desc: "Generate a Google-ready article for a product",
      icon: Sparkles,
    },
    {
      href: "/dashboard/vendor/orders",
      label: "Fulfill orders",
      desc: "Work your incoming order queue",
      icon: ShoppingBag,
    },
    {
      href: "/dashboard/vendor/payments",
      label: "Payment method",
      desc: "Confirm your MoMoPay merchant details",
      icon: CreditCard,
    },
  ];

  const allPages = [
    { href: "/dashboard/vendor/products", label: "Products", icon: Package, color: "text-indigo-500", bg: "bg-indigo-50" },
    { href: "/dashboard/vendor/orders", label: "Orders", icon: ShoppingBag, color: "text-[var(--accent)]", bg: "bg-[rgba(37,99,235,0.08)]" },
    { href: "/dashboard/vendor/ai", label: "AI Studio", icon: Sparkles, color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { href: "/dashboard/vendor/blogs", label: "Blogs", icon: FileText, color: "text-rose-500", bg: "bg-rose-50" },
    { href: "/dashboard/vendor/storefront", label: "Storefront", icon: Store, color: "text-[var(--teal)]", bg: "bg-[rgba(8,145,178,0.08)]" },
    { href: "/dashboard/vendor/payments", label: "Payments", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
    { href: "/dashboard/vendor/payouts", label: "Payouts", icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
    { href: "/dashboard/vendor/profile", label: "Profile", icon: UserRound, color: "text-slate-500", bg: "bg-slate-100" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminPageHeader
        icon={LayoutDashboard}
        eyebrow="Seller workspace"
        title={currentVendor.name}
        description={
          session.role === "admin"
            ? "You have admin access to all vendor workspaces."
            : "Manage your products, fulfill orders, and grow with AI-written SEO blogs."
        }
      />

      {/* Highlights */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {highlights.map((item, i) => {
          const Icon = highlightIcons[i] ?? Package;
          return (
            <div key={item.label} className="soft-card p-5">
              <Icon className="h-5 w-5 text-[var(--accent)]" />
              <p className="mt-4 text-sm text-[var(--muted)]">{item.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* All Pages — visible on mobile so every section is one tap away */}
      <div className="mt-6 xl:hidden">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">All sections</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="soft-card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
            >
              <span className={`inline-flex rounded-[0.75rem] p-2 ${page.bg}`}>
                <page.icon className={`h-5 w-5 ${page.color}`} />
              </span>
              <span className="text-sm font-semibold">{page.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Shortcuts */}
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="soft-card group flex items-start gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <span className="inline-flex rounded-[0.75rem] bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold">
                  {item.label}
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-[var(--muted)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Account panel */}
        <div className="dark-card p-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
            Account
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Signed in as</p>
              <p className="mt-0.5 font-semibold text-white">{session.name}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Store</p>
              <p className="mt-0.5 font-semibold text-white">{currentVendor.name}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Location</p>
              <p className="mt-0.5 font-semibold text-white">{currentVendor.location}</p>
            </div>
            <div className="rounded-[1.1rem] border border-white/8 bg-white/6 px-4 py-3">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-[rgba(255,255,255,0.55)]" />
                <p className="text-xs text-[rgba(255,255,255,0.5)]">Image uploads</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-white">
                {integrationStatus.cloudinaryServer.configured ? "Ready" : "Not configured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller checklist */}
      <div className="mt-6 soft-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-xl font-semibold tracking-[-0.04em]">Seller checklist</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Products reviewed and brand-checked",
            "Product images uploaded via gallery",
            "Orders routed with fulfillment expectations set",
            "Payout method confirmed with marketplace",
          ].map((item, i) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[1.2rem] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(8,145,178,0.12)] text-xs font-bold text-[var(--teal)]">
                {i + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
