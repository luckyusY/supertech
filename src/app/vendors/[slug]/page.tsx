import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="page-shell py-4 sm:py-8">
      <section className="dark-card relative overflow-hidden p-4 sm:p-8 lg:p-10">
        <Image
          src={vendor.coverImage}
          alt={vendor.name}
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(15,23,42,0.58))]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
              Vendor storefront
            </p>
            <div className="mt-4 flex items-center gap-3 sm:gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] text-base font-semibold text-white sm:h-16 sm:w-16 sm:rounded-[1.5rem] sm:text-lg"
                style={{ backgroundColor: vendor.accent }}
              >
                {vendor.logoMark}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  {vendor.name}
                </h1>
                <p className="mt-1.5 text-sm leading-6 text-[rgba(255,255,255,0.76)] sm:mt-2 sm:text-base sm:leading-7">
                  {vendor.headline}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-[rgba(255,255,255,0.76)] sm:mt-6 sm:gap-3 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {vendor.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
                <Star className="h-3.5 w-3.5 fill-current text-[var(--gold)] sm:h-4 sm:w-4" />
                {vendor.rating.toFixed(1)} · {vendor.reviewCount} reviews
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
                <Package2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {vendor.activeProducts} products
              </span>
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4 sm:rounded-[1.5rem] sm:p-5">
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-[rgba(255,255,255,0.55)]">
              Store health
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 lg:mt-5 lg:grid-cols-1 lg:space-y-0 lg:gap-4">
              {[
                { label: "Fulfillment rate", value: vendor.fulfillmentRate },
                { label: "Response time", value: vendor.responseTime },
                { label: "Joined", value: vendor.joined },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1rem] border border-white/10 bg-white/6 p-3 sm:p-4"
                >
                  <p className="text-xs text-[rgba(255,255,255,0.62)] sm:text-sm">{item.label}</p>
                  <p className="mt-1 text-base font-semibold tracking-[-0.03em] sm:mt-2 sm:text-2xl sm:tracking-[-0.04em]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 soft-card p-4 sm:mt-8 sm:p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Store catalog
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] sm:mt-3 sm:text-3xl sm:tracking-[-0.05em]">
            Products from {vendor.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:mt-3 sm:leading-7">
            All products below are verified and sold directly by {vendor.name}.
            Every listing is reviewed by SuperTech before going live.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vendorProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
