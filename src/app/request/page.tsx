"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Search, Zap } from "lucide-react";

const categories = [
  "Home Control",
  "Mobile Essentials",
  "Creator Gear",
  "Gaming",
  "Audio",
  "Wearables",
  "Other",
];

export default function RequestPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    productName: "",
    category: "",
    description: "",
    budget: "",
    city: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/product-requests/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to send request.");
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send request.");
      }
    });
  }

  if (success) {
    return (
      <div className="page-shell py-16">
        <div className="mx-auto max-w-xl text-center soft-card p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[var(--teal)]/10">
            <MessageSquare className="h-7 w-7 text-[var(--teal)]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">Request received!</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            Our sourcing team will check availability and get back to you within 24–48 hours.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
            >
              Browse catalog
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              New request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Info panel */}
        <aside className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            Product sourcing
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Can&apos;t find it? We&apos;ll source it.
          </h1>
          <p className="mt-4 text-base leading-7 text-[rgba(255,255,255,0.72)]">
            Our sourcing team works with a wide network of suppliers. Tell us what you need and
            we&apos;ll find it.
          </p>
          <div className="mt-8 space-y-4">
            {[
              {
                icon: Search,
                title: "We search our network",
                desc: "Access to 50+ suppliers across East and West Africa.",
              },
              {
                icon: Zap,
                title: "Fast response",
                desc: "You'll hear back within 24–48 hours with availability and pricing.",
              },
              {
                icon: MessageSquare,
                title: "No obligation",
                desc: "Requesting is free. Only pay when you decide to proceed.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/5 p-4"
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[rgba(255,255,255,0.62)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Form */}
        <section className="soft-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Request a product
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Tell us what you&apos;re looking for
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="req-name">
                  Full name
                </label>
                <input
                  id="req-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="req-email">
                  Email address
                </label>
                <input
                  id="req-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="req-phone">
                  Phone{" "}
                  <span className="font-normal text-[var(--muted)]">(optional)</span>
                </label>
                <input
                  id="req-phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="req-city">
                  City
                </label>
                <input
                  id="req-city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                  placeholder="e.g. Nairobi, Lagos, Kampala"
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="req-product">
                  Product name
                </label>
                <input
                  id="req-product"
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                  required
                  placeholder="e.g. Sony WH-1000XM5"
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="req-category">
                  Category
                </label>
                <select
                  id="req-category"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="req-desc">
                Description
              </label>
              <textarea
                id="req-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
                rows={4}
                placeholder="Describe the product, any specific model, specs, color, or quantity you need."
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="req-budget">
                Budget{" "}
                <span className="font-normal text-[var(--muted)]">(optional)</span>
              </label>
              <input
                id="req-budget"
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder="e.g. $200–$300"
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            {error && (
              <div className="rounded-[1rem] border border-[rgba(228,90,54,0.3)] bg-[rgba(228,90,54,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Sending request..." : "Send request"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
