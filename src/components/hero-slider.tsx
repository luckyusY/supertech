"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
    <section className="hero-swiper relative isolate overflow-hidden border-b border-[var(--line)] bg-zinc-950 h-[280px] sm:h-[360px] lg:h-[376px] w-full">
      {/* Global Brand Background */}
      <div className="absolute inset-0 opacity-80">
        <Image
          src="/banners/hero-brand-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />
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

import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

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
      <div className="absolute inset-x-0 top-0 h-[65%] sm:hidden">
        <Image
          src={slide.mobileImage}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Content Layout */}
      <div className="relative z-10 flex h-full w-full max-w-7xl mx-auto items-center px-5 sm:px-10 lg:px-16">
        
        {/* Left: Typography */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.65, 0.36, 1] }}
          className="w-full sm:w-[55%] lg:w-[50%] flex flex-col justify-end pb-8 sm:pb-0 sm:justify-center h-full pt-10 sm:pt-0"
        >
          {slide.label && (
            <div className="mb-4 flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-xl sm:px-4 sm:py-2 sm:text-xs">
              <Sparkles className="h-3 w-3 text-[var(--accent)] sm:h-4 sm:w-4" />
              {slide.label}
            </div>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)] sm:mb-3 sm:text-sm">
            {slide.brand}
          </p>

          <h2 className={`${caveat.className} text-[44px] sm:text-[64px] lg:text-[76px] font-bold tracking-tight text-white drop-shadow-md leading-[1.05] mb-3 sm:mb-4`}>
            {slide.title}
          </h2>

          <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm lg:text-base font-medium text-white/70 max-w-md leading-relaxed mb-5 sm:mb-6">
            {slide.body}
          </p>

          {slide.priceLine && (
            <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-7">
              <span className="rounded-lg bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
                {slide.priceLine.split(' · ')[0]}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-white/50 uppercase">
                {slide.priceLine.split(' · ').slice(1).join(' · ')}
              </span>
            </div>
          )}

          <Link
            href={slide.ctaHref}
            className="group relative inline-flex w-fit items-center justify-center gap-3 rounded-full bg-[var(--accent)] px-7 py-3 sm:px-9 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_-10px_var(--accent)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10">{slide.ctaText}</span>
            <ArrowRight className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Right: Floating Product Image (Desktop only) */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.65, 0.36, 1] }}
          className="hidden sm:flex w-[45%] lg:w-[50%] h-full items-center justify-end pl-8 lg:pl-16"
        >
          <div className="relative h-[80%] aspect-square max-h-[300px] lg:max-h-[340px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform transition-transform duration-700 hover:scale-[1.02]">
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
