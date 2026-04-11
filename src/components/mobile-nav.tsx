"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Menu, Home, Smartphone, Monitor, Gamepad2, Headphones, Watch, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const categories = [
  { name: "Home Control", href: "/catalog?category=Home+Control", icon: Home },
  { name: "Mobile Essentials", href: "/catalog?category=Mobile+Essentials", icon: Smartphone },
  { name: "Creator Gear", href: "/catalog?category=Creator+Gear", icon: Monitor },
  { name: "Gaming", href: "/catalog?category=Gaming", icon: Gamepad2 },
  { name: "Audio", href: "/catalog?category=Audio", icon: Headphones },
  { name: "Wearables", href: "/catalog?category=Wearables", icon: Watch },
];

const quickLinks = [
  { label: "All products", href: "/catalog" },
  { label: "All vendors", href: "/vendors" },
  { label: "Track order", href: "/track-order" },
  { label: "Cart", href: "/cart" },
  { label: "Request a product", href: "/request" },
  { label: "Sign in", href: "/sign-in" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 md:hidden"
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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
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
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)] text-[11px] font-bold tracking-[0.18em] text-white">ST</div>
                  <span className="font-semibold tracking-[-0.02em]">SuperTech</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Categories */}
                <div className="px-5 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">Shop by category</p>
                  <div className="mt-3 space-y-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-[rgba(16,32,25,0.05)]"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(16,32,25,0.06)]">
                            <cat.icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-semibold">{cat.name}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                      </Link>
                    ))}
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
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(16,32,25,0.05)]"
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="border-t border-[var(--line)] p-5">
                <Link
                  href="/catalog"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-white"
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
