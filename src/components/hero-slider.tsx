"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  ctaText: string;
  ctaHref: string;
  badge: string;
  chips?: readonly string[];
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  tone?: "dark" | "light";
};

const fallbackSlides: HeroSlide[] = [
  {
    title: "Flash deals across SuperTech.",
    subtitle: "Shop verified sellers across tech, beauty, wellness, and home essentials.",
    image: "/banners/flash-sale-campaign.png",
    ctaText: "Shop flash sale",
    ctaHref: "#flash-sale",
    badge: "Marketplace savings",
    chips: ["Verified sellers", "Fast requests", "Live deals"],
    tone: "dark",
  },
];

type HeroSliderProps = {
  slides: readonly HeroSlide[];
};

type HeroSliderLayout = "card" | "fullBleed";

/**
 * Full-bleed Swiper hero — Photo Factory pattern adapted to SuperTech brand.
 * fullBleed: edge-to-edge mobile (no radius). card: framed desktop triad.
 */
export function HeroSlider({
  slides,
  layout = "card",
}: HeroSliderProps & { layout?: HeroSliderLayout }) {
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;
  const shell =
    layout === "fullBleed"
      ? "hero-swiper relative isolate h-full min-h-[280px] overflow-hidden border-b border-[var(--line)] bg-[var(--background-strong)] sm:min-h-[340px]"
      : "hero-swiper relative isolate h-full min-h-[280px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--background-strong)] shadow-[var(--elevation-2)] sm:min-h-[360px] lg:min-h-[420px]";

  return (
    <section className={shell}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        loop={activeSlides.length > 1}
        speed={650}
        autoplay={
          activeSlides.length > 1
            ? {
                delay: 6500,
                pauseOnMouseEnter: true,
                disableOnInteraction: false,
              }
            : false
        }
        navigation={activeSlides.length > 1}
        pagination={activeSlides.length > 1 ? { clickable: true } : false}
        className={
          layout === "fullBleed"
            ? "h-full min-h-[280px] sm:min-h-[340px]"
            : "h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]"
        }
      >
        {activeSlides.map((slide, index) => (
          <SwiperSlide key={`${slide.title}-${index}`}>
            <SlideContent slide={slide} priority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
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

  return (
    <div className="absolute inset-0">
      <Image
        src={slide.image}
        alt=""
        fill
        priority={priority}
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="hidden object-cover object-center sm:block"
      />
      <Image
        src={slide.mobileImage ?? slide.image}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center sm:hidden"
      />
      {/* Mobile bottom gradient (PF) */}
      <div
        className={
          dark
            ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.74)_66%)] sm:bg-[linear-gradient(105deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.18)_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.88)_62%)] sm:bg-[linear-gradient(105deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.55)_50%,transparent_100%)]"
        }
      />

      <div className="absolute inset-0 z-10 flex items-end px-5 pb-12 pt-6 sm:items-center sm:px-8 sm:pb-0 lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.5, ease: [0.21, 0.65, 0.36, 1] }}
          className={`max-w-[20rem] sm:max-w-md ${dark ? "text-white" : "text-[var(--foreground)]"}`}
        >
          <span
            className="inline-flex items-center gap-1.5 bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]"
            style={{ clipPath: "polygon(0 0, 100% 0, 92% 50%, 100% 100%, 0 100%)" }}
          >
            <ShieldCheck className="h-3 w-3" />
            {slide.badge}
          </span>
          <h1 className="mt-3 text-[1.45rem] font-bold leading-[1.08] tracking-[-0.03em] sm:mt-4 sm:text-4xl lg:text-[2.65rem]">
            {slide.title}
          </h1>
          <p
            className={`mt-2 text-sm leading-6 sm:mt-3 sm:text-base ${
              dark ? "text-white/88" : "text-[var(--muted)]"
            }`}
          >
            {slide.subtitle}
          </p>
          {slide.chips && slide.chips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {slide.chips.map((chip) => (
                <span
                  key={chip}
                  className={`rounded-[var(--radius-sm)] border px-2 py-0.5 text-[11px] font-semibold ${
                    dark
                      ? "border-white/20 bg-white/10 text-white/90"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5">
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-[0_3px_0_rgba(0,0,0,0.15)] hover:bg-[var(--accent-hover)] sm:px-6 sm:py-3 sm:text-sm"
            >
              {slide.ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={slide.secondaryCtaHref ?? "/vendors"}
              className={`hidden items-center gap-2 rounded-[var(--radius-sm)] border px-5 py-3 text-sm font-bold sm:inline-flex ${
                dark
                  ? "border-white/35 bg-white/10 text-white hover:bg-white/18"
                  : "border-[var(--line)] bg-white text-[var(--foreground)]"
              }`}
            >
              {slide.secondaryCtaText ?? "Browse sellers"}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
