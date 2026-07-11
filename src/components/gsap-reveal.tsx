"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

let registered = false;

function ensureGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

type GsapRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger children with [data-reveal-item] */
  stagger?: number;
  y?: number;
  delay?: number;
  once?: boolean;
};

/**
 * GSAP + ScrollTrigger entrance. Respects prefers-reduced-motion.
 */
export function GsapReveal({
  children,
  className,
  stagger = 0.06,
  y = 28,
  delay = 0,
  once = true,
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    ensureGsapPlugins();

    const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
    const targets = items.length > 0 ? items : [el];

    gsap.set(targets, { opacity: 0, y, force3D: true });

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay,
      stagger: items.length > 0 ? stagger : 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });

    // Safety: never leave content invisible if ScrollTrigger mis-measures
    const fallback = window.setTimeout(() => {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
    }, 1800);

    return () => {
      window.clearTimeout(fallback);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, once, stagger, y]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

type GsapShelfMotionProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Subtle GSAP parallax/fade for merchandising shelves on scroll.
 */
export function GsapShelfMotion({ children, className }: GsapShelfMotionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    ensureGsapPlugins();

    const header = el.querySelector<HTMLElement>("[data-shelf-header]");
    const grid = el.querySelector<HTMLElement>("[data-shelf-grid]");

    // Header only — product cards use Framer Motion so we don't double-animate.
    const ctx = gsap.context(() => {
      if (header) {
        gsap.from(header, {
          opacity: 0,
          y: 16,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      }

      // Soft fade for the product track container (not individual cards)
      if (grid) {
        gsap.from(grid, {
          opacity: 0.35,
          y: 12,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 94%",
            toggleActions: "play none none none",
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
