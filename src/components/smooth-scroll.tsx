"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

let gsapPluginsReady = false;

function ensureScrollTrigger() {
  if (gsapPluginsReady || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsapPluginsReady = true;
}

/**
 * Site-wide Lenis smooth scrolling, synced with GSAP ScrollTrigger.
 * Disabled when the user prefers reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      document.documentElement.classList.add("lenis-stopped");
      return;
    }

    ensureScrollTrigger();

    const lenis = new Lenis({
      // Slightly snappy marketplace feel (not syrupy)
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.15,
      infinite: false,
      autoRaf: false,
      anchors: true,
      // Prevent fighting nested scroll areas (drawers, shelves, Swiper)
      prevent: (node: HTMLElement) =>
        Boolean(
          node.closest(
            ".swiper, .swiper-wrapper, [data-lenis-prevent], [data-scroll-lock], .scroll-x, [data-shelf-grid]",
          ),
        ),
    });

    lenisRef.current = lenis;

    document.documentElement.classList.add("lenis", "lenis-smooth");
    document.documentElement.classList.remove("lenis-stopped");

    // Keep ScrollTrigger measurements correct while Lenis owns the scroll
    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time: number) => {
      // GSAP ticker time is in seconds
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Recalculate after layout / fonts / images settle
    const refresh = () => ScrollTrigger.refresh();
    const refreshTimer = window.setTimeout(refresh, 400);
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);

    // Expose for optional debugging / deep-links
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      ScrollTrigger.refresh();
      lenisRef.current = null;
    };
  }, []);

  // Handle scroll to top on navigation
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
