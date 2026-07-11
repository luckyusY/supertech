"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaHref: string;
  badge: string;
  chips?: readonly string[];
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
};

const fallbackSlides: HeroSlide[] = [
  {
    title: "Flash deals across SuperTech.",
    subtitle: "Shop verified sellers across tech, beauty, wellness, and home essentials.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&h=600&fit=crop&q=80",
    ctaText: "Shop flash sale",
    ctaHref: "#flash-sale",
    badge: "Marketplace savings",
    chips: ["Verified sellers", "Fast requests", "Live deals"],
  },
];

type HeroSliderProps = {
  slides: readonly HeroSlide[];
  /** When false, stats live in TrustStrip below hero (preferred). */
  showInlineStats?: boolean;
};

export function HeroSlider({ slides, showInlineStats = false }: HeroSliderProps) {
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const safeCurrent = current % activeSlides.length;

  const goToSlide = useCallback(
    (index: number) => {
      const nextIndex = (index + activeSlides.length) % activeSlides.length;
      if (nextIndex === safeCurrent) return;
      setIsTransitioning(true);
      window.setTimeout(() => {
        setCurrent(nextIndex);
        setIsTransitioning(false);
      }, 280);
    },
    [activeSlides.length, safeCurrent],
  );

  useEffect(() => {
    if (paused || activeSlides.length < 2) return;
    const interval = window.setInterval(() => {
      goToSlide(safeCurrent + 1);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [goToSlide, safeCurrent, paused, activeSlides.length]);

  const slide = activeSlides[safeCurrent] ?? activeSlides[0];

  return (
    <div
      className="relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--elevation-2)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="relative h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[420px]">
        {activeSlides.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: index === safeCurrent ? 1 : 0 }}
            aria-hidden={index !== safeCurrent}
          >
            <Image
              src={item.image}
              alt=""
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/42 to-black/12" />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5 sm:px-7 sm:py-6 lg:px-9">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" />
              {slide.badge}
            </span>
            {activeSlides.length > 1 ? (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm"
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            ) : null}
          </div>

          <div className="max-w-xl">
            <h1
              className={`max-w-[19rem] text-2xl font-black leading-[1.08] text-white transition-all duration-300 sm:max-w-xl sm:text-4xl lg:text-5xl ${
                isTransitioning ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {slide.title}
            </h1>
            <p
              className={`mt-3 max-w-md text-sm leading-6 text-white/88 transition-all delay-75 duration-300 sm:text-base ${
                isTransitioning ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {slide.subtitle}
            </p>
            {slide.chips && slide.chips.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {slide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-[var(--radius-sm)] border border-white/16 bg-white/12 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
            <div
              className={`mt-5 flex flex-wrap gap-3 transition-all delay-100 duration-300 ${
                isTransitioning ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
              >
                {slide.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={slide.secondaryCtaHref ?? "/vendors"}
                className="hidden items-center gap-2 rounded-[var(--radius-sm)] border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:inline-flex"
              >
                {slide.secondaryCtaText ?? "Browse sellers"}
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {showInlineStats ? <div className="flex-1" /> : <div className="flex-1" />}
            <div className="flex items-center gap-3">
              <div className="flex gap-2" role="tablist" aria-label="Hero slides">
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={index === safeCurrent}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === safeCurrent
                        ? "w-8 bg-[var(--accent)]"
                        : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="hidden gap-1.5 sm:flex">
                <button
                  type="button"
                  onClick={() => goToSlide(safeCurrent - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToSlide(safeCurrent + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
