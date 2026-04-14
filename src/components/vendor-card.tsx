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
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      >
        <div className="relative aspect-[16/8.4] overflow-hidden">
          <Image
            src={vendor.coverImage}
            alt={vendor.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div
            className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg"
            style={{ backgroundColor: vendor.accent }}
          >
            {vendor.logoMark}
          </div>

          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
            {vendor.rating.toFixed(1)}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight">{vendor.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
              {vendor.headline}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {vendor.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-[var(--background)] p-2">
            <div>
              <p className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
                <Clock3 className="h-3 w-3" />
                Response
              </p>
              <p className="mt-0.5 text-xs font-semibold">{vendor.responseTime}</p>
            </div>
            <div>
              <p className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
                <Package className="h-3 w-3" />
                Products
              </p>
              <p className="mt-0.5 text-xs font-semibold">{vendor.activeProducts}</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {vendor.location}
            </span>
            <span className="flex items-center gap-1 font-medium text-[var(--accent)]">
              {vendor.fulfillmentRate}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
