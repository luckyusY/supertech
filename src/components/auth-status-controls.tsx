"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type AuthSession = {
  email: string;
  role: "admin" | "vendor" | "customer";
  name: string;
  vendorSlug?: string;
  dashboardPath: string;
};

type AuthStatusState =
  | { status: "loading" }
  | { status: "ready"; session: AuthSession | null }
  | { status: "error" };

function getWorkspaceLabel(session: AuthSession) {
  switch (session.role) {
    case "admin":
      return "Admin";
    case "vendor":
      return "Workspace";
    case "customer":
      return "Account";
    default:
      return "Dashboard";
  }
}

function getRoleLabel(session: AuthSession) {
  switch (session.role) {
    case "admin":
      return "Admin";
    case "vendor":
      return "Vendor";
    case "customer":
      return "Customer";
    default:
      return "User";
  }
}

export function AuthStatusControls() {
  const router = useRouter();
  const [state, setState] = useState<AuthStatusState>({ status: "loading" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load session.");
        }

        const payload = (await response.json()) as { session: AuthSession | null };

        if (isActive) {
          setState({ status: "ready", session: payload.session });
        }
      } catch {
        if (isActive) {
          setState({ status: "error" });
        }
      }
    }

    void loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });

      setState({ status: "ready", session: null });
      router.refresh();
      router.push("/");
    });
  }

  if (state.status === "loading") {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <div className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Checking access
        </div>
      </div>
    );
  }

  if (state.status === "error" || !state.session) {
    return (
      <Link
        href="/sign-in"
        className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
      >
        Sign in
      </Link>
    );
  }

  const { session } = state;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] lg:inline-flex">
        {getRoleLabel(session)}
      </span>
      <Link
        href={session.dashboardPath}
        className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
      >
        {getWorkspaceLabel(session)}
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={handleSignOut}
        className="rounded-full border border-[var(--line)] bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
