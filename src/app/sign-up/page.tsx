import type { Metadata } from "next";
import Link from "next/link";
import { Package, ShieldCheck, Zap } from "lucide-react";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join SuperTech — shop premium tech from verified sellers.",
};

export default function SignUpPage() {
  return (
    <div className="page-shell flex min-h-[calc(100vh-80px)] items-center py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-4xl gap-6 xl:grid-cols-[1fr_420px]">
        {/* Brand panel — hidden on mobile */}
        <section className="dark-card hidden flex-col justify-between p-8 xl:flex lg:p-12">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-white/10 text-sm font-bold tracking-[0.18em] text-white">
              ST
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Join SuperTech today.
            </h1>
            <p className="mt-4 text-base leading-7 text-[rgba(255,255,255,0.72)]">
              Create a free account and start shopping premium tech from verified sellers.
            </p>
          </div>
          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, label: "Safe & secure", desc: "Your data is encrypted and never shared" },
              { icon: Package, label: "Track your orders", desc: "Real-time status from purchase to delivery" },
              { icon: Zap, label: "Exclusive deals", desc: "Members get early access to sales and drops" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-[rgba(255,255,255,0.62)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form panel */}
        <section className="soft-card mx-auto w-full max-w-md p-6 sm:p-8 xl:max-w-none xl:mx-0">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Create account</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Start shopping today</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
          <div className="mt-6">
            <SignUpForm />
          </div>
        </section>
      </div>
    </div>
  );
}
