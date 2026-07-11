import Link from "next/link";
import Image from "next/image";
import { CircleHelp, MessageCircle, Phone, User } from "lucide-react";
import { CartStatusLink } from "@/components/cart-status-link";
import { HeaderSearch } from "@/components/header-search";
import {
  DEFAULT_VENDOR_WHATSAPP_NUMBER,
  getWhatsAppHref,
} from "@/lib/whatsapp";

const SUPPORT_PHONE_TEL = "+250783998231";
const SUPPORT_WHATSAPP = getWhatsAppHref(
  DEFAULT_VENDOR_WHATSAPP_NUMBER,
  "Hello SuperTech, I need help shopping on the marketplace.",
);

/**
 * Streaming fallback — Photo Factory mobile chrome without session fetch.
 */
export async function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-[var(--z-header)]">
      <div className="bg-[var(--background-strong)] px-2 py-0.5 text-center text-[11px] font-black leading-[18px] text-white sm:px-4">
        <span className="text-[var(--gold)]">Verified sellers</span>
        {" · "}
        Request · Track · Sell
      </div>

      <div className="bg-[var(--background-strong)] text-white">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 py-1.5 sm:gap-4 sm:px-4">
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

          <HeaderSearch variant="mobile" />
          <HeaderSearch variant="desktop" />

          <div className="flex items-center gap-3 sm:hidden">
            <a href={`tel:${SUPPORT_PHONE_TEL}`} aria-label="Call support">
              <Phone aria-hidden size={22} />
            </a>
            <a
              href={SUPPORT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp support"
            >
              <MessageCircle aria-hidden size={23} />
            </a>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/55 bg-white px-3 text-sm font-semibold text-[var(--foreground)]"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <Link
              href="/track-order"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 text-sm font-semibold text-white"
            >
              <CircleHelp className="h-4 w-4" />
              Help
            </Link>
            <CartStatusLink />
          </div>
        </div>
      </div>
    </header>
  );
}
