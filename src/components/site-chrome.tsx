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
  const isAppShell = pathname === "/app" || pathname.startsWith("/app/");

  if (isAppShell) {
    return <main className="min-h-screen flex-1">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      {footer}
      {mobileNav}
      {support}
    </>
  );
}
