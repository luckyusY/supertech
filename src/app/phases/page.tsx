import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildPhases } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: "Build Phases",
  description: "Roadmap for growing the marketplace from manual orders to full checkout.",
};

export default function PhasesPage() {
  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Product roadmap
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Build the marketplace in clear phases, not all at once.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          This roadmap keeps the ecommerce launch practical: collect orders first,
          then add seller operations, then bring in cart and payment flows when the
          business is ready.
        </p>
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {buildPhases.map((phase) => (
            <section
              key={phase.id}
              className="rounded-[1.7rem] border border-[var(--line)] bg-white/72 p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                  {phase.step}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                    phase.status === "done"
                      ? "bg-[rgba(8,145,178,0.12)] text-[var(--teal)]"
                      : phase.status === "active"
                        ? "bg-[rgba(245,158,11,0.18)] text-[#9c6b0b]"
                        : phase.status === "next"
                          ? "bg-[rgba(37,99,235,0.1)] text-[var(--accent)]"
                          : "bg-[rgba(15,23,42,0.06)] text-[var(--muted)]"
                  }`}
                >
                  {phase.status}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                {phase.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {phase.description}
              </p>
              <div className="mt-5 space-y-3">
                {phase.deliverables.map((deliverable) => (
                  <div
                    key={deliverable}
                    className="rounded-[1.15rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                  >
                    {deliverable}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded-[1.7rem] border border-[var(--line)] bg-[rgba(15,23,42,0.03)] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Current focus
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              Phase 4 is active: vendor payouts, in-app notifications, admin analytics, and customer reviews are now live across the marketplace.
            </p>
          </div>
          <Link
            href="/dashboard/admin/analytics"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
          >
            View analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
