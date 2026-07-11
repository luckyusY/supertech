"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export type CampaignSlide = {
  image: string;
  kicker: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  align?: "left" | "right";
};

type CampaignBannerSliderProps = {
  slides: readonly CampaignSlide[];
  intervalMs?: number;
};

export function CampaignBannerSlider({
  slides,
  intervalMs = 4500,
}: CampaignBannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const activeSlides = slides.filter(Boolean);
  const slideCount = activeSlides.length;
  const safeCurrent = slideCount > 0 ? current % slideCount : 0;
  const activeSlide = activeSlides[safeCurrent];

  const goToSlide = useCallback(
    (index: number) => {
      if (slideCount <= 1) return;
      setCurrent((index + slideCount) % slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1) return;

    const interval = setInterval(() => {
      goToSlide(safeCurrent + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [goToSlide, intervalMs, safeCurrent, slideCount]);

  if (!activeSlide) return null;

  const align = activeSlide.align ?? "right";
  const contentAlignment =
    align === "right" ? "items-start md:items-end md:text-right" : "items-start";
  const overlay =
    align === "right"
      ? "bg-[linear-gradient(90deg,rgba(49,49,51,0.18)_0%,rgba(49,49,51,0.58)_55%,rgba(49,49,51,0.94)_100%)]"
      : "bg-[linear-gradient(90deg,rgba(49,49,51,0.94)_0%,rgba(49,49,51,0.58)_45%,rgba(49,49,51,0.18)_100%)]";

  function prevSlide() {
    goToSlide(safeCurrent - 1);
  }

  function nextSlide() {
    goToSlide(safeCurrent + 1);
  }

  return (
    <section className="market-shelf relative min-h-[210px] overflow-hidden sm:min-h-[245px]" data-campaign-slider>
      {activeSlides.map((slide, index) => (
        <div
          key={`${slide.image}-${slide.title}`}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: index === safeCurrent ? 1 : 0 }}
          aria-hidden={index !== safeCurrent}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            className="object-cover"
            sizes="(min-width: 1280px) 82rem, 100vw"
          />
        </div>
      ))}

      <div className={`absolute inset-0 ${overlay}`} />

      <div className={`relative z-10 flex min-h-[210px] flex-col justify-center px-5 py-6 text-white sm:min-h-[245px] sm:px-8 ${contentAlignment}`}>
        <p className="max-w-xl text-[11px] font-black uppercase tracking-[0.24em] text-white/88">
          {activeSlide.kicker}
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-black leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl">
          {activeSlide.title}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/88 sm:text-base">
          {activeSlide.description}
        </p>
        <Link
          href={activeSlide.href}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/25 bg-[var(--accent)] px-4 py-2.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.24)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {activeSlide.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {slideCount > 1 ? (
        <div className="absolute inset-x-5 bottom-4 z-20 flex items-center justify-between gap-3 sm:inset-x-8">
          <div className="flex gap-2">
            {activeSlides.map((slide, index) => (
              <button
                key={`${slide.title}-dot`}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === safeCurrent ? "w-8 bg-[var(--accent)]" : "w-2 bg-white/55 hover:bg-white/80"
                }`}
                aria-label={`Show campaign ${index + 1}`}
              />
            ))}
          </div>

          <div className="hidden gap-1.5 sm:flex">
            <button
              type="button"
              onClick={prevSlide}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
              aria-label="Previous campaign"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
              aria-label="Next campaign"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
