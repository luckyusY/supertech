"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { cn } from "@/lib/utils";

type ProductCardGalleryProps = {
  images: string[];
  alt: string;
  href: string;
  className?: string;
};

function uniqueImages(images: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const src of images) {
    const value = src?.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

/**
 * Touch/swipeable product media for cards.
 * Single image → simple link. Multiple → Swiper with dots + hover arrows.
 */
export function ProductCardGallery({
  images,
  alt,
  href,
  className,
}: ProductCardGalleryProps) {
  const slides = useMemo(() => uniqueImages(images), [images]);
  const multi = slides.length > 1;
  const [active, setActive] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-square overflow-hidden bg-[var(--neutral-50)]",
          className,
        )}
      />
    );
  }

  if (!multi) {
    return (
      <div
        className={cn(
          "relative aspect-square overflow-hidden bg-[var(--neutral-50)]",
          className,
        )}
      >
        <Link href={href} className="absolute inset-0" tabIndex={-1} aria-hidden>
          <Image
            src={slides[0]}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 45vw"
          />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "product-card-gallery group/gallery relative aspect-square overflow-hidden bg-[var(--neutral-50)]",
        className,
      )}
      onClick={(event) => {
        // Keep swipes/arrow clicks from bubbling oddly inside the card
        const target = event.target as HTMLElement;
        if (target.closest(".swiper-pagination") || target.closest("[data-gallery-nav]")) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <Swiper
        modules={[Pagination, A11y, Keyboard]}
        slidesPerView={1}
        spaceBetween={0}
        speed={320}
        nested
        resistanceRatio={0.65}
        keyboard={{ enabled: true, onlyInViewport: true }}
        pagination={{
          clickable: true,
          dynamicBullets: slides.length > 4,
        }}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActive(instance.activeIndex)}
        className="h-full w-full"
        a11y={{
          enabled: true,
          prevSlideMessage: "Previous image",
          nextSlideMessage: "Next image",
        }}
      >
        {slides.map((src, index) => (
          <SwiperSlide key={`${src}-${index}`} className="!h-full">
            <Link
              href={href}
              className="relative block h-full w-full"
              tabIndex={-1}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            >
              <Image
                src={src}
                alt={`${alt} — image ${index + 1} of ${slides.length}`}
                fill
                className="object-cover"
                sizes="(min-width: 1280px) 18vw, (min-width: 768px) 25vw, 45vw"
                priority={index === 0}
                draggable={false}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Desktop hover arrows */}
      <button
        type="button"
        data-gallery-nav
        aria-label="Previous image"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          swiper?.slidePrev();
        }}
        className={cn(
          "absolute left-1.5 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 items-center justify-center",
          "rounded-full border border-black/5 bg-white/95 text-[var(--foreground)] shadow-sm",
          "opacity-0 transition-opacity group-hover/gallery:opacity-100 sm:flex",
          "disabled:pointer-events-none disabled:opacity-0",
          active === 0 && "sm:opacity-0",
        )}
        disabled={active === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        data-gallery-nav
        aria-label="Next image"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          swiper?.slideNext();
        }}
        className={cn(
          "absolute right-1.5 top-1/2 z-20 hidden h-7 w-7 -translate-y-1/2 items-center justify-center",
          "rounded-full border border-black/5 bg-white/95 text-[var(--foreground)] shadow-sm",
          "opacity-0 transition-opacity group-hover/gallery:opacity-100 sm:flex",
          "disabled:pointer-events-none disabled:opacity-0",
          active >= slides.length - 1 && "sm:opacity-0",
        )}
        disabled={active >= slides.length - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Image count pill */}
      <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
        {active + 1}/{slides.length}
      </span>
    </div>
  );
}
