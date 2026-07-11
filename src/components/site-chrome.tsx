"use client";

import { usePathname } from "next/navigation";

type SiteChromeProps = {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  mobileNav: React.ReactNode;
  support: React.ReactNode;
};

export function SiteChrome({
  children,
  header,
  footer,
  mobileNav,
  support,
}: SiteChromeProps) {
  const pathname = usePathname();
  const isAppShell =
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (isAppShell) {
    return (
      <main id="main-content" className="min-h-screen flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      {header}
      <main id="main-content" className="flex-1 pb-20 sm:pb-0" tabIndex={-1}>
        {children}
      </main>
      {footer}
      {mobileNav}
      {support}
    </>
  );
}
