"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
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
      transition={{ duration: 0.42, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href={`/vendors/${vendor.slug}`}
        className="group flex flex-col overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.08]"
      >
        {/* Cover image */}
        <div className="relative aspect-[16/8] overflow-hidden">
          <Image
            src={vendor.coverImage}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Logo mark */}
          <div
            className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg ring-2 ring-white/20"
            style={{ backgroundColor: vendor.accent }}
          >
            {vendor.logoMark}
          </div>

          {/* Rating chip */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
            {vendor.rating.toFixed(1)}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold tracking-[-0.03em]">{vendor.name}</h3>
              <p className="mt-0.5 text-xs leading-5 text-[var(--muted)] line-clamp-2">{vendor.headline}</p>
            </div>
          </div>

          {/* Category tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-[rgba(15,23,42,0.05)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Footer row */}
          <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-3 mt-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {vendor.location}
            </span>
            <span className="flex items-center gap-1 font-semibold text-[var(--teal)] transition-all group-hover:gap-1.5">
              {vendor.fulfillmentRate}
              <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
