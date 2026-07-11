"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Photo Factory pattern: hide header on scroll down, reveal on scroll up.
 */
export function HeaderScrollShell({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      if (currentY < 28) {
        setHidden(false);
      } else if (delta > 10) {
        setHidden(true);
      } else if (delta < -10) {
        setHidden(false);
      }
      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const lenis = (
      window as Window & {
        __lenis?: { on: (e: string, cb: () => void) => void; off: (e: string, cb: () => void) => void };
      }
    ).__lenis;
    lenis?.on("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      lenis?.off("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-[var(--z-header)] transition-transform duration-300 ease-out will-change-transform",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      {children}
    </div>
  );
}
