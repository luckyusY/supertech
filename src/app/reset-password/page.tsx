import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your SuperTech account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token = "" } = await searchParams;

  return (
    <div className="page-shell flex min-h-[calc(100vh-80px)] items-center py-8">
      <section className="soft-card mx-auto w-full max-w-md p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Account security
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          Reset your password.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Choose a new password for your SuperTech account.
        </p>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="mt-6 rounded-[1rem] border border-[var(--red-soft)] bg-[var(--red-soft)] px-4 py-3 text-sm text-[var(--red)]">
            This reset link is missing a token. Please request a new password reset.
          </div>
        )}
        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          Remembered your password?{" "}
          <Link href="/sign-in" className="font-semibold text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}

