"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
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
 * Photo Factory–style PDP gallery:
 * vertical/horizontal thumbs, swipe main image, hover zoom on desktop.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const slides = useMemo(() => uniqueImages(images), [images]);
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (slides.length === 0) {
    return (
      <div className="aspect-square rounded-[var(--radius-lg)] bg-[var(--neutral-100)]" />
    );
  }

  const safeActive = Math.min(active, slides.length - 1);

  function swipe(endX: number) {
    if (touchStartX === null || slides.length < 2) return;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 40) {
      setActive((index) =>
        delta < 0
          ? (index + 1) % slides.length
          : (index - 1 + slides.length) % slides.length,
      );
    }
    setTouchStartX(null);
  }

  return (
    <div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {slides.length > 1 ? (
          <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
            {slides.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === safeActive}
                className={cn(
                  "relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] border bg-white transition sm:h-[66px] sm:w-[66px]",
                  index === safeActive
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--line)] hover:border-[var(--accent)]/50",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="66px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div
          className="group relative h-[300px] w-full min-w-0 shrink-0 touch-pan-y overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-white sm:aspect-square sm:h-auto sm:flex-1 md:cursor-zoom-in"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => swipe(event.changedTouches[0]?.clientX ?? 0)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setOrigin({
              x: ((event.clientX - rect.left) / rect.width) * 100,
              y: ((event.clientY - rect.top) / rect.height) * 100,
            });
          }}
        >
          <Image
            src={slides[safeActive] ?? slides[0]}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain p-2 transition-transform duration-200 md:group-hover:scale-[1.75]"
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
          />
          {slides.length > 1 ? (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
              {safeActive + 1}/{slides.length}
            </span>
          ) : null}
        </div>
      </div>
      {slides.length > 1 ? (
        <p className="mt-2 hidden text-center text-caption text-[var(--muted)] sm:block">
          Hover image to zoom · swipe on mobile · click thumbs to switch
        </p>
      ) : null}
    </div>
  );
}
