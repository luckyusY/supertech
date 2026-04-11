import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Package2, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import {
  getPublicVendorBySlug,
  getPublicVendorProducts,
  getPublicVendors,
} from "@/lib/public-marketplace";

type VendorPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const vendors = await getPublicVendors();

  return vendors.map((vendor) => ({
    slug: vendor.slug,
  }));
}

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getPublicVendorBySlug(slug);

  if (!vendor) {
    return {
      title: "Vendor not found",
    };
  }

  return {
    title: vendor.name,
    description: vendor.headline,
  };
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const vendor = await getPublicVendorBySlug(slug);

  if (!vendor) {
    notFound();
  }

  const vendorProducts = await getPublicVendorProducts(vendor.slug);

  return (
    <div className="page-shell py-8">
      <section className="dark-card relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <Image
          src={vendor.coverImage}
          alt={vendor.name}
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,33,28,0.88),rgba(17,33,28,0.58))]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
              Vendor storefront
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] text-lg font-semibold text-white"
                style={{ backgroundColor: vendor.accent }}
              >
                {vendor.logoMark}
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                  {vendor.name}
                </h1>
                <p className="mt-2 max-w-2xl text-base leading-7 text-[rgba(255,255,255,0.76)]">
                  {vendor.headline}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[rgba(255,255,255,0.76)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                {vendor.location}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
                <Star className="h-4 w-4 fill-current text-[var(--gold)]" />
                {vendor.rating.toFixed(1)} from {vendor.reviewCount} reviews
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
                <Package2 className="h-4 w-4" />
                {vendor.activeProducts} active products
              </span>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[rgba(255,255,255,0.55)]">
              Store health
            </p>
            <div className="mt-5 space-y-4">
              {[
                { label: "Fulfillment rate", value: vendor.fulfillmentRate },
                { label: "Response time", value: vendor.responseTime },
                { label: "Joined", value: vendor.joined },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4"
                >
                  <p className="text-sm text-[rgba(255,255,255,0.62)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 soft-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Store catalog
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              Products from {vendor.name}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              All products below are verified and sold directly by {vendor.name}.
              Every listing is reviewed by SuperTech before going live.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vendorProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
