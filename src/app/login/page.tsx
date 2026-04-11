import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, PackageSearch, Truck } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";
import { getAuthSetupState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your SuperTech account to track requests, orders, and saved details.",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : undefined;
  const setupState = getAuthSetupState();

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <section className="dark-card p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-[rgba(255,255,255,0.78)]">
            <LockKeyhole className="h-4 w-4" />
            Customer account
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Log in and continue shopping or requesting products.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(255,255,255,0.76)]">
            Your account keeps your details ready for faster ordering, custom product
            requests, and future account-based order history.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: PackageSearch,
                title: "Request products",
                description: "Ask us to source items that are not yet in the catalog.",
              },
              {
                icon: Truck,
                title: "Ship with less friction",
                description: "Reuse your saved details when you need a quote or delivery.",
              },
              {
                icon: LockKeyhole,
                title: "One secure account",
                description: "Customer login is separate from vendor and admin workspaces.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4"
              >
                <item.icon className="h-5 w-5 text-[var(--gold)]" />
                <p className="mt-4 text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.72)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="soft-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Log in
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Welcome back
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Use your email and password to continue to your account.
          </p>
          <div className="mt-6">
            <SignInForm ready={setupState.ready} nextPath={nextPath} />
          </div>
          <div className="mt-6 rounded-[1.2rem] border border-[var(--line)] bg-white/72 p-4 text-sm leading-7 text-[var(--muted)]">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[var(--foreground)]">
              Create your account
            </Link>
            .
          </div>
        </section>
      </div>
    </div>
  );
}
