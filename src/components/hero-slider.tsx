"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import { ArrowRight, ChevronLeft, ChevronRight, Package, ShieldCheck, TrendingUp } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Stat = {
  icon: typeof Package;
  value: string;
  label: string;
};

type Slide = {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaHref: string;
  badge: string;
};

const slides: Slide[] = [
  {
    title: "Premium tech, delivered fast.",
    subtitle: "Shop trusted sellers across home tech, mobile, audio, gaming, and wearables.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&h=600&fit=crop&q=80",
    ctaText: "Shop now",
    ctaHref: "/catalog",
    badge: "Verified marketplace",
  },
  {
    title: "Gaming gear that wins.",
    subtitle: "Controllers, keyboards, headsets — everything for your next session.",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&h=600&fit=crop&q=80",
    ctaText: "Browse gaming",
    ctaHref: "/catalog?category=Gaming",
    badge: "New arrivals",
  },
  {
    title: "Smart home, smarter you.",
    subtitle: "Automate your space with the latest in home control and IoT.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&h=600&fit=crop&q=80",
    ctaText: "Explore home tech",
    ctaHref: "/catalog?category=Home+Control",
    badge: "Trending",
  },
  {
    title: "Audio that moves you.",
    subtitle: "Headphones, speakers, and earbuds from brands you love.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=600&fit=crop&q=80",
    ctaText: "Shop audio",
    ctaHref: "/catalog?category=Audio",
    badge: "Best sellers",
  },
];

type HeroSliderProps = {
  stats: readonly Stat[];
};

export function HeroSlider({ stats }: HeroSliderProps) {
  const swiperRef = useRef<any>(null);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem]">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        loop
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        navigation={{
          prevEl: ".hero-swiper-prev",
          nextEl: ".hero-swiper-next",
        }}
        className="!h-[520px] sm:!h-[480px] lg:!h-[520px]"
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-between px-6 py-6 sm:px-10 sm:py-8 lg:px-16">
                {/* Top: Badge */}
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3" />
                    {slide.badge}
                  </span>
                </div>

                {/* Center: Title + CTA */}
                <div className="max-w-xl">
                  <h1 className="text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.8rem]">
                    {slide.title}
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={slide.ctaHref}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      {slide.ctaText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/vendors"
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      Browse sellers
                    </Link>
                  </div>
                </div>

                {/* Bottom: Stats */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  {/* Stats */}
                  <dl className="grid grid-cols-3 gap-2">
                    {stats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm sm:p-3">
                        <div className="flex items-center gap-1.5 text-white/70">
                          <stat.icon className="h-3.5 w-3.5" />
                          <span className="text-[9px] uppercase tracking-[0.15em]">{stat.label}</span>
                        </div>
                        <p className="mt-1 text-lg font-semibold text-white sm:text-2xl">{stat.value}</p>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-6 sm:right-6">
        {/* Dots (Swiper pagination) */}
        <div className="swiper-pagination !relative !bottom-0 !left-0 mr-3" />

        {/* Arrows */}
        <button
          className="hero-swiper-prev flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          className="hero-swiper-next flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Global styles for Swiper pagination */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.4) !important;
          opacity: 1 !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 9999px !important;
          transition: all 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--accent) !important;
          width: 32px !important;
        }
      `}</style>
    </div>
  );
}
