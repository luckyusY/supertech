import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Catalog", href: "/catalog" },
      { label: "Blog", href: "/blog" },
      { label: "Request product", href: "/request-product" },
      { label: "Track order", href: "/track-order" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Official stores", href: "/vendors" },
      { label: "Sell on SuperTech", href: "/become-vendor" },
      { label: "Roadmap", href: "/phases" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Account", href: "/account" },
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/share/1HzbNfDRWe/" },
  { label: "Instagram", href: "https://www.instagram.com/supertech_africanmarket" },
  { label: "TikTok", href: "https://www.tiktok.com/@superstore100" },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 bg-[#252527] text-white">
      <div className="page-shell py-8 pb-24 sm:pb-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="SuperTech logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-md bg-white object-contain"
              />
              <div>
                <p className="text-sm font-black tracking-[-0.03em]">SuperTech</p>
                <p className="text-xs text-white/55">African marketplace</p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/62">
              Verified products across tech, beauty, and wellness, with ordering
              support for customers and sellers across Africa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Shop now
              </Link>
              <Link
                href="/request-product"
                className="rounded-md border border-white/14 px-4 py-2 text-sm font-semibold text-white"
              >
                Request item
              </Link>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/72 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Social
            </p>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/72 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/password-recovery"
              className="mt-5 inline-flex text-sm font-semibold text-[var(--accent)] hover:text-white"
            >
              Recover password
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} SuperTech Marketplace. All rights reserved.</p>
          <p>Built for fast shopping and trusted seller support.</p>
        </div>
      </div>
    </footer>
  );
}
