"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Building2,
  Car,
  ChevronDown,
  Gamepad2,
  Headphones,
  HeartPulse,
  Home,
  Landmark,
  LayoutGrid,
  Menu,
  Monitor,
  PackageSearch,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
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

/** Kept inside this client module so icons are never serialized across the RSC boundary. */
const shopperLinks = [
  { label: "Vendors", href: "/vendors", icon: Store },
  { label: "Request Product", href: "/request-product", icon: PackageSearch },
  { label: "Track Order", href: "/track-order", icon: Truck },
  { label: "Sell on SuperTech", href: "/become-vendor", icon: ShieldCheck },
] as const;

type DesktopCategoryNavProps = {
  categories: string[];
};

/**
 * Photo Factory–inspired desktop nav:
 * Departments mega panel + quick links + promo card.
 */
export function DesktopCategoryNav({ categories }: DesktopCategoryNavProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(categories[0] ?? "");

  return (
    <nav
      className="relative hidden border-b border-[var(--line)] bg-[var(--background-strong)] text-white lg:block"
      onMouseLeave={() => setOpen(false)}
    >
      <div className="page-shell flex h-11 items-center gap-1">
        <button
          type="button"
          onMouseEnter={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          className={cn(
            "flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-bold transition-colors",
            open ? "bg-[var(--accent)] text-white" : "hover:bg-white/10",
          )}
        >
          <Menu className="h-4 w-4" />
          Categories
          <ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </button>

        {shopperLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onMouseEnter={() => setOpen(false)}
            className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white"
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        ))}

        <div className="ml-auto hidden items-center gap-4 text-sm font-semibold text-white/80 xl:flex">
          <Link href="/catalog" className="hover:text-white">
            Flash deals
          </Link>
          <Link href="/track-order" className="hover:text-white">
            Track order
          </Link>
          <Link href="/become-vendor" className="text-[var(--gold)] hover:text-white">
            Sell
          </Link>
        </div>
      </div>

      {open ? (
        <div className="absolute left-1/2 top-full z-[var(--z-drawer)] w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 bg-white text-[var(--foreground)] shadow-[var(--elevation-3)] ring-1 ring-black/8">
          <div className="grid min-h-[320px] grid-cols-[220px_minmax(0,1fr)_240px]">
            <aside className="border-r border-[var(--line)] bg-[var(--neutral-50)] p-2">
              {categories.map((category) => {
                const Icon = iconMap[category] ?? LayoutGrid;
                const isActive = active === category;
                return (
                  <Link
                    key={category}
                    href={`/catalog?category=${encodeURIComponent(category)}`}
                    onMouseEnter={() => setActive(category)}
                    onFocus={() => setActive(category)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "mb-0.5 flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-[var(--background-strong)] font-bold text-[var(--gold)]"
                        : "font-medium text-[var(--foreground)] hover:bg-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="min-w-0 truncate">{category}</span>
                  </Link>
                );
              })}
            </aside>

            <div className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-title">{active || "All categories"}</h3>
                <Link
                  href={
                    active
                      ? `/catalog?category=${encodeURIComponent(active)}`
                      : "/catalog"
                  }
                  onClick={() => setOpen(false)}
                  className="text-sm font-bold text-[var(--accent)] hover:underline"
                >
                  Shop all
                </Link>
              </div>
              <p className="mt-2 max-w-lg text-body text-[var(--muted)]">
                Browse verified listings in {active || "every category"}. Request
                products that aren&apos;t listed yet, or track an existing order.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-3">
                {categories.slice(0, 9).map((category) => (
                  <Link
                    key={category}
                    href={`/catalog?category=${encodeURIComponent(category)}`}
                    onClick={() => setOpen(false)}
                    className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--neutral-50)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-zinc-950"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div className="m-4 flex flex-col justify-between rounded-[var(--radius-md)] bg-[var(--background-strong)] p-5 text-white">
              <div>
                <p className="text-overline text-[var(--gold)]">Shopper tools</p>
                <h4 className="mt-2 text-xl font-bold leading-snug">
                  Request it. Track it. Get updates.
                </h4>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Missing a listing? Send a product request. Already ordered? Follow status anytime.
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/request-product"
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-[var(--accent-hover)]"
                >
                  Request product
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setOpen(false)}
                  className="rounded-[var(--radius-sm)] border border-white/20 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-white/10"
                >
                  Track order
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
