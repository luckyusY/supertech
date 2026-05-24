"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to reset password.");
        setSuccess(true);
        setPassword("");
        setConfirm("");
      } catch (resetError) {
        setError(resetError instanceof Error ? resetError.message : "Unable to reset password.");
      }
    });
  }

  if (success) {
    return (
      <div className="mt-6 rounded-[1rem] border border-[#bbf7d0] bg-[#dcfce7] px-4 py-4 text-sm text-[#166534]">
        Your password has been updated.{" "}
        <Link href="/sign-in" className="font-semibold underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="text-sm font-semibold" htmlFor="reset-password">
          New password
        </label>
        <div className="relative mt-2">
          <input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white py-3 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="reset-confirm">
          Confirm new password
        </label>
        <div className="relative mt-2">
          <input
            id="reset-confirm"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white py-3 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
        {isPending ? "Updating password..." : "Update password"}
      </button>
    </form>
  );
}
