import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, Sparkles, Truck } from "lucide-react";
import { SignUpForm } from "@/components/sign-up-form";
import { getAuthSetupState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your SuperTech account to request products, save details, and move faster at checkout.",
};

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : undefined;
  const setupState = getAuthSetupState();
  const signUpReady = setupState.ready && setupState.customerAccountsEnabled;

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <section className="dark-card p-6 sm:p-8 lg:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-[rgba(255,255,255,0.78)]">
            <Sparkles className="h-4 w-4" />
            Join SuperTech
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Create an account for faster orders and product requests.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(255,255,255,0.76)]">
            Create your customer account once, then use it anytime you want to
            request a hard-to-find product or move quickly through our manual order flow.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: PackageSearch,
                title: "Request what you need",
                description: "Send us the exact product or model you want us to source.",
              },
              {
                icon: Truck,
                title: "Keep shipping details ready",
                description: "Your account makes repeat requests much faster.",
              },
              {
                icon: Sparkles,
                title: "See your latest requests",
                description: "Open your account to view the latest sourcing requests you submitted.",
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
            Create account
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Start your customer account
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Set up your account with your email and password.
          </p>
          <div className="mt-6">
            <SignUpForm ready={signUpReady} nextPath={nextPath} />
          </div>
          {!signUpReady ? (
            <div className="mt-6 rounded-[1.2rem] border border-[rgba(228,90,54,0.2)] bg-[rgba(228,90,54,0.06)] p-4 text-sm leading-7 text-[var(--muted)]">
              Customer sign-up needs both the auth secret and MongoDB account storage to
              be available.
            </div>
          ) : null}
          <div className="mt-6 rounded-[1.2rem] border border-[var(--line)] bg-white/72 p-4 text-sm leading-7 text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--foreground)]">
              Log in here
            </Link>
            .
          </div>
        </section>
      </div>
    </div>
  );
}
