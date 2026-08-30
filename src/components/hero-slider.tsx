"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type HeroSlide = {
  label?: string;
  brand: string;
  title: string;
  body: string;
  priceLine?: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  mobileImage: string;
  tone?: "dark" | "light";
  copyPosition?: "left" | "center";
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <section className="hero-swiper relative isolate h-[31rem] w-full overflow-hidden border-b border-white/10 bg-[#151515] sm:h-[29rem] lg:h-[32rem]">
      {/* Global Brand Background (Desktop) */}
      <div className="absolute inset-0 hidden opacity-55 sm:block">
        <Image
          src="/banners/hero-brand-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* Global Brand Background (Mobile) */}
      <div className="absolute inset-0 opacity-45 sm:hidden">
        <Image
          src="/banners/hero-brand-bg-mobile.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,15,15,0.96)_0%,rgba(15,15,15,0.82)_48%,rgba(15,15,15,0.28)_100%)]" />
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        loop={slides.length > 1}
        speed={650}
        autoplay={{
          delay: 7000,
          pauseOnMouseEnter: true,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
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
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-transparent">

      {/* Mobile Image Layer */}
      <div className="absolute right-[-2.5rem] top-6 z-0 flex h-[14rem] w-[14rem] justify-center sm:hidden">
        <div className="relative h-full w-full overflow-hidden rounded-l-[1.5rem] border border-white/10 shadow-2xl">
          <Image
            src={slide.mobileImage}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 250px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Layout */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[82rem] items-center px-5 sm:px-8 lg:px-12">
        
        {/* Left: Typography */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.65, 0.36, 1] }}
          className="flex h-full w-full max-w-[34rem] flex-col justify-end pb-12 pt-36 sm:w-[55%] sm:justify-center sm:pb-0 sm:pt-0 lg:w-[52%]"
        >
          {slide.label && (
            <div className="mb-4 flex w-fit items-center gap-1.5 rounded-[var(--radius-sm)] border border-white/15 bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3 w-3 text-[var(--accent)] sm:h-4 sm:w-4" />
              {slide.label}
            </div>
          )}

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f6a34c] sm:mb-3 sm:text-sm">
            {slide.brand}
          </p>

          <h2 className="mb-3 line-clamp-2 text-[2.35rem] font-bold leading-[1.02] text-white sm:mb-4 sm:text-5xl lg:text-[3.5rem]">
            {slide.title}
          </h2>

          <p className="mb-5 line-clamp-2 max-w-md text-sm font-medium leading-6 text-white/68 sm:mb-6 sm:line-clamp-3 sm:text-base">
            {slide.body}
          </p>

          {slide.priceLine && (
            <div className="mb-5 flex items-center gap-2.5 sm:mb-7 sm:gap-3">
              <span className="rounded-[var(--radius-sm)] border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-base">
                {slide.priceLine.split(' · ')[0]}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-white/50 uppercase">
                {slide.priceLine.split(' · ').slice(1).join(' · ')}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={slide.ctaHref}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[var(--accent-hover)] sm:h-12 sm:px-6"
            >
              {slide.ctaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/catalog"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-white/20 bg-white/8 px-4 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/14 sm:h-12"
            >
              Browse all
            </Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-white/55">
            <ShieldCheck className="h-4 w-4 text-[#f6a34c]" />
            Verified sellers and tracked orders
          </p>
        </motion.div>

        {/* Right: Floating Product Image (Desktop only) */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.65, 0.36, 1] }}
          className="hidden h-full w-[45%] items-center justify-end pl-8 sm:flex lg:w-[48%] lg:pl-16"
        >
          <div className="relative aspect-square h-[76%] max-h-[22rem] overflow-hidden rounded-[var(--radius-lg)] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:scale-[1.015]">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
