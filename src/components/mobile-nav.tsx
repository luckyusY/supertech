"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Car,
  ChevronRight,
  Gamepad2,
  Headphones,
  HeartPulse,
  Home,
  Landmark,
  Menu,
  Monitor,
  PackageSearch,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  Truck,
  Watch,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  "Home Control": Home,
  "Mobile Essentials": Smartphone,
  "Creator Gear": Monitor,
  Gaming: Gamepad2,
  Audio: Headphones,
  Wearables: Watch,
  "Beauty & Personal Care": Sparkles,
  "Health & Wellness": HeartPulse,
  "Cars for Sale": Car,
  "Cars for Rent": Car,
  "Apartments for Sale": Building2,
  "Apartments for Rent": Building2,
  "Land for Sale": Landmark,
  "Commercial Spaces": Briefcase,
};

const quickPills = [
  { label: "Flash deals", href: "/catalog" },
  { label: "Request", href: "/request-product" },
  { label: "Track order", href: "/track-order" },
  { label: "Vendors", href: "/vendors" },
] as const;

const toolLinks = [
  { label: "All products", href: "/catalog", icon: Tag },
  { label: "Official stores", href: "/vendors", icon: Store },
  { label: "Request a product", href: "/request-product", icon: PackageSearch },
  { label: "Track order", href: "/track-order", icon: Truck },
  { label: "Sell on SuperTech", href: "/become-vendor", icon: Store },
] as const;

type MobileSession = {
  email: string;
  role: "admin" | "vendor" | "customer";
  name: string;
  dashboardPath: string;
};

type CategoryImageMap = Record<string, string>;

type MobileNavProps = {
  categories: string[];
  categoryImages?: CategoryImageMap;
};

/**
 * Photo Factory–inspired mobile shop menu:
 * full-height sheet, shortcut pills, visual category rows.
 */
export function MobileNav({ categories, categoryImages = {} }: MobileNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load session.");
        const payload = (await response.json()) as { session: MobileSession | null };
        if (isActive) setSession(payload.session);
      } catch {
        if (isActive) setSession(null);
      }
    }

    void loadSession();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/12 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] bg-black/55 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ y: "8%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "6%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-2 bottom-[4.25rem] top-14 z-[90] flex flex-col overflow-hidden rounded-t-2xl bg-[var(--neutral-100)] shadow-2xl md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Shop menu"
            >
              <div className="flex items-center justify-between bg-[var(--background-strong)] px-4 py-3 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                    SuperTech
                  </p>
                  <p className="text-lg font-bold leading-none">Browse marketplace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[var(--gold)] ring-1 ring-white/20"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
                  {quickPills.map((pill) => (
                    <Link
                      key={pill.href}
                      href={pill.href}
                      onClick={() => setOpen(false)}
                      className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--foreground)]"
                    >
                      {pill.label}
                    </Link>
                  ))}
                </div>

                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Categories
                </p>
                <div className="space-y-1.5">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category] ?? Tag;
                    const image = categoryImages[category];
                    return (
                      <Link
                        key={category}
                        href={`/catalog?category=${encodeURIComponent(category)}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-2.5 py-2 shadow-sm"
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--neutral-50)]">
                          {image ? (
                            <Image
                              src={image}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="grid h-full w-full place-items-center text-[var(--accent)]">
                              <Icon className="h-5 w-5" />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold">{category}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                      </Link>
                    );
                  })}
                </div>

                <p className="mb-2 mt-5 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Shopper tools
                </p>
                <div className="space-y-1">
                  {toolLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-[var(--radius-md)] bg-white px-3 py-3 text-sm font-medium"
                    >
                      <link.icon className="h-4 w-4 text-[var(--accent)]" />
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-[var(--radius-md)] bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Account
                  </p>
                  <div className="mt-2 space-y-1">
                    {session ? (
                      <>
                        <Link
                          href={session.dashboardPath}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-[var(--accent-soft)]"
                        >
                          {session.role === "customer" ? "My account" : "Workspace"}
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left text-sm font-medium hover:bg-[var(--accent-soft)] disabled:opacity-60"
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
                          className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-[var(--accent-soft)]"
                        >
                          Log in
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </Link>
                        <Link
                          href="/sign-up"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-[var(--accent-soft)]"
                        >
                          Create account
                          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-4 rounded-[var(--radius-md)] bg-[var(--background-strong)] p-4 text-white",
                  )}
                >
                  <p className="text-sm font-bold">Can&apos;t find it?</p>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    Request any product and SuperTech will help source it from verified sellers.
                  </p>
                  <Link
                    href="/request-product"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
                  >
                    Request product
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
