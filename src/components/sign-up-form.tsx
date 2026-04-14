"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const payload = (await res.json()) as { error?: string; redirectTo?: string };
        if (!res.ok) throw new Error(payload.error ?? "Could not create account.");
        router.refresh();
        router.replace(payload.redirectTo ?? "/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create account.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold" htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signup-email">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">Minimum 8 characters</p>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signup-confirm">
          Confirm password
        </label>
        <input
          id="signup-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      {error && (
        <div className="rounded-[1rem] border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? "Creating account..." : "Create free account"}
      </button>
      <p className="text-center text-xs text-[var(--muted)]">
        By signing up you agree to our{" "}
        <span className="font-medium text-[var(--foreground)]">Terms of Service</span> and{" "}
        <span className="font-medium text-[var(--foreground)]">Privacy Policy</span>.
      </p>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[var(--foreground)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
