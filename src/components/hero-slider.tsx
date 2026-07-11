"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Coins,
  ShieldCheck,
  Store,
  ThumbsUp,
  Truck,
  UserRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type HeroFeature = {
  title: string;
  icon: "coins" | "check" | "user" | "thumb" | "shield" | "truck" | "store" | "zap";
};

/**
 * Adorama-style campaign slide:
 * left copy · mid feature grid · right lifestyle image
 */
export type HeroSlide = {
  label?: string;
  brand: string;
  /** Optional gold-highlighted word rendered after brand line */
  accentWord?: string;
  title: string;
  body: string;
  priceLine?: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  mobileImage?: string;
  tone?: "dark" | "light";
  copyPosition?: "left" | "center";
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  features?: HeroFeature[];
  badge?: string;
  subtitle?: string;
  chips?: readonly string[];
};

const FEATURE_ICONS: Record<HeroFeature["icon"], LucideIcon> = {
  coins: Coins,
  check: BadgeCheck,
  user: UserRound,
  thumb: ThumbsUp,
  shield: ShieldCheck,
  truck: Truck,
  store: Store,
  zap: Zap,
};

const fallbackSlides: HeroSlide[] = [
  {
    brand: "SuperTech",
    accentWord: "Marketplace",
    title: "Verified sellers. Trackable orders.",
    body: "Shop tech, beauty, and home essentials — request what you need and track every step.",
    ctaText: "Shop flash sale",
    ctaHref: "#flash-sale",
    image: "/banners/hero-flash-sale.jpg",
    tone: "dark",
    features: [
      { title: "Verified sellers", icon: "shield" },
      { title: "Request products", icon: "check" },
      { title: "Track every order", icon: "truck" },
      { title: "Official stores", icon: "store" },
    ],
  },
];

type HeroSliderProps = {
  slides: readonly HeroSlide[];
  layout?: "card" | "fullBleed";
};

/**
 * Adorama-inspired full-bleed hero carousel for SuperTech.
 */
export function HeroSlider({ slides, layout = "fullBleed" }: HeroSliderProps) {
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;
  const multi = activeSlides.length > 1;

  const shell =
    layout === "fullBleed"
      ? "hero-swiper hero-swiper--adorama relative isolate overflow-hidden bg-[#0a0f1a]"
      : "hero-swiper hero-swiper--card relative isolate h-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[#0a0f1a] shadow-[var(--elevation-2)]";

  const heightClass =
    layout === "fullBleed"
      ? "h-[320px] sm:h-[380px] lg:h-[420px]"
      : "h-full min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]";

  return (
    <section className={shell}>
      {/* Gold accent line under nav like Adorama */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent" />
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        loop={multi}
        speed={700}
        autoplay={
          multi
            ? {
                delay: 7500,
                pauseOnMouseEnter: true,
                disableOnInteraction: false,
              }
            : false
        }
        navigation={multi}
        pagination={multi ? { clickable: true } : false}
        className={heightClass}
      >
        {activeSlides.map((slide, index) => (
          <SwiperSlide key={`${slide.brand}-${slide.title}-${index}`}>
            <SlideContent slide={normalizeSlide(slide)} priority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

function normalizeSlide(slide: HeroSlide): HeroSlide {
  return {
    ...slide,
    brand: slide.brand || slide.badge || "SuperTech",
    body: slide.body || slide.subtitle || "",
    label: slide.label || slide.badge,
    tone: slide.tone ?? "dark",
    copyPosition: slide.copyPosition ?? "left",
  };
}

function SlideContent({
  slide,
  priority,
}: {
  slide: HeroSlide;
  priority: boolean;
}) {
  const dark = slide.tone !== "light";
  const reduceMotion = useReducedMotion();
  const features = slide.features?.slice(0, 4) ?? [];

  return (
    <div className="absolute inset-0">
      {/* Background lifestyle / product image — right-weighted like Adorama */}
      <Image
        src={slide.image}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-[70%_center] sm:object-right"
      />

      {/* Dark cinematic overlay */}
      <div
        className={
          dark
            ? "absolute inset-0 bg-[linear-gradient(105deg,rgba(6,10,18,0.96)_0%,rgba(6,10,18,0.88)_34%,rgba(6,10,18,0.45)_62%,rgba(6,10,18,0.2)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.75)_40%,transparent_75%)]"
        }
      />
      {/* Gold edge frame accents */}
      <div className="pointer-events-none absolute inset-y-6 left-0 hidden w-px bg-gradient-to-b from-transparent via-[var(--gold)]/50 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />

      <div className="absolute inset-0 z-10 flex items-end px-5 pb-12 pt-6 sm:items-center sm:px-8 sm:pb-0 lg:px-12 xl:px-16">
        <div className="grid w-full max-w-[1400px] items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,0.9fr)] lg:gap-8">
          {/* Left copy */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.21, 0.65, 0.36, 1] }}
            className={`max-w-md ${dark ? "text-white" : "text-[var(--foreground)]"}`}
          >
            {slide.label ? (
              <span className="inline-block rounded-sm border border-[var(--gold)]/50 bg-[var(--gold)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                {slide.label}
              </span>
            ) : null}

            <h2 className="mt-3 text-[1.75rem] font-black leading-[1.05] tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem]">
              <span className="block">{slide.brand}</span>
              {slide.accentWord ? (
                <span className="block text-[var(--gold)]">{slide.accentWord}</span>
              ) : null}
            </h2>

            <p
              className={`mt-2 text-base font-semibold leading-snug sm:mt-3 sm:text-xl ${
                dark ? "text-white/95" : "text-[var(--foreground)]"
              }`}
            >
              {slide.title}
            </p>

            {slide.body ? (
              <p
                className={`mt-2 max-w-sm text-sm leading-6 sm:mt-3 sm:text-[15px] ${
                  dark ? "text-white/75" : "text-[var(--muted)]"
                }`}
              >
                {slide.body}
              </p>
            ) : null}

            {slide.priceLine ? (
              <p className="mt-2 text-xs font-bold text-[var(--gold)] sm:text-sm">
                {slide.priceLine}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6">
              <Link
                href={slide.ctaHref}
                className="inline-flex min-w-[8.5rem] items-center justify-center rounded-md bg-[var(--gold)] px-6 py-2.5 text-xs font-black uppercase tracking-wide text-[#15110a] shadow-[0_4px_0_rgba(0,0,0,0.25)] transition hover:brightness-105 sm:min-w-[11rem] sm:px-8 sm:py-3 sm:text-sm"
              >
                {slide.ctaText}
              </Link>
              {slide.secondaryCtaText && slide.secondaryCtaHref ? (
                <Link
                  href={slide.secondaryCtaHref}
                  className={`hidden rounded-md border px-5 py-2.5 text-xs font-bold uppercase tracking-wide sm:inline-flex sm:py-3 ${
                    dark
                      ? "border-white/30 bg-white/5 text-white hover:bg-white/10"
                      : "border-[var(--line)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  {slide.secondaryCtaText}
                </Link>
              ) : null}
            </div>
          </motion.div>

          {/* Mid: Adorama-style 2×2 feature cards */}
          {features.length > 0 ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.21, 0.65, 0.36, 1] }}
              className="hidden grid-cols-2 gap-2.5 lg:grid"
            >
              {features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <div
                    key={feature.title}
                    className="flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-md border border-[var(--gold)]/55 bg-black/35 px-3 py-4 text-center backdrop-blur-[2px]"
                  >
                    <Icon className="h-7 w-7 text-[var(--gold)]" strokeWidth={1.6} />
                    <p className="text-[13px] font-semibold leading-snug text-white">
                      {feature.title}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div className="hidden lg:block" />
          )}

          {/* Right column keeps photo visible — decorative gold frame on xl */}
          <div className="pointer-events-none relative hidden h-full min-h-[220px] lg:block">
            <div className="absolute inset-y-8 right-0 w-[2px] bg-gradient-to-b from-transparent via-[var(--gold)]/40 to-transparent" />
          </div>
        </div>
      </div>

      {/* Mobile feature chips under copy space */}
      {features.length > 0 ? (
        <div className="absolute inset-x-0 bottom-10 z-10 flex gap-1.5 overflow-x-auto px-5 pb-1 lg:hidden">
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon];
            return (
              <span
                key={feature.title}
                className="inline-flex shrink-0 items-center gap-1.5 rounded border border-[var(--gold)]/40 bg-black/45 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--gold)]" />
                {feature.title}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
