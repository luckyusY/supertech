import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-provider";
import { ChatProvider } from "@/components/chat-context";
import { LiveChat } from "@/components/live-chat";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderFallback } from "@/components/site-header-fallback";
import { SmoothScroll } from "@/components/smooth-scroll";
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
  title: {
    default: "SuperTech - Premium Tech Marketplace",
    template: "%s | SuperTech",
  },
  description:
    "Shop premium tech from verified sellers across East and West Africa. Home control, mobile, audio, gaming, and wearables delivered fast.",
  openGraph: {
    siteName: "SuperTech Marketplace",
    type: "website",
  },
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
      <body className="min-h-full">
        <CartProvider>
          <ChatProvider>
            <SmoothScroll />
            <div className="noise fixed inset-0 -z-10 opacity-40" />
            <div className="relative flex min-h-full flex-col">
              <Suspense fallback={<SiteHeaderFallback />}>
                <SiteHeader />
              </Suspense>
              <main className="flex-1 pb-20 sm:pb-0">{children}</main>
              <SiteFooter />
              <MobileBottomNav />
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
            <LiveChat />
          </ChatProvider>
        </CartProvider>
      </body>
    </html>
  );
}
