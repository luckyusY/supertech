import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { AiRecommendations } from "@/components/ai-recommendations";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import {
  getPublicProductBySlug,
  getPublicProducts,
  getPublicVendorBySlug,
  getPublicVendorProducts,
} from "@/lib/public-marketplace";
import { getAbsoluteUrl } from "@/lib/site-url";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { resolveVendorMomo } from "@/lib/payment-methods";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await getPublicProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const productUrl = getAbsoluteUrl(`/products/${product.slug}`);
  const previewImage = getAbsoluteUrl(`/products/${product.slug}/opengraph-image`);

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      url: productUrl,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: product.name,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [previewImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const vendor = await getPublicVendorBySlug(product.vendorSlug);
  const vendorName = vendor?.name ?? product.vendorSlug;
  const whatsappHref = getWhatsAppHref(
    vendor?.whatsappNumber ?? product.vendorWhatsAppNumber,
    `Hello ${vendorName}, I am interested in ${product.name} on SuperTech.`,
  );
  const momo = resolveVendorMomo(vendor);
  const relatedProducts = (await getPublicVendorProducts(product.vendorSlug))
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  const ratingLabel =
    product.reviewCount > 0
      ? `${product.rating.toFixed(1)} · ${product.reviewCount} reviews`
      : "New approved listing";

  return (
    <div className="page-shell py-4 pb-28 sm:py-8 sm:pb-8">
      <div className="soft-card p-3 sm:p-8 lg:p-10">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-white sm:aspect-[4/4.4] sm:rounded-[var(--radius-xl)]">
              <Image
                src={product.gallery[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.gallery.slice(1).map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-[4/3.2] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)]"
                >
                  <Image
                    src={image}
                    alt={`${product.name} gallery ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-5 sm:space-y-6">
            <ProductBuyBox
              product={product}
              vendorName={vendorName}
              vendorSlug={vendor?.slug}
              whatsappHref={whatsappHref}
              momo={momo}
              ratingLabel={ratingLabel}
            />

            <p className="text-base leading-7 text-[var(--muted)]">{product.description}</p>

            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/72 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-[var(--radius-md)] bg-[rgba(15,23,42,0.04)] px-4 py-3 text-sm font-medium"
                  >
                    <Check className="mr-2 inline h-4 w-4 text-[var(--teal)]" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {vendor ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/72 p-4 sm:p-5">
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                  Sold by
                </p>
                <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="inline-flex items-center gap-2 text-xl font-semibold tracking-[-0.03em]">
                      {vendor.name}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--success)]">
                        <Star className="h-3 w-3 fill-current" />
                        Verified
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{vendor.headline}</p>
                  </div>
                  <Link
                    href={`/vendors/${vendor.slug}`}
                    className="inline-flex w-full justify-center rounded-[var(--radius-md)] border border-[var(--line)] px-4 py-2 text-sm font-semibold sm:w-auto"
                  >
                    Visit store
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="soft-card p-4 sm:p-8">
        <ProductReviews productSlug={product.slug} />
      </section>

      <section className="mt-6 soft-card p-4 sm:mt-8 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          More from this vendor
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <AiRecommendations slug={product.slug} />
    </div>
  );
}
