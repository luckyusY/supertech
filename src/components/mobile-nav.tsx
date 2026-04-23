"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Menu,
  Home,
  Smartphone,
  Monitor,
  Gamepad2,
  Headphones,
  Watch,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Tag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const categoryIcons = {
  "Home Control": Home,
  "Mobile Essentials": Smartphone,
  "Creator Gear": Monitor,
  Gaming: Gamepad2,
  Audio: Headphones,
  Wearables: Watch,
  "Beauty & Personal Care": Sparkles,
  "Health & Wellness": HeartPulse,
} as const;

const quickLinks = [
  { label: "All products", href: "/catalog" },
  { label: "All vendors", href: "/vendors" },
  { label: "Track order", href: "/track-order" },
  { label: "Cart", href: "/cart" },
  { label: "Request a product", href: "/request-product" },
];

type MobileSession = {
  email: string;
  role: "admin" | "vendor" | "customer";
  name: string;
  dashboardPath: string;
};

type MobileNavProps = {
  categories: string[];
};

export function MobileNav({ categories }: MobileNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<MobileSession | null>(null);
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

        const payload = (await response.json()) as { session: MobileSession | null };

        if (isActive) {
          setSession(payload.session);
        }
      } catch {
        if (isActive) {
          setSession(null);
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
      await fetch("/api/auth/sign-out", { method: "POST" });
      setSession(null);
      setOpen(false);
      router.refresh();
      router.push("/");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[var(--line)] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[11px] font-bold tracking-[0.18em] text-white">ST</div>
                  <span className="font-semibold tracking-[-0.02em]">SuperTech</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background)] text-[var(--muted)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Categories */}
                <div className="px-5 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Shop by category</p>
                  <div className="mt-3 space-y-1">
                    {categories.map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons] ?? Tag;
                      return (
                      <Link
                        key={category}
                        href={`/catalog?category=${encodeURIComponent(category)}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                            <Icon className="h-4 w-4 text-[var(--accent)]" />
                          </span>
                          <span className="text-sm font-medium">{category}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                      </Link>
                    );
                    })}
                  </div>
                </div>

                {/* Quick links */}
                <div className="border-t border-[var(--line)] px-5 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Quick links</p>
                  <div className="mt-3 space-y-1">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--line)] px-5 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Account</p>
                  <div className="mt-3 space-y-1">
                    {session ? (
                      <>
                        <Link
                          href={session.dashboardPath}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-[var(--accent-soft)]"
                        >
                          {session.role === "customer" ? "My account" : "Workspace"}
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors hover:bg-[var(--accent-soft)] disabled:opacity-60"
                        >
                          {isPending ? "Signing out..." : "Sign out"}
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/sign-in"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-[var(--accent-soft)]"
                        >
                          Log in
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </Link>
                        <Link
                          href="/sign-up"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-[var(--accent-soft)]"
                        >
                          Create account
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="border-t border-[var(--line)] p-5">
                <Link
                  href="/catalog"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-sm"
                >
                  Shop now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
