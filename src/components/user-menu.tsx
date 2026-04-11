"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronDown, LayoutDashboard, LogOut, Store, User } from "lucide-react";

type Props = {
  name: string;
  role: "admin" | "vendor" | "customer";
  dashboardPath: string;
};

export function UserMenu({ name, role, dashboardPath }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function signOut() {
    setOpen(false);
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }

  const firstName = name.split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/72 px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{firstName}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-white/95 shadow-xl backdrop-blur-xl">
          {/* User info */}
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="font-semibold tracking-[-0.02em]">{name}</p>
            <p className="mt-0.5 text-xs capitalize text-[var(--muted)]">{role} account</p>
          </div>

          {/* Links */}
          <div className="p-1.5">
            {role === "admin" && (
              <>
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(16,32,25,0.06)]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[var(--muted)]" />
                  Admin dashboard
                </Link>
                <Link
                  href="/dashboard/admin/analytics"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(16,32,25,0.06)]"
                >
                  <BarChart3 className="h-4 w-4 text-[var(--muted)]" />
                  Analytics
                </Link>
              </>
            )}

            {role === "vendor" && (
              <Link
                href="/dashboard/vendor"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(16,32,25,0.06)]"
              >
                <Store className="h-4 w-4 text-[var(--muted)]" />
                Vendor dashboard
              </Link>
            )}

            {role === "customer" && (
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(16,32,25,0.06)]"
              >
                <User className="h-4 w-4 text-[var(--muted)]" />
                My account
              </Link>
            )}

            <div className="my-1 border-t border-[var(--line)]" />

            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
