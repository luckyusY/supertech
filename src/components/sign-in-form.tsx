"use client";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

type Props = { nextPath?: string };

type Mode = "password" | "magic";

const inputClass =
  "w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";

export function SignInForm({ nextPath }: Props) {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
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
        // Hard navigation so the server-rendered header/layout re-reads the
        // freshly set session cookie. A client-side router.replace keeps the
        // already-rendered layout, leaving the header unaware of the new session.
        window.location.assign(payload.redirectTo ?? "/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to sign in.");
      }
    });
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMagicSent("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setMagicLoading(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nextPath }),
      });
      const payload = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Unable to send sign-in link.");
      setMagicSent(
        payload.message ??
          "If an account exists for that email, we've sent a sign-in link.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send sign-in link.");
    } finally {
      setMagicLoading(false);
    }
  }

  if (mode === "magic") {
    return (
      <form onSubmit={handleMagicLink} className="space-y-5">
        <div>
          <label className="text-sm font-semibold" htmlFor="magic-email">
            Email address
          </label>
          <input
            id="magic-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className={`mt-2 ${inputClass}`}
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            We&apos;ll email you a secure link to sign in — no password needed.
          </p>
        </div>

        {error && (
          <div className="rounded-[1rem] border border-[var(--red-soft)] bg-[var(--red-soft)] px-4 py-3 text-sm text-[var(--red)]">
            {error}
          </div>
        )}
        {magicSent && (
          <div className="flex items-start gap-2 rounded-[1rem] border border-[#bbf7d0] bg-[#dcfce7] px-4 py-3 text-sm text-[#166534]">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {magicSent}
          </div>
        )}

        <button
          type="submit"
          disabled={magicLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {magicLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {magicLoading ? "Sending..." : "Email me a sign-in link"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError("");
            setMagicSent("");
          }}
          className="w-full text-center text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Sign in with a password instead
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <GoogleSignInButton nextPath={nextPath} />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-xs text-[var(--muted)]">or continue with email</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div>
        <label className="text-sm font-semibold" htmlFor="signin-email">
          Email address
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className={`mt-2 ${inputClass}`}
        />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold" htmlFor="signin-password">
            Password
          </label>
          <Link
            href="/password-recovery"
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-2">
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-xs text-[var(--muted)]">or</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <button
        type="button"
        onClick={() => {
          setMode("magic");
          setError("");
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Mail className="h-4 w-4" />
        Email me a sign-in link
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
