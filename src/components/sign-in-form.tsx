"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type Props = { nextPath?: string };

export function SignInForm({ nextPath }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative mt-2">
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-[1rem] border border-[var(--red-soft)] bg-[var(--red-soft)] px-4 py-3 text-sm text-[var(--red)]">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-[var(--accent)] hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  );
}
