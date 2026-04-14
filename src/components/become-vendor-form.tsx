"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe,
  MapPin,
  Package,
  Phone,
  Send,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
  User,
} from "lucide-react";

const CATEGORIES = [
  "Home Control",
  "Mobile Essentials",
  "Creator Gear",
  "Gaming",
  "Audio",
  "Wearables",
  "Accessories",
  "Other",
];

type Props = {
  prefill?: {
    name?: string;
    email?: string;
  };
};

export function BecomeVendorForm({ prefill }: Props) {
  const [form, setForm] = useState({
    name: prefill?.name ?? "",
    email: prefill?.email ?? "",
    phone: "",
    businessName: "",
    category: "",
    location: "",
    description: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vendor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Something went wrong.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="page-shell py-16">
        <div className="soft-card mx-auto max-w-xl p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(8,145,178,0.12)]">
            <CheckCircle2 className="h-8 w-8 text-[var(--teal)]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
            Application submitted!
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            We&apos;ll review your application and get back to you within 1–3 business days.
            Once approved, you&apos;ll be able to log in and start listing products right away.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
            >
              Browse the marketplace
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSignedIn = Boolean(prefill?.email);

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left — brand panel */}
        <div className="dark-card flex flex-col gap-6 p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">
              Sell on SuperTech
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              Reach customers across East &amp; West Africa.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[rgba(255,255,255,0.7)]">
              Join verified sellers already using SuperTech to grow their tech business. Apply below and our team will review your listing within 1–3 days.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Store, text: "Your own branded storefront" },
              { icon: Package, text: "Easy product listing and gallery uploads" },
              { icon: TrendingUp, text: "Order management dashboard" },
              { icon: ShieldCheck, text: "Verified seller badge on all products" },
              { icon: Star, text: "Customer reviews build your reputation" },
              { icon: BadgeCheck, text: "Fast approval — usually within 24 hours" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-[1rem] border border-white/8 bg-white/6 px-4 py-3 text-sm text-[rgba(255,255,255,0.76)]"
              >
                <item.icon className="h-4 w-4 shrink-0 text-[rgba(255,255,255,0.5)]" />
                {item.text}
              </div>
            ))}
          </div>

          <p className="mt-auto text-xs text-[rgba(255,255,255,0.4)]">
            8% platform commission · payments on delivery · full payout tracking
          </p>
        </div>

        {/* Right — form */}
        <div className="soft-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Vendor application
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Tell us about your business
          </h2>

          {isSignedIn && (
            <div className="mt-4 flex items-center gap-3 rounded-[1rem] border border-[rgba(8,145,178,0.25)] bg-[rgba(8,145,178,0.06)] px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--teal)]" />
              <p className="text-sm text-[var(--teal)]">
                Signed in as <strong>{prefill?.email}</strong> — your contact details are pre-filled.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Personal info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Your name</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    placeholder="Full name"
                    className="w-full rounded-[0.9rem] border border-[var(--line)] bg-white/70 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Email address</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  readOnly={isSignedIn}
                  placeholder="you@example.com"
                  className={`w-full rounded-[0.9rem] border border-[var(--line)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 ${
                    isSignedIn
                      ? "cursor-not-allowed bg-[rgba(15,23,42,0.04)] text-[var(--muted)]"
                      : "bg-white/70"
                  }`}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Phone (optional)</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+234 or +250 ..."
                    className="w-full rounded-[0.9rem] border border-[var(--line)] bg-white/70 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Website (optional)</span>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full rounded-[0.9rem] border border-[var(--line)] bg-white/70 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                </div>
              </label>
            </div>

            {/* Business info */}
            <div className="border-t border-[var(--line)] pt-5">
              <p className="mb-4 text-sm font-semibold text-[var(--muted)]">Business details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Business name</span>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      value={form.businessName}
                      onChange={(e) => update("businessName", e.target.value)}
                      required
                      placeholder="Acme Tech Ltd."
                      className="w-full rounded-[0.9rem] border border-[var(--line)] bg-white/70 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Product category</span>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    required
                    className="w-full rounded-[0.9rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                <MapPin className="mr-1.5 inline h-4 w-4 text-[var(--muted)]" />
                City / Country
              </span>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                required
                placeholder="Lagos, Nigeria"
                className="w-full rounded-[0.9rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                What do you sell? Tell us about your products.
              </span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                rows={4}
                placeholder="We specialize in smart home devices and accessories..."
                className="w-full resize-none rounded-[0.9rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </label>

            {error && (
              <p className="rounded-[0.9rem] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit application
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>

            {!isSignedIn && (
              <p className="text-center text-xs text-[var(--muted)]">
                Already a vendor?{" "}
                <Link href="/sign-in" className="font-semibold text-[var(--foreground)] underline underline-offset-2">
                  Sign in here
                </Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
