"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type RecoverySuccess = {
  requestId: string;
  email: string;
};

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RecoverySuccess | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/password-recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, phone, notes }),
        });
        const payload = (await response.json()) as
          | { error: string }
          | RecoverySuccess;

        if (!response.ok || "error" in payload) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Unable to submit password recovery request.",
          );
        }

        setSuccess(payload);
        setNotes("");
      } catch (recoveryError) {
        setError(
          recoveryError instanceof Error
            ? recoveryError.message
            : "Unable to submit password recovery request.",
        );
      }
    });
  }

  if (success) {
    return (
      <div className="soft-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Request received
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
          Check your email for the reset link.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          If an account exists for {success.email}, we sent a password reset link.
          Keep this support reference: <span className="font-semibold">{success.requestId}</span>.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-center text-sm font-semibold text-white"
          >
            Back to sign in
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
          >
            Send another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="soft-card space-y-5 p-6 sm:p-8">
      <div>
        <label className="text-sm font-semibold" htmlFor="recovery-email">
          Account email
        </label>
        <input
          id="recovery-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold" htmlFor="recovery-name">
            Full name
          </label>
          <input
            id="recovery-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="recovery-phone">
            Phone or WhatsApp
          </label>
          <input
            id="recovery-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="recovery-notes">
          Anything support should know?
        </label>
        <textarea
          id="recovery-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      {error ? (
        <div className="rounded-[1rem] border border-[var(--red-soft)] bg-[var(--red-soft)] px-4 py-3 text-sm text-[var(--red)]">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? "Sending reset link..." : "Send password reset link"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Remembered your password?{" "}
        <Link href="/sign-in" className="font-semibold text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
