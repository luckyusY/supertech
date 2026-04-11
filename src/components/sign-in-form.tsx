"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";

type Props = { nextPath?: string };

export function SignInForm({ nextPath }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, nextPath }),
        });
        const payload = (await res.json()) as { error?: string; redirectTo?: string };
        if (!res.ok) throw new Error(payload.error ?? "Unable to sign in.");
        router.refresh();
        router.replace(payload.redirectTo ?? "/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to sign in.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold" htmlFor="signin-email">
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signin-password">
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
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
        className="w-full rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-[var(--foreground)] hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  );
}
