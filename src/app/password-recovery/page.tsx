import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/password-recovery-form";

export const metadata: Metadata = {
  title: "Password Recovery",
  description: "Reset your SuperTech account password.",
};

export default function PasswordRecoveryPage() {
  return (
    <div className="page-shell py-8">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/60">
            Account help
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            Recover your SuperTech password.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Enter your account email and we will send a secure password reset
            link if the account exists.
          </p>
        </section>
        <PasswordRecoveryForm />
      </div>
    </div>
  );
}
