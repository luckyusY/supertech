import Link from "next/link";
import { AuthStatusControls } from "@/components/auth-status-controls";
import { CartStatusLink } from "@/components/cart-status-link";
import { NotificationBell } from "@/components/notification-bell";

const navigation = [
  { href: "/catalog", label: "Catalog" },
  { href: "/vendors", label: "Vendors" },
  { href: "/cart", label: "Cart" },
  { href: "/track-order", label: "Track Order" },
  { href: "/phases", label: "Phases" },
];

export function SiteHeader() {
  return (
    <header className="page-shell sticky top-0 z-40 pt-4">
      <div className="soft-card flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--foreground)] text-sm font-semibold tracking-[0.2em] text-white">
            ST
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">
              SuperTech
            </p>
            <p className="text-base font-semibold tracking-[-0.04em]">
              Multivendor marketplace
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-[var(--line)] bg-white/70 p-1.5 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--foreground)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AuthStatusControls />
          <NotificationBell />
          <CartStatusLink />
          <Link
            href="/order"
            className="rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Order now
          </Link>
        </div>
      </div>
    </header>
  );
}
