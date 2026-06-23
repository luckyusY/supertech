import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, ShieldCheck, Star, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { AiRecommendations } from "@/components/ai-recommendations";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import {
  getPublicProductBySlug,
  getPublicProducts,
  getPublicVendorBySlug,
  getPublicVendorProducts,
} from "@/lib/public-marketplace";
import { getAbsoluteUrl } from "@/lib/site-url";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { MomoPayCard } from "@/components/momo-pay-card";
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

  return (
    <div className="page-shell py-4 sm:py-8">
      <div className="soft-card p-3 sm:p-8 lg:p-10">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[0.85rem] bg-white sm:aspect-[4/4.4] sm:rounded-[2rem]">
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
                  className="relative aspect-[4/3.2] overflow-hidden rounded-[0.85rem] border border-[var(--line)] sm:rounded-[1.5rem]"
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
            {/* Name + price + badges */}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                {product.category}
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-[-0.03em] sm:text-4xl sm:tracking-[-0.05em]">
                {product.name}
              </h1>
              <div className="mt-5 flex flex-wrap items-end gap-3 sm:mt-6 sm:gap-4">
                <p className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl sm:tracking-[-0.05em]">
                  {formatPrice(product.price)}
                </p>
                {product.compareAt ? (
                  <p className="pb-1 text-base text-[var(--muted)] line-through">
                    {formatPrice(product.compareAt)}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                <span
                  className="rounded-full px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm"
                  style={{ backgroundColor: product.accent }}
                >
                  {product.badge}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--muted)] sm:px-4 sm:text-sm">
                  {product.stockLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs font-semibold text-[var(--foreground)] sm:px-4 sm:text-sm">
                  <Star className="h-4 w-4 fill-current text-[var(--accent)]" />
                  {product.reviewCount > 0
                    ? `${product.rating.toFixed(1)} | ${product.reviewCount} reviews`
                    : "New approved listing"}
                </span>
              </div>
            </div>

            {/* Buy now / add to cart */}
            <div className="grid gap-3 sm:flex sm:flex-row">
              <Link
                href={`/order?product=${product.slug}`}
                className="supertech-dark-cta inline-flex w-full items-center justify-center rounded-full bg-[#313133] px-6 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Buy now
              </Link>
              <AddToCartButton
                item={{
                  slug: product.slug,
                  name: product.name,
                  vendorSlug: product.vendorSlug,
                  vendorName: vendor?.name ?? product.vendorSlug,
                  heroImage: product.heroImage,
                  price: product.price,
                  badge: product.badge,
                  accent: product.accent,
                }}
                className="w-full sm:w-auto"
              />
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat with ${vendorName} on WhatsApp about ${product.name}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1fae5b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#178d49] sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>

            {/* MoMoPay */}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                Pay with MoMoPay
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Dial{" "}
                <span className="font-mono font-semibold text-[var(--foreground)]">
                  {momo.dialCode}
                </span>{" "}
                or use the merchant code below to pay {vendorName}.
              </p>
              <div className="mt-4">
                <MomoPayCard
                  merchantCode={momo.merchantCode}
                  businessName={momo.businessName}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-base leading-7 text-[var(--muted)]">
              {product.description}
            </p>
            <div className="rounded-[1rem] border border-[var(--line)] bg-white/72 p-4 sm:rounded-[1.6rem] sm:p-5">
              <div className="space-y-3 text-sm text-[var(--muted)]">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                  <span>{product.shipWindow}</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                  <span>Every seller is verified by SuperTech before listing</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                  <span>Buyer protection on every order placed through SuperTech</span>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-[1.1rem] bg-[rgba(15,23,42,0.04)] px-4 py-3 text-sm font-medium"
                  >
                    <Check className="mr-2 inline h-4 w-4 text-[var(--teal)]" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            {vendor ? (
              <div className="rounded-[1rem] border border-[var(--line)] bg-white/72 p-4 sm:rounded-[1.6rem] sm:p-5">
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                  Sold by
                </p>
                <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xl font-semibold tracking-[-0.03em]">
                      {vendor.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{vendor.headline}</p>
                  </div>
                  <Link
                    href={`/vendors/${vendor.slug}`}
                    className="inline-flex w-full justify-center rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold sm:w-auto"
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
