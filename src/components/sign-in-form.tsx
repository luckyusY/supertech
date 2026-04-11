"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SignInFormProps = {
  ready: boolean;
  nextPath?: string;
};

export function SignInForm({ ready, nextPath }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ready) {
      setError("Login is temporarily unavailable. Please try again shortly.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            nextPath,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          redirectTo?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to sign in.");
        }

        router.refresh();
        router.replace(payload.redirectTo ?? "/");
      } catch (signInError) {
        setError(
          signInError instanceof Error ? signInError.message : "Unable to sign in.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
        />
      </div>

      {error ? (
        <div className="rounded-[1rem] border border-[rgba(228,90,54,0.3)] bg-[rgba(228,90,54,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !ready}
        className="w-full rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
