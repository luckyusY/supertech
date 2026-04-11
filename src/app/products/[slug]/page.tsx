import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, ShieldCheck, Star, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import {
  getPublicProductBySlug,
  getPublicProducts,
  getPublicVendorBySlug,
  getPublicVendorProducts,
} from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";

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

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const vendor = await getPublicVendorBySlug(product.vendorSlug);
  const relatedProducts = (await getPublicVendorProducts(product.vendorSlug))
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="page-shell py-8">
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-[2rem] bg-white">
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
                  className="relative aspect-[4/3.2] overflow-hidden rounded-[1.5rem] border border-[var(--line)]"
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
          <div className="space-y-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                {product.category}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                {product.name}
              </h1>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                {product.description}
              </p>
            </div>
            <div className="flex items-end gap-4">
              <p className="text-4xl font-semibold tracking-[-0.05em]">
                {formatPrice(product.price)}
              </p>
              {product.compareAt ? (
                <p className="pb-1 text-base text-[var(--muted)] line-through">
                  {formatPrice(product.compareAt)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <span
                className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: product.accent }}
              >
                {product.badge}
              </span>
              <span className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--muted)]">
                {product.stockLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                <Star className="h-4 w-4 fill-current text-[var(--accent)]" />
                {product.reviewCount > 0
                  ? `${product.rating.toFixed(1)} | ${product.reviewCount} reviews`
                  : "New approved listing"}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/order?product=${product.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
              >
                Order from us
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
              />
              <Link
                href="/phases"
                className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
              >
                See build phases
              </Link>
            </div>
            <p className="text-sm leading-7 text-[var(--muted)]">
              Need more than one item? Add products to the quote cart and send a
              single manual request while payments are still offline.
            </p>
            <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/72 p-5">
              <div className="space-y-3 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-[var(--teal)]" />
                  {product.shipWindow}
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[var(--teal)]" />
                  Marketplace review gate before products go live to customers
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[var(--teal)]" />
                  No online payment yet; order requests are confirmed manually
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-[1.1rem] bg-[rgba(16,32,25,0.04)] px-4 py-3 text-sm font-medium"
                  >
                    <Check className="mr-2 inline h-4 w-4 text-[var(--teal)]" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            {vendor ? (
              <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/72 p-5">
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
                  Sold by
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold tracking-[-0.03em]">
                      {vendor.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{vendor.headline}</p>
                  </div>
                  <Link
                    href={`/vendors/${vendor.slug}`}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
                  >
                    Visit store
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mt-8 soft-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          More from this vendor
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
