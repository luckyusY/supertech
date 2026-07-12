import Link from "next/link";
import Image from "next/image";
import { CircleHelp, MessageCircle, Phone, ShieldCheck, User } from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { HeaderScrollShell } from "@/components/header-scroll-shell";
import { HeaderSearch } from "@/components/header-search";
import { DesktopCategoryNav } from "@/components/desktop-category-nav";
import { UserMenu } from "@/components/user-menu";
import { getAuthSession } from "@/lib/auth";
import { getPublicCategories } from "@/lib/public-marketplace";
import {
  DEFAULT_VENDOR_WHATSAPP_NUMBER,
  getWhatsAppHref,
} from "@/lib/whatsapp";

const helpLinks = [
  { label: "Track order", href: "/track-order" },
  { label: "Request a product", href: "/request-product" },
  { label: "Official stores", href: "/vendors" },
  { label: "Privacy policy", href: "/privacy" },
] as const;

const SUPPORT_PHONE_DISPLAY = "+250 783 998 231";
const SUPPORT_PHONE_TEL = "+250783998231";
const SUPPORT_WHATSAPP = getWhatsAppHref(
  DEFAULT_VENDOR_WHATSAPP_NUMBER,
  "Hello SuperTech, I need help shopping on the marketplace.",
);

/**
 * Photo Factory mobile header pattern:
 * promo → dark primary row [logo | search | phone | WhatsApp]
 * Categories open from bottom Browse sheet, not a header hamburger.
 */
export async function SiteHeader() {
  const [session, categories] = await Promise.all([
    getAuthSession().catch(() => null),
    getPublicCategories().catch(() => ["All"]),
  ]);
  const headerCategories = categories.filter((category) => category !== "All");

  return (
    <HeaderScrollShell>
      <header>
        {/* Promo strip */}
        <div className="bg-[var(--background-strong)] px-2 py-0.5 text-center text-[11px] font-black leading-[18px] text-white sm:px-4">
          <span className="text-[var(--gold)]">Verified sellers</span>
          {" · "}
          Request missing products · Track every order{" "}
          <Link
            href="/become-vendor"
            className="text-[var(--gold)] underline-offset-2 hover:underline"
          >
            SELL
          </Link>
        </div>

        {/* Utility strip — desktop only (PF secondary bar) */}
        <div className="hidden border-y border-[var(--gold)]/25 bg-[#15110a] text-white sm:block">
          <div className="page-shell flex h-8 items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-wide">
            <div className="flex gap-5">
              <Link href="/vendors" className="hover:text-white">
                Official stores
              </Link>
              <Link href="/request-product" className="hover:text-white">
                Request product
              </Link>
              <Link href="/track-order" className="hover:text-white">
                Track order
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <a href={`tel:${SUPPORT_PHONE_TEL}`}>{SUPPORT_PHONE_DISPLAY}</a>
              <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                Buyer protection
              </span>
            </div>
          </div>
        </div>

        {/* Primary bar — PF mobile: logo | search | call/WA ; desktop keeps actions */}
        <div className="bg-[var(--background-strong)] text-white">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 py-1.5 sm:gap-4 sm:px-4 lg:px-6">
            <Link href="/" className="shrink-0" aria-label="SuperTech home">
              <Image
                src="/logo.png"
                alt="SuperTech"
                width={160}
                height={160}
                priority
                className="h-8 w-8 rounded-md bg-white object-contain sm:h-11 sm:w-11"
              />
            </Link>

            {/* Single search field — same row on mobile (PF) */}
            <HeaderSearch variant="mobile" />
            <HeaderSearch variant="desktop" />

            {/* Mobile contact icons — PF phone + WhatsApp (no cart/hamburger) */}
            <div className="flex items-center gap-3 sm:hidden">
              <a href={`tel:${SUPPORT_PHONE_TEL}`} aria-label="Call support">
                <Phone aria-hidden size={22} strokeWidth={1.75} />
              </a>
              <a
                href={SUPPORT_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp support"
              >
                <MessageCircle aria-hidden size={23} strokeWidth={1.75} />
              </a>
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 sm:flex">
              {session ? (
                <UserMenu
                  name={session.name}
                  role={session.role}
                  dashboardPath={session.dashboardPath}
                />
              ) : (
                <Link
                  href="/sign-in"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-sm hover:text-[var(--accent)]"
                >
                  <User className="h-4 w-4" />
                  Account
                </Link>
              )}

              <div className="group relative">
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 text-sm font-semibold text-white hover:bg-white/20"
                  aria-haspopup="menu"
                >
                  <CircleHelp className="h-4 w-4" />
                  Help
                </button>
                <div
                  role="menu"
                  className="invisible absolute right-0 top-full z-[var(--z-drawer)] mt-1.5 w-52 origin-top-right scale-95 rounded-[var(--radius-md)] border border-[var(--line)] bg-white py-1.5 opacity-0 shadow-[var(--elevation-3)] transition-all group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:visible group-hover:scale-100 group-hover:opacity-100"
                >
                  {helpLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className="block px-3.5 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <CartStatusLink />
            </div>
          </div>
        </div>

        {/* Desktop departments nav only */}
        <DesktopCategoryNav categories={headerCategories} />
      </header>
    </HeaderScrollShell>
  );
}
