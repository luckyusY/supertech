"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, BarChart3, ChevronDown, LayoutDashboard, LogOut, Store, User } from "lucide-react";

type Props = {
  name: string;
  role: "admin" | "vendor" | "customer";
  dashboardPath: string;
};

export function UserMenu({ name, role, dashboardPath }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    // @ts-ignore
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      // @ts-ignore
      window.google.accounts.id.disableAutoSelect();
    }
    await fetch("/api/auth/sign-out", { method: "POST" });
    // Hard navigation so the server-rendered header drops the session immediately.
    window.location.assign("/sign-in");
  }

  const firstName = name.split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-md border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--accent-soft)]"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{firstName}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[var(--line)] bg-white text-[var(--foreground)] shadow-xl">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="font-semibold tracking-[-0.02em]">{name}</p>
            <p className="mt-0.5 text-xs capitalize text-[var(--muted)]">{role} account</p>
          </div>

          <div className="p-1.5">
            {role === "admin" && (
              <>
                <Link
                  href="/dashboard/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
                >
                  <LayoutDashboard className="h-4 w-4 text-[var(--muted)] group-hover:text-white" />
                  Admin dashboard
                </Link>
                <Link
                  href="/dashboard/admin/analytics"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
                >
                  <BarChart3 className="h-4 w-4 text-[var(--muted)] group-hover:text-white" />
                  Analytics
                </Link>
              </>
            )}

            {role === "vendor" && (
              <Link
                href="/dashboard/vendor"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
              >
                <Store className="h-4 w-4 text-[var(--muted)] group-hover:text-white" />
                Vendor dashboard
              </Link>
            )}

            {role === "customer" && (
              <Link
                href="/become-vendor"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
              >
                <Store className="h-4 w-4 text-[var(--muted)] group-hover:text-white" />
                Sell on SuperTech
              </Link>
            )}

            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
            >
              <User className="h-4 w-4 text-[var(--muted)] group-hover:text-white" />
              My Profile
            </Link>
            
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
            >
              <svg className="h-4 w-4 text-[var(--muted)] group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              My Orders
            </Link>

            <Link
              href="/saved"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
            >
              <svg className="h-4 w-4 text-[var(--muted)] group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Saved Items
            </Link>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
            >
              <svg className="h-4 w-4 text-[var(--muted)] group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account Settings
            </Link>

            <Link
              href="/support"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-white group"
            >
              <svg className="h-4 w-4 text-[var(--muted)] group-hover:text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Help & Support
            </Link>

            <div className="my-1 border-t border-[var(--line)]" />

            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 group"
            >
              <ArrowRightLeft className="h-4 w-4 text-[var(--muted)]" />
              Switch account
            </button>

            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
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
