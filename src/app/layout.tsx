import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-provider";
import { AiSupportWidget } from "@/components/ai-support-widget";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderFallback } from "@/components/site-header-fallback";
import { SmoothScroll } from "@/components/smooth-scroll";
import { NativeAppBridge } from "@/components/native-app-bridge";
import { getAppUrl, getAbsoluteUrl } from "@/lib/site-url";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getAppUrl(),
  title: {
    default: "SuperTech - Premium Tech Marketplace",
    template: "%s | SuperTech",
  },
  description:
    "Shop premium tech from verified sellers across East and West Africa. Home control, mobile, audio, gaming, and wearables delivered fast.",
  openGraph: {
    siteName: "SuperTech Marketplace",
    type: "website",
    images: [
      {
        url: getAbsoluteUrl("/logo.png"),
        width: 512,
        height: 512,
        alt: "SuperTech Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [getAbsoluteUrl("/logo.png")],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SuperTech",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f68b1e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full transition-colors duration-300">
        <CartProvider>
          <PwaRegister />
          <SmoothScroll />
          <NativeAppBridge />
          {/* Canvas layer 1 — warm grain texture */}
          <div className="fixed inset-0 -z-10 opacity-[0.028]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "180px 180px",
            }}
          />
          {/* Canvas layer 2 — top-left warm radial ambient glow */}
          <div className="fixed inset-0 -z-10 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 50% at -5% -10%, rgba(245,131,12,0.07), transparent)"
            }}
          />
          <div className="relative flex min-h-full flex-col">
            <SiteChrome
              header={
                <Suspense fallback={<SiteHeaderFallback />}>
                  <SiteHeader />
                </Suspense>
              }
              footer={<SiteFooter />}
              mobileNav={<MobileBottomNav />}
              support={<AiSupportWidget />}
            >
              {children}
            </SiteChrome>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-space-grotesk)",
                borderRadius: "1rem",
                border: "1px solid rgba(15,23,42,0.12)",
                background: "rgba(255,252,246,0.95)",
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
