"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * Photo Factory–style hero slide model.
 * label = ribbon badge · brand = uppercase kicker · title = headline
 */
export type HeroSlide = {
  label?: string;
  brand: string;
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
  /** @deprecated prefer brand + label */
  badge?: string;
  /** @deprecated prefer body */
  subtitle?: string;
  chips?: readonly string[];
};

const fallbackSlides: HeroSlide[] = [
  {
    label: "Live now",
    brand: "SuperTech",
    title: "Flash deals from verified sellers.",
    body: "Shop tech, beauty, wellness, and home essentials with clear prices and trackable orders.",
    priceLine: "Request · Track · Pay with MoMo",
    ctaText: "Shop flash sale",
    ctaHref: "#flash-sale",
    image: "/banners/hero-flash-sale.jpg",
    tone: "dark",
  },
];

type HeroSliderProps = {
  slides: readonly HeroSlide[];
  layout?: "card" | "fullBleed";
};

/**
 * Full-bleed / card Swiper hero — Photo Factory pattern for SuperTech.
 */
export function HeroSlider({ slides, layout = "card" }: HeroSliderProps) {
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;
  const multi = activeSlides.length > 1;

  const shell =
    layout === "fullBleed"
      ? "hero-swiper hero-swiper--full relative isolate overflow-hidden border-b border-[var(--accent)] bg-[var(--background-strong)]"
      : "hero-swiper hero-swiper--card relative isolate h-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--background-strong)] shadow-[var(--elevation-2)]";

  const heightClass =
    layout === "fullBleed"
      ? "h-[280px] sm:h-[360px] lg:h-[376px]"
      : "h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]";

  return (
    <section className={shell}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        loop={multi}
        speed={650}
        autoplay={
          multi
            ? {
                delay: 7000,
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
  const center = slide.copyPosition === "center";
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0">
      <Image
        src={slide.image}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
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

      {/* Mobile bottom wash — Photo Factory */}
      <div
        className={
          dark
            ? "absolute inset-0 sm:hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.78)_68%)]"
            : "absolute inset-0 sm:hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.9)_64%)]"
        }
      />

      {/* Desktop left copy panel — Photo Factory */}
      <div
        className={
          center
            ? "absolute inset-y-0 left-[28%] hidden w-[44%] bg-white/78 sm:block"
            : dark
              ? "absolute inset-y-0 left-0 hidden w-[48%] bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.38),transparent)] sm:block"
              : "absolute inset-y-0 left-0 hidden w-[48%] bg-[linear-gradient(90deg,rgba(255,255,255,0.94),rgba(255,255,255,0.58),transparent)] sm:block"
        }
      />

      <div
        className={`absolute inset-0 z-10 flex items-end pb-12 sm:items-center sm:pb-0 ${
          center ? "justify-center sm:pl-[12%]" : ""
        }`}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.55 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.21, 0.65, 0.36, 1] }}
          className={`max-w-[20rem] sm:max-w-[27rem] ${
            center
              ? "flex flex-col items-center px-5 text-center"
              : "px-5 sm:px-0 sm:pl-[8%] lg:pl-[9%]"
          } ${dark ? "text-white" : "text-[var(--foreground)]"}`}
        >
          {slide.label ? (
            <span className="inline-block w-fit bg-[var(--accent)] px-4 py-1 text-[11px] font-black uppercase tracking-wide text-white [clip-path:polygon(0_0,100%_0,86%_50%,100%_100%,0_100%)] sm:px-5 sm:py-1.5">
              {slide.label}
            </span>
          ) : null}

          <p className="mt-2 text-base font-black uppercase tracking-wide sm:mt-3.5 sm:text-2xl">
            {slide.brand}
          </p>

          <h2 className="mt-1 text-[1.35rem] font-black leading-[1.05] tracking-[-0.02em] sm:mt-1.5 sm:text-[2.1rem] lg:text-[2.15rem]">
            {slide.title}
          </h2>

          {slide.body ? (
            <p
              className={`mt-2 hidden text-sm leading-6 sm:block sm:text-base ${
                dark ? "text-white/86" : "text-[var(--foreground)]/78"
              }`}
            >
              {slide.body}
            </p>
          ) : null}

          {slide.priceLine ? (
            <p
              className={`mt-1.5 text-[11px] font-bold sm:mt-2 sm:text-sm ${
                dark ? "text-white/84" : "text-[var(--foreground)]/75"
              }`}
            >
              {slide.priceLine}
            </p>
          ) : null}

          {slide.chips && slide.chips.length > 0 ? (
            <div className={`mt-3 flex flex-wrap gap-1.5 ${center ? "justify-center" : ""}`}>
              {slide.chips.map((chip) => (
                <span
                  key={chip}
                  className={`rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${
                    dark
                      ? "border-white/25 bg-white/10 text-white/90"
                      : "border-[var(--line)] bg-white/90 text-[var(--muted)]"
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          <div
            className={`mt-3 flex flex-wrap items-center gap-2.5 sm:mt-5 ${
              center ? "justify-center" : ""
            }`}
          >
            <Link
              href={slide.ctaHref}
              className="press inline-flex min-w-[7rem] items-center justify-center rounded-sm bg-[var(--accent)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_3px_0_rgba(0,0,0,0.18)] transition hover:bg-[var(--accent-hover)] sm:min-w-[13rem] sm:px-8 sm:py-3 sm:text-xs"
            >
              {slide.ctaText}
            </Link>
            {slide.secondaryCtaText && slide.secondaryCtaHref ? (
              <Link
                href={slide.secondaryCtaHref}
                className={`hidden rounded-sm border px-5 py-3 text-xs font-black uppercase tracking-wide sm:inline-flex ${
                  dark
                    ? "border-white/35 bg-white/10 text-white hover:bg-white/18"
                    : "border-[var(--line)] bg-white text-[var(--foreground)]"
                }`}
              >
                {slide.secondaryCtaText}
              </Link>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
