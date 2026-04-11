"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SignUpFormProps = {
  ready: boolean;
  nextPath?: string;
};

export function SignUpForm({ ready, nextPath }: SignUpFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ready) {
      setError("Sign up is temporarily unavailable. Please try again shortly.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            city,
            password,
            nextPath,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          redirectTo?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to create your account.");
        }

        router.refresh();
        router.replace(payload.redirectTo ?? "/account");
      } catch (signUpError) {
        setError(
          signUpError instanceof Error
            ? signUpError.message
            : "Unable to create your account.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold" htmlFor="signupName">
          Full name
        </label>
        <input
          id="signupName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signupEmail">
          Email
        </label>
        <input
          id="signupEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signupCity">
          City
        </label>
        <input
          id="signupCity"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Kigali"
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signupPassword">
          Password
        </label>
        <input
          id="signupPassword"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signupConfirmPassword">
          Confirm password
        </label>
        <input
          id="signupConfirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
