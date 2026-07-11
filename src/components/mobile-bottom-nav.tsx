"use client";

import {
  ArrowLeft,
  Building2,
  Car,
  ChevronRight,
  Clock3,
  Gamepad2,
  Headphones,
  HeartPulse,
  Home,
  Landmark,
  LayoutGrid,
  Menu,
  Monitor,
  PackageSearch,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Tags,
  Truck,
  User,
  Watch,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { cn } from "@/lib/utils";

const tabs = ["Categories", "Vendors", "Tools", "Deals"] as const;

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  image?: string;
  children?: MenuItem[];
};

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
  "Commercial Spaces": Building2,
};

type MarketplacePayload = {
  products: Array<{ category: string; heroImage: string; name: string; slug: string }>;
  vendors: Array<{
    slug: string;
    name: string;
    headline: string;
    activeProducts: number;
  }>;
  categories: string[];
};

/**
 * Photo Factory mobile dock + Browse sheet.
 * Categories live in Browse (not the header hamburger).
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Categories");
  const [activeDepartment, setActiveDepartment] = useState<MenuItem | null>(null);
  const [data, setData] = useState<MarketplacePayload | null>(null);

  const close = () => {
    setOpen(false);
    setActiveDepartment(null);
  };

  const selectTab = (tab: (typeof tabs)[number]) => {
    setActiveTab(tab);
    setActiveDepartment(null);
  };

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || data) return;
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/mobile/marketplace", { cache: "no-store" });
        if (!res.ok) throw new Error("failed");
        const json = (await res.json()) as MarketplacePayload;
        if (active) setData(json);
      } catch {
        if (active) setData({ products: [], vendors: [], categories: [] });
      }
    })();
    return () => {
      active = false;
    };
  }, [open, data]);

  const categoryRows = useMemo(() => {
    const cats = (data?.categories ?? []).filter((c) => c && c !== "All");
    const imageByCategory = new Map<string, string>();
    for (const product of data?.products ?? []) {
      if (!imageByCategory.has(product.category) && product.heroImage) {
        imageByCategory.set(product.category, product.heroImage);
      }
    }
    return cats.map((name) => ({
      label: name,
      href: `/catalog?category=${encodeURIComponent(name)}`,
      icon: categoryIcons[name] ?? LayoutGrid,
      image: imageByCategory.get(name),
    }));
  }, [data]);

  const isHome = pathname === "/";
  const isCart = pathname === "/cart" || pathname.startsWith("/cart/");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/sign-");
  const isRequest = pathname.startsWith("/request");
  const isVendors = pathname.startsWith("/vendors");

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-[var(--gold)]/35 bg-[var(--background-strong)] text-white shadow-[0_-4px_18px_rgba(0,0,0,0.35)] sm:hidden">
        <div className="grid grid-cols-6 pb-safe text-[10px] font-semibold">
          <Link
            href="/"
            className={cn(
              "grid place-items-center gap-0.5 py-1.5",
              isHome ? "text-[var(--gold)]" : "text-white/80",
            )}
          >
            <Home size={22} />
            Home
          </Link>

          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setActiveDepartment(null);
            }}
            className={cn(
              "grid place-items-center gap-0.5 border-t-4 py-1",
              open
                ? "border-[var(--gold)] text-[var(--gold)]"
                : "border-transparent text-white/80",
            )}
            aria-expanded={open}
            aria-label="Browse categories"
          >
            <Menu size={25} />
            Browse
          </button>

          <Link
            href="/request-product"
            className={cn(
              "grid place-items-center gap-0.5 py-1.5",
              isRequest ? "text-[var(--gold)]" : "text-white/80",
            )}
          >
            <PackageSearch size={22} />
            Request
          </Link>

          <Link
            href="/vendors"
            className={cn(
              "grid place-items-center gap-0.5 py-1.5",
              isVendors ? "text-[var(--gold)]" : "text-white/80",
            )}
          >
            <Store size={22} />
            Stores
          </Link>

          <Link
            href="/account"
            className={cn(
              "grid place-items-center gap-0.5 py-1.5",
              isAccount ? "text-[var(--gold)]" : "text-white/80",
            )}
          >
            <User size={22} />
            Account
          </Link>

          <Link
            href="/cart"
            className={cn(
              "relative grid place-items-center gap-0.5 py-1.5",
              isCart ? "text-[var(--gold)]" : "text-white/80",
            )}
          >
            <span className="relative">
              <ShoppingCart size={24} />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent)] px-0.5 text-[9px] font-black text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </span>
            Cart
          </Link>
        </div>
      </div>

      {open ? (
        <div
          className="sheet-backdrop fixed inset-0 z-[80] bg-black/55 sm:hidden"
          onClick={close}
        >
          <div
            className="sheet-panel absolute inset-x-2 bottom-14 top-14 overflow-hidden rounded-t-xl bg-[#f2f2f2] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Browse SuperTech"
          >
            <div className="absolute inset-x-0 top-1.5 z-10 mx-auto h-1 w-10 rounded-full bg-white/50" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-[var(--background-strong)] text-[var(--gold)] ring-1 ring-[var(--gold)]/40"
            >
              <X size={20} />
            </button>

            <div className="flex overflow-x-auto bg-[var(--background-strong)] px-2 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => selectTab(tab)}
                  className={cn(
                    "shrink-0 rounded-t px-4 py-3 text-base font-bold sm:text-lg",
                    activeTab === tab
                      ? "bg-white text-[var(--foreground)]"
                      : "bg-[var(--background-strong)] text-white",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="h-[calc(100%-52px)] overflow-y-auto p-3 text-[var(--foreground)]">
              {activeTab === "Categories" ? (
                activeDepartment ? (
                  <div className="panel-slide-in">
                    <DepartmentPanel
                      department={activeDepartment}
                      onBack={() => setActiveDepartment(null)}
                      onNavigate={close}
                    />
                  </div>
                ) : (
                  <>
                    <ShortcutPills onNavigate={close} />
                    {categoryRows.length === 0 ? (
                      <p className="py-10 text-center text-sm text-[var(--muted)]">
                        Loading categories…
                      </p>
                    ) : (
                      categoryRows.map((item) => (
                        <MenuRow
                          key={item.label}
                          item={item}
                          onNavigate={close}
                        />
                      ))
                    )}
                  </>
                )
              ) : null}

              {activeTab === "Vendors" ? (
                <>
                  <div className="mb-3 flex justify-between py-2 text-sm font-bold uppercase text-[var(--foreground)]">
                    <span>Official stores</span>
                    <Link href="/vendors" onClick={close} className="text-[var(--accent)]">
                      See all
                    </Link>
                  </div>
                  {(data?.vendors ?? []).length === 0 ? (
                    <p className="py-8 text-center text-sm text-[var(--muted)]">
                      Loading stores…
                    </p>
                  ) : (
                    (data?.vendors ?? []).map((vendor) => (
                      <Link
                        key={vendor.slug}
                        href={`/vendors/${vendor.slug}`}
                        onClick={close}
                        className="mb-1.5 flex min-h-[72px] items-center gap-4 rounded bg-white px-3 text-left shadow-sm ring-1 ring-black/5"
                      >
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Store size={22} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-semibold">
                            {vendor.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
                            {vendor.headline || `${vendor.activeProducts} products`}
                          </span>
                        </span>
                        <ChevronRight size={22} className="shrink-0 text-[var(--muted)]" />
                      </Link>
                    ))
                  )}
                </>
              ) : null}

              {activeTab === "Tools" ? (
                <>
                  {[
                    {
                      label: "Request a product",
                      href: "/request-product",
                      icon: PackageSearch,
                      image: undefined as string | undefined,
                    },
                    {
                      label: "Track your order",
                      href: "/track-order",
                      icon: Truck,
                      image: undefined,
                    },
                    {
                      label: "Official stores",
                      href: "/vendors",
                      icon: Store,
                      image: undefined,
                    },
                    {
                      label: "Sell on SuperTech",
                      href: "/become-vendor",
                      icon: Tags,
                      image: undefined,
                    },
                  ].map((item) => (
                    <MenuRow key={item.label} item={item} boxed onNavigate={close} />
                  ))}
                </>
              ) : null}

              {activeTab === "Deals" ? (
                <>
                  {[
                    {
                      label: "All catalog deals",
                      href: "/catalog",
                      icon: Tags,
                    },
                    {
                      label: "Flash sale picks",
                      href: "/#flash-sale",
                      icon: Sparkles,
                    },
                    {
                      label: "Mobile essentials",
                      href: "/catalog?category=Mobile+Essentials",
                      icon: Smartphone,
                    },
                    {
                      label: "Beauty & personal care",
                      href: "/catalog?category=Beauty+%26+Personal+Care",
                      icon: Sparkles,
                    },
                  ].map((item) => (
                    <MenuRow key={item.label} item={item} boxed onNavigate={close} />
                  ))}
                </>
              ) : null}

              <div className="mt-8 space-y-2 bg-white p-4 text-sm shadow-sm">
                <p className="text-lg font-bold text-[var(--foreground)]">SuperTech advantage</p>
                <p className="font-medium text-[var(--muted)]">
                  Verified sellers, product requests, and trackable orders across the marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ShortcutPills({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="relative mb-3 -mr-3 overflow-hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 pr-8">
        {[
          { label: "Flash deals", href: "/#flash-sale", icon: Sparkles },
          { label: "Request", href: "/request-product", icon: PackageSearch },
          { label: "Track order", href: "/track-order", icon: Clock3 },
          { label: "Stores", href: "/vendors", icon: Store },
        ].map((pill) => {
          const Icon = pill.icon;
          return (
            <Link
              key={pill.label}
              href={pill.href}
              onClick={onNavigate}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-[#7d8794] bg-white px-3 py-1 text-sm font-bold text-[var(--foreground)] shadow-sm"
            >
              <Icon size={15} />
              {pill.label}
            </Link>
          );
        })}
      </div>
      <span className="pointer-events-none absolute bottom-1 right-0 top-0 w-10 bg-gradient-to-l from-[#f2f2f2] to-transparent" />
    </div>
  );
}

function DepartmentPanel({
  department,
  onBack,
  onNavigate,
}: {
  department: MenuItem;
  onBack: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[var(--muted)]"
      >
        <ArrowLeft size={13} /> Back
      </button>
      <h2 className="mb-5 text-[22px] font-normal leading-none text-black sm:text-[25px]">
        {department.label}
      </h2>
      {(department.children ?? []).map((item) => (
        <MenuRow key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function MenuRow({
  item,
  boxed = false,
  onNavigate,
  onOpenChildren,
}: {
  item: MenuItem;
  boxed?: boolean;
  onNavigate?: () => void;
  onOpenChildren?: (item: MenuItem) => void;
}) {
  const Icon = item.icon;
  const content = (
    <>
      <span
        className={cn(
          "relative grid h-14 w-16 shrink-0 place-items-center overflow-hidden",
          boxed
            ? "rounded border border-[var(--accent)]/40 bg-white text-[var(--accent)]"
            : "text-[var(--foreground)]",
        )}
      >
        {item.image ? (
          <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" />
        ) : (
          <Icon size={24} strokeWidth={1.75} />
        )}
        {boxed ? (
          <span className="absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-br bg-white/90 text-[var(--accent)]">
            <Icon size={13} strokeWidth={2} />
          </span>
        ) : null}
      </span>
      <span className="flex-1 text-left text-base font-medium sm:text-lg">{item.label}</span>
      <ChevronRight size={24} className="shrink-0 text-[var(--foreground)]" />
    </>
  );

  if (item.children?.length && onOpenChildren) {
    return (
      <button
        type="button"
        onClick={() => onOpenChildren(item)}
        className="mb-1.5 flex min-h-[72px] w-full items-center gap-4 rounded bg-white px-3 text-left shadow-sm ring-1 ring-black/5"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="mb-1.5 flex min-h-[72px] items-center gap-4 rounded bg-white px-3 shadow-sm ring-1 ring-black/5"
    >
      {content}
    </Link>
  );
}
