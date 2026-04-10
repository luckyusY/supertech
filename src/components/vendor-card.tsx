import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react";
import { type Vendor } from "@/lib/marketplace";

type VendorCardProps = {
  vendor: Vendor;
};

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={vendor.coverImage}
          alt={vendor.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw"
        />
        <div
          className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-lg"
          style={{ backgroundColor: vendor.accent }}
        >
          {vendor.logoMark}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.04em]">{vendor.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {vendor.headline}
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {vendor.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-[rgba(16,32,25,0.05)] px-3 py-1 text-xs font-semibold text-[var(--muted)]"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="grid gap-2 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {vendor.location}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {vendor.responseTime}
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-current text-[var(--accent)]" />
            {vendor.rating.toFixed(1)} rating across {vendor.reviewCount} reviews
          </div>
        </div>
      </div>
    </Link>
  );
}
