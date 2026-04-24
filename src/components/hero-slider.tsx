"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

type StatIconKey = "package" | "shield" | "trending";

const statIcons: Record<StatIconKey, typeof Package> = {
  package: Package,
  shield: ShieldCheck,
  trending: TrendingUp,
};

type Stat = {
  iconKey: StatIconKey;
  value: string;
  label: string;
};

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaHref: string;
  badge: string;
  chips?: readonly string[];
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
  {
    title: "Beauty and wellness just landed.",
    subtitle: "Browse skincare, recovery, sleep, and daily routine essentials in dedicated shelves.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=600&fit=crop&q=80",
    ctaText: "Shop beauty",
    ctaHref: "/catalog?category=Beauty+%26+Personal+Care",
    badge: "New categories",
    chips: ["Beauty", "Wellness", "Personal care"],
  },
  {
    title: "Request it. Track it. Get updates.",
    subtitle: "Ask for products not yet listed and follow order requests from one marketplace flow.",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=600&fit=crop&q=80",
    ctaText: "Request product",
    ctaHref: "/request-product",
    badge: "Shopper tools",
    chips: ["Track order", "Request product", "Vendor support"],
  },
];

type HeroSliderProps = {
  stats: readonly Stat[];
  slides: readonly HeroSlide[];
};

export function HeroSlider({ stats, slides }: HeroSliderProps) {
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const safeCurrent = current % activeSlides.length;

  const goToSlide = useCallback((index: number) => {
    const nextIndex = (index + activeSlides.length) % activeSlides.length;

    if (nextIndex === safeCurrent) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(nextIndex);
      setIsTransitioning(false);
    }, 500);
  }, [activeSlides.length, safeCurrent]);

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide(safeCurrent + 1);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [goToSlide, safeCurrent]);

  function prevSlide() {
    goToSlide((current - 1 + activeSlides.length) % activeSlides.length);
  }

  function nextSlide() {
    goToSlide((current + 1) % activeSlides.length);
  }

  const slide = activeSlides[safeCurrent] ?? activeSlides[0];

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="relative h-full min-h-[420px] sm:min-h-[440px]">
        {activeSlides.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: index === safeCurrent ? 1 : 0 }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/48 to-black/10" />

        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5 sm:px-7 sm:py-6 lg:px-9">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3" />
              {slide.badge}
            </span>
          </div>

          <div className="max-w-xl">
            <h1
              className={`max-w-[19rem] text-2xl font-black leading-[1.08] text-white transition-all duration-500 sm:max-w-xl sm:text-5xl ${
                isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {slide.title}
            </h1>
            <p
              className={`mt-3 max-w-md text-sm leading-6 text-white/85 transition-all delay-100 duration-500 sm:text-base ${
                isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {slide.subtitle}
            </p>
            {slide.chips && slide.chips.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {slide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-white/16 bg-white/12 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
            <div
              className={`mt-6 flex flex-wrap gap-3 transition-all delay-200 duration-500 ${
                isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {slide.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vendors"
                className="hidden items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:inline-flex"
              >
                Browse sellers
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <dl className="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = statIcons[stat.iconKey];
                return (
                  <div
                    key={stat.label}
                    className="min-w-0 rounded-lg border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm sm:p-3"
                  >
                    <div className="flex min-w-0 items-center gap-1.5 text-white/70">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate text-[9px] uppercase tracking-[0.15em]">
                        {stat.label}
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-semibold text-white sm:text-2xl">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </dl>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === safeCurrent ? "w-8 bg-[var(--accent)]" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="hidden gap-1.5 sm:flex">
                <button
                  onClick={prevSlide}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
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
