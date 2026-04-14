"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Phone } from "lucide-react";
import Link from "next/link";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
          body: JSON.stringify({ name, email, phone, password }),
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
        <label className="text-sm font-semibold" htmlFor="signup-phone">
          Phone number <span className="text-[var(--muted)] font-normal">(optional)</span>
        </label>
        <div className="relative mt-2">
          <input
            id="signup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white py-3 pr-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signup-password">
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
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
        <p className="mt-1.5 text-xs text-[var(--muted)]">Minimum 8 characters</p>
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="signup-confirm">
          Confirm password
        </label>
        <div className="relative mt-2">
          <input
            id="signup-confirm"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full rounded-[1rem] border border-[var(--line)] bg-white py-3 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
        {isPending ? "Creating account..." : "Create free account"}
      </button>
      <p className="text-center text-xs text-[var(--muted)]">
        By signing up you agree to our{" "}
        <span className="font-medium text-[var(--foreground)]">Terms of Service</span> and{" "}
        <span className="font-medium text-[var(--foreground)]">Privacy Policy</span>.
      </p>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
