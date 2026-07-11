"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type CanvasZone = "storefront" | "auth" | "app" | "dashboard";

function resolveZone(pathname: string): CanvasZone {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname === "/app" || pathname.startsWith("/app/")) return "app";
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/become-vendor") ||
    pathname.startsWith("/password-recovery") ||
    pathname.startsWith("/reset-password")
  ) {
    return "auth";
  }
  return "storefront";
}

type CanvasLevels = {
  grain: number;
  glowBrand: number;
  glowCool: number;
  vignette: number;
};

const ZONE_BASE: Record<CanvasZone, CanvasLevels> = {
  storefront: { grain: 0.04, glowBrand: 0.12, glowCool: 0.04, vignette: 0.025 },
  auth: { grain: 0.03, glowBrand: 0.1, glowCool: 0.08, vignette: 0.02 },
  app: { grain: 0.018, glowBrand: 0.04, glowCool: 0.02, vignette: 0.01 },
  dashboard: { grain: 0.014, glowBrand: 0.02, glowCool: 0.015, vignette: 0.008 },
};

/**
 * Ambient site canvas — zone + scroll aware grain/glows.
 * Opacity only (Lenis-safe). Reduced motion keeps static zone levels.
 */
export function SiteCanvas() {
  const pathname = usePathname() || "/";
  const zone = useMemo(() => resolveZone(pathname), [pathname]);
  const [scrollT, setScrollT] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.canvas = zone;
  }, [zone]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (zone !== "storefront" || reduceMotion) {
      setScrollT(0);
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        const t = Math.min(1, Math.max(0, window.scrollY / max));
        setScrollT(t);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Lenis may own scroll — also listen to our exposed instance
    const lenis = (window as Window & { __lenis?: { on: (e: string, cb: () => void) => void; off: (e: string, cb: () => void) => void } }).__lenis;
    lenis?.on("scroll", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      lenis?.off("scroll", onScroll);
    };
  }, [zone, reduceMotion]);

  const base = ZONE_BASE[zone];
  // Storefront: fade atmosphere as user scrolls into product content
  const fade = zone === "storefront" && !reduceMotion ? 1 - scrollT * 0.55 : 1;
  const grain = base.grain * (0.55 + 0.45 * fade);
  const glowBrand = base.glowBrand * fade;
  const glowCool = base.glowCool * (0.7 + 0.3 * fade);
  const vignette = base.vignette * (0.8 + 0.2 * fade);
  const parallaxY = zone === "storefront" && !reduceMotion ? scrollT * 48 : 0;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
      data-canvas-root={zone}
    >
      {/* Base wash */}
      <div
        className="absolute inset-0 bg-[var(--canvas-base,var(--background))]"
        style={{ transition: "opacity 200ms ease" }}
      />

      {/* Brand glow */}
      <div
        className="absolute inset-0"
        style={{
          opacity: glowBrand,
          transform: `translate3d(0, ${parallaxY}px, 0)`,
          background:
            zone === "auth"
              ? "radial-gradient(ellipse 70% 55% at 12% 8%, var(--canvas-glow-brand), transparent 55%)"
              : "radial-gradient(ellipse 80% 50% at -5% -10%, var(--canvas-glow-brand), transparent 55%)",
          transition: "opacity 200ms ease",
        }}
      />

      {/* Cool balance glow */}
      <div
        className="absolute inset-0"
        style={{
          opacity: glowCool,
          transform: `translate3d(0, ${parallaxY * 0.5}px, 0)`,
          background:
            "radial-gradient(ellipse 60% 45% at 95% 90%, var(--canvas-glow-cool), transparent 50%)",
          transition: "opacity 200ms ease",
        }}
      />

      {/* Grain */}
      <div
        className={cn("absolute inset-0 mix-blend-multiply")}
        style={{
          opacity: grain,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
          transition: "opacity 200ms ease",
        }}
      />

      {/* Soft edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          opacity: vignette,
          background:
            "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 40%, var(--canvas-vignette) 100%)",
          transition: "opacity 200ms ease",
        }}
      />
    </div>
  );
}
