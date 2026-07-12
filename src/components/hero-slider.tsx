"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
    <section className="hero-swiper relative isolate overflow-hidden border-b border-[var(--line)] bg-white">
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
        className="h-[280px] sm:h-[360px] lg:h-[376px] w-full"
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
        src={slide.mobileImage}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center sm:hidden"
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
          className={`max-w-[320px] sm:max-w-[430px] ${
            slide.copyPosition === "center"
              ? "flex flex-col items-center px-5 text-center"
              : "px-5 sm:px-0 sm:pl-[10.5%]"
          } ${dark ? "text-white" : "text-black"}`}
        >
          {slide.label && (
            <span className="inline-block w-fit bg-[var(--accent)] px-4 py-1 text-[11px] font-black uppercase tracking-wide text-white [clip-path:polygon(0_0,100%_0,84%_50%,100%_100%,0_100%)] sm:px-5 sm:py-1.5">
              {slide.label}
            </span>
          )}
          <p className="mt-2 text-lg font-black uppercase tracking-wide sm:mt-4 sm:text-2xl">
            {slide.brand}
          </p>
          <h2 className="mt-1 text-[22px] font-black leading-[1.05] sm:mt-2 sm:text-[34px]">
            {slide.title}
          </h2>
          <p
            className={`mt-2 hidden text-base leading-6 sm:block ${
              dark ? "text-white/84" : "text-black/78"
            }`}
          >
            {slide.body}
          </p>
          {slide.priceLine && (
            <p
              className={`mt-1 text-[11px] font-bold sm:mt-2 sm:text-sm ${
                dark ? "text-[var(--accent)]" : "text-[var(--accent)]"
              }`}
            >
              {slide.priceLine}
            </p>
          )}
          <Link
            href={slide.ctaHref}
            className="press mt-3 inline-flex w-fit min-w-28 justify-center rounded-sm bg-[var(--accent)] px-5 py-2.5 text-[11px] font-black uppercase text-white shadow-[0_3px_0_rgba(0,0,0,0.18)] hover:bg-[var(--accent-hover)] sm:mt-5 sm:min-w-52 sm:px-8 sm:py-3 sm:text-xs"
          >
            {slide.ctaText}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
