"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, Package, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type Vendor } from "@/lib/marketplace";

type VendorCardProps = {
  vendor: Vendor;
  index?: number;
};

export function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.42,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        href={`/vendors/${vendor.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.95))] shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
      >
        <div className="relative aspect-[16/8.4] overflow-hidden">
          <Image
            src={vendor.coverImage}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

          <div
            className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-[1rem] text-sm font-bold text-white shadow-lg ring-2 ring-white/20"
            style={{ backgroundColor: vendor.accent }}
          >
            {vendor.logoMark}
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
            {vendor.rating.toFixed(1)}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="min-w-0">
            <h3 className="font-semibold tracking-[-0.03em]">{vendor.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
              {vendor.headline}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full bg-[rgba(15,23,42,0.05)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-[1.15rem] bg-[rgba(15,23,42,0.03)] p-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                <Clock3 className="h-3 w-3" />
                Response
              </p>
              <p className="mt-1 text-sm font-semibold">{vendor.responseTime}</p>
            </div>
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                <Package className="h-3 w-3" />
                Active products
              </p>
              <p className="mt-1 text-sm font-semibold">{vendor.activeProducts}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {vendor.location}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[var(--teal)] transition-all group-hover:gap-2">
              {vendor.fulfillmentRate}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
