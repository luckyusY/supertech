"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Cpu,
  Headphones,
  Home,
  Smartphone,
  Watch,
  Gamepad2,
  Monitor,
  Tag,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";

const categories = [
  { name: "Home Control", href: "/catalog?category=Home+Control", icon: Home, desc: "Smart hubs, sensors & lighting" },
  { name: "Mobile Essentials", href: "/catalog?category=Mobile+Essentials", icon: Smartphone, desc: "Chargers, buds & accessories" },
  { name: "Creator Gear", href: "/catalog?category=Creator+Gear", icon: Monitor, desc: "Keyboards, docks & desk tools" },
  { name: "Gaming", href: "/catalog?category=Gaming", icon: Gamepad2, desc: "Headsets, chairs & setup gear" },
  { name: "Audio", href: "/catalog?category=Audio", icon: Headphones, desc: "Headphones, speakers & DACs" },
  { name: "Wearables", href: "/catalog?category=Wearables", icon: Watch, desc: "Smartwatches & fitness bands" },
];

const collections = [
  { name: "New arrivals", href: "/catalog", icon: Zap },
  { name: "Best sellers", href: "/catalog", icon: TrendingUp },
  { name: "Top rated", href: "/catalog", icon: Star },
  { name: "Deals", href: "/catalog", icon: Tag },
];

const topVendors = [
  { name: "Aurora Labs", slug: "aurora-labs", tag: "Home Control" },
  { name: "Signal Mobile", slug: "signal-mobile", tag: "Mobile" },
  { name: "Pixel Foundry", slug: "pixel-foundry", tag: "Creator" },
  { name: "Wave Audio", slug: "wave-audio", tag: "Audio" },
  { name: "Orbit Play", slug: "orbit-play", tag: "Gaming" },
  { name: "Flex Wearables", slug: "flex-wearables", tag: "Wearables" },
];

type DropdownKey = "shop" | "vendors" | null;

export function MegaMenu() {
  const [open, setOpen] = useState<DropdownKey>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter(key: DropdownKey) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(key);
  }

  function leave() {
    timeoutRef.current = setTimeout(() => setOpen(null), 120);
  }

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {/* Shop dropdown */}
      <div
        className="relative"
        onMouseEnter={() => enter("shop")}
        onMouseLeave={leave}
      >
        <button
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${open === "shop" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          Shop
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === "shop" ? "rotate-180" : ""}`} />
        </button>

        {open === "shop" && (
          <div
            className="absolute left-1/2 top-full z-50 mt-2 w-[580px] -translate-x-1/2 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-2xl"
            onMouseEnter={() => enter("shop")}
            onMouseLeave={leave}
          >
            <div className="grid grid-cols-2 gap-0">
              {/* Categories */}
              <div className="border-r border-[var(--line)] p-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
                  Categories
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      onClick={() => setOpen(null)}
                      className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 transition-colors hover:bg-[rgba(16,32,25,0.04)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(16,32,25,0.06)]">
                        <cat.icon className="h-4 w-4 text-[var(--foreground)]" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{cat.name}</span>
                        <span className="block text-xs text-[var(--muted)]">{cat.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Collections + all products */}
              <div className="p-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
                  Collections
                </p>
                <div className="space-y-1">
                  {collections.map((col) => (
                    <Link
                      key={col.name}
                      href={col.href}
                      onClick={() => setOpen(null)}
                      className="flex items-center gap-3 rounded-[0.9rem] px-3 py-2.5 transition-colors hover:bg-[rgba(16,32,25,0.04)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[rgba(228,90,54,0.1)]">
                        <col.icon className="h-4 w-4 text-[var(--accent)]" />
                      </span>
                      <span className="text-sm font-semibold">{col.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 border-t border-[var(--line)] pt-4">
                  <Link
                    href="/catalog"
                    onClick={() => setOpen(null)}
                    className="flex items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Cpu className="h-4 w-4" />
                    View all products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vendors dropdown */}
      <div
        className="relative"
        onMouseEnter={() => enter("vendors")}
        onMouseLeave={leave}
      >
        <button
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${open === "vendors" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
        >
          Vendors
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === "vendors" ? "rotate-180" : ""}`} />
        </button>

        {open === "vendors" && (
          <div
            className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-[1.4rem] border border-[var(--line)] bg-white shadow-2xl"
            onMouseEnter={() => enter("vendors")}
            onMouseLeave={leave}
          >
            <div className="p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
                Our sellers
              </p>
              <div className="space-y-1">
                {topVendors.map((v) => (
                  <Link
                    key={v.slug}
                    href={`/vendors/${v.slug}`}
                    onClick={() => setOpen(null)}
                    className="flex items-center justify-between rounded-[0.9rem] px-3 py-2.5 transition-colors hover:bg-[rgba(16,32,25,0.04)]"
                  >
                    <span className="text-sm font-semibold">{v.name}</span>
                    <span className="rounded-full bg-[rgba(16,32,25,0.06)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
                      {v.tag}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-[var(--line)] pt-3">
                <Link
                  href="/vendors"
                  onClick={() => setOpen(null)}
                  className="block rounded-full border border-[var(--line)] py-2 text-center text-sm font-semibold hover:bg-[var(--foreground)] hover:text-white"
                >
                  All vendors
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simple links */}
      <Link
        href="/track-order"
        className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        Track Order
      </Link>
      <Link
        href="/phases"
        className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        Roadmap
      </Link>
    </nav>
  );
}
