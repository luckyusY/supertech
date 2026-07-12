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
    <section className="hero-swiper relative isolate overflow-hidden border-b border-[var(--line)] bg-white h-[280px] sm:h-[360px] lg:h-[376px] w-full">
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
  const dark = slide.tone !== "light";
  const reduceMotion = useReducedMotion();

  return (
    <div className={`absolute inset-0 ${dark ? "bg-black" : "bg-white"}`}>
      {/* Blurred background layer */}
      <Image
        src={slide.image}
        alt=""
        fill
        sizes="100vw"
        className="hidden object-cover object-center opacity-30 blur-2xl scale-110 sm:block"
      />
      <Image
        src={slide.mobileImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-30 blur-2xl scale-110 sm:hidden"
      />

      {/* Crisp contained foreground layer */}
      <Image
        src={slide.image}
        alt=""
        fill
        priority={priority}
        sizes="50vw"
        className="hidden object-contain object-[85%_center] sm:block"
      />
      <Image
        src={slide.mobileImage}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-contain object-top pb-24 sm:hidden"
      />
      <div
        className={`absolute inset-0 sm:hidden ${
          dark
            ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.74)_66%)]"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.88)_62%)]"
        }`}
      />
      <div
        className={`absolute inset-y-0 hidden w-[48%] sm:block ${
          slide.copyPosition === "center"
            ? "left-[32%] bg-white/72"
            : dark
              ? "left-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.74),rgba(0,0,0,0.34),transparent)]"
              : "left-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.58),transparent)]"
        }`}
      />

      <div
        className={`absolute inset-0 z-10 flex items-end pb-12 sm:items-center sm:pb-0 ${
          slide.copyPosition === "center" ? "justify-center sm:pl-[14%]" : ""
        }`}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.21, 0.65, 0.36, 1] }}
          className={`max-w-[340px] sm:max-w-[480px] ${
            slide.copyPosition === "center"
              ? "flex flex-col items-center px-5 text-center"
              : "px-5 sm:px-0 sm:pl-[10.5%]"
          } ${dark ? "text-white" : "text-black"}`}
        >
          {slide.label && (
            <span className={`mb-3 flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs ${dark ? "border-white/20 bg-white/10 text-white" : "border-black/10 bg-black/5 text-black"}`}>
              <Sparkles className="h-3 w-3 text-[var(--accent)] sm:h-3.5 sm:w-3.5" />
              {slide.label}
            </span>
          )}
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:mb-2 sm:text-sm">
            {slide.brand}
          </p>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-tight drop-shadow-sm sm:text-[42px] lg:text-[48px]">
            {slide.title}
          </h2>
          <p className={`mt-3 line-clamp-2 text-xs font-medium leading-relaxed drop-shadow-sm sm:mt-4 sm:line-clamp-none sm:text-base ${dark ? "text-white/80 sm:text-white/90" : "text-black/70 sm:text-black/80"}`}>
            {slide.body}
          </p>
          {slide.priceLine && (
            <div className="mt-3 flex items-center gap-2 sm:mt-4">
              <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm sm:px-3 sm:text-sm ${dark ? "bg-black/30 text-white/90" : "bg-white/50 text-black/90 shadow-sm"}`}>
                {slide.priceLine.split(' · ')[0]}
              </span>
              <span className={`text-[10px] font-medium tracking-wide sm:text-xs ${dark ? "text-white/60" : "text-black/50"}`}>
                {slide.priceLine.split(' · ').slice(1).join(' · ')}
              </span>
            </div>
          )}
          <Link
            href={slide.ctaHref}
            className="group press mt-5 inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-[var(--accent-hover)] hover:shadow-xl sm:mt-7 sm:px-8 sm:py-3.5 sm:text-xs"
          >
            {slide.ctaText}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
