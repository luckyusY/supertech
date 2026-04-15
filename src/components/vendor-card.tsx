"use client";

import { animated, useSpring } from "@react-spring/web";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useRef, useEffect } from "react";
import { toast } from "sonner";
import { type Vendor } from "@/lib/marketplace";

type VendorCardProps = {
  vendor: Vendor;
  index?: number;
};

export function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Spring animation for entrance
  const [springStyle, api] = useSpring(() => ({
    from: { opacity: 0, y: 16 },
    to: { opacity: 1, y: 0 },
    config: { tension: 120, friction: 14 },
    delay: index * 50,
  }));

  // Hover animation
  const [hoverSpring, hoverApi] = useSpring(() => ({
    y: 0,
    scale: 1,
    config: { tension: 200, friction: 16 },
  }));

  // Intersection observer for entrance animation
  useEffect(() => {
    if (cardRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            api.start();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(cardRef.current);
    }
  }, [api]);

  function handleVisit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    toast("Visiting " + vendor.name + "...", {
      duration: 1500,
    });
  }

  return (
    <animated.div
      ref={cardRef}
      style={springStyle}
      onMouseEnter={() => hoverApi.start({ y: -4, scale: 1.02 })}
      onMouseLeave={() => hoverApi.start({ y: 0, scale: 1 })}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm transition-shadow duration-300 hover:shadow-md card"
    >
      <animated.div style={hoverSpring} className="flex h-full flex-col">
        <Link
          href={"/vendors/" + vendor.slug}
          className="absolute inset-0 z-10 rounded-xl"
          aria-label={`Visit ${vendor.name} vendor page`}
        />

        <div className="relative aspect-[4/4.15] overflow-hidden bg-[var(--background)]">
          <Image
            src={vendor.coverImage}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-500"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            loading={index < 4 ? "eager" : "lazy"}
            priority={index < 4}
            fetchPriority={index < 4 ? "high" : "auto"}
            decoding="async"
          />

          <div className="absolute left-2 top-2 z-20 flex flex-wrap gap-1.5">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
              style={{ backgroundColor: vendor.accent }}
            >
              Vendor
            </span>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {vendor.name}
          </h3>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {vendor.headline}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
              {vendor.activeProducts} products
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
              <span>{vendor.fulfillmentRate}%</span>
              <span>fulfillment</span>
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
              <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
              {vendor.reviewCount > 0 ? vendor.rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </animated.div>
    </animated.div>
  );
}
