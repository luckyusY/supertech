import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronRight, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { AiRecommendations } from "@/components/ai-recommendations";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { ProductStickyBar } from "@/components/product-sticky-bar";
import {
  getPublicProductBySlug,
  getPublicProducts,
  getPublicVendorBySlug,
  getPublicVendorProducts,
} from "@/lib/public-marketplace";
import { buildBuyBoxPlan } from "@/lib/product-rules";
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
    .slice(0, 4);

  const ratingLabel =
    product.reviewCount > 0
      ? `${product.rating.toFixed(1)} · ${product.reviewCount} reviews`
      : "New approved listing";

  const galleryImages = [
    product.heroImage,
    ...(product.gallery ?? []),
  ];
  const buyPlan = buildBuyBoxPlan({
    category: product.category,
    productSlug: product.slug,
    stockLabel: product.stockLabel,
    vendorSlug: vendor?.slug ?? product.vendorSlug,
  });

  return (
    <div className="page-shell py-4 pb-36 sm:py-6 sm:pb-24">
      {/* Breadcrumb — Photo Factory density */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-caption text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalog" className="hover:text-[var(--accent)]">
          Catalog
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/catalog?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[var(--accent)]"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 max-w-[12rem] text-[var(--foreground)] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="soft-card overflow-hidden p-3 sm:p-6 lg:p-8">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,400px)] lg:gap-10">
          <ProductGallery images={galleryImages} name={product.name} />

          <div className="min-w-0 space-y-5">
            <ProductBuyBox
              product={product}
              vendorName={vendorName}
              vendorSlug={vendor?.slug}
              whatsappHref={whatsappHref}
              momo={momo}
              ratingLabel={ratingLabel}
            />

            {vendor ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--neutral-50)] p-4">
                <p className="text-overline text-[var(--muted)]">Sold by</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="inline-flex flex-wrap items-center gap-2 text-lg font-bold tracking-[-0.02em]">
                      {vendor.name}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--success)]">
                        <Star className="h-3 w-3 fill-current" />
                        Verified
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{vendor.headline}</p>
                  </div>
                  <Link
                    href={`/vendors/${vendor.slug}`}
                    className="inline-flex justify-center rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:border-[var(--accent)]"
                  >
                    Visit store
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* About + features — tab-style sections */}
        <div className="mt-8 border-t border-[var(--line)] pt-6">
          <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
            {[
              { id: "about", label: "About" },
              { id: "features", label: "Key features" },
              { id: "reviews", label: "Reviews" },
            ].map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className="rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {tab.label}
              </a>
            ))}
          </div>

          <section id="about" className="scroll-mt-28 py-6">
            <h2 className="text-subtitle">About this product</h2>
            <p className="mt-3 max-w-3xl text-body leading-7 text-[var(--muted)]">
              {product.description}
            </p>
          </section>

          {product.features.length > 0 ? (
            <section id="features" className="scroll-mt-28 border-t border-[var(--line)] py-6">
              <h2 className="text-subtitle">Key features</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--neutral-50)] px-3.5 py-3 text-sm font-medium"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <section id="reviews" className="mt-6 scroll-mt-28 soft-card p-4 sm:p-8">
        <ProductReviews productSlug={product.slug} />
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-6 soft-card p-4 sm:p-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-overline text-[var(--muted)]">More from this vendor</p>
              <h2 className="text-title mt-1">You may also like</h2>
            </div>
            {vendor ? (
              <Link
                href={`/vendors/${vendor.slug}`}
                className="text-sm font-bold text-[var(--accent)] hover:underline"
              >
                View store
              </Link>
            ) : null}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      <AiRecommendations slug={product.slug} />

      <ProductStickyBar
        slug={product.slug}
        name={product.name}
        price={product.price}
        stockLabel={product.stockLabel}
        vendorSlug={product.vendorSlug}
        vendorName={vendorName}
        heroImage={product.heroImage}
        badge={product.badge}
        accent={product.accent}
        primaryHref={buyPlan.primary.href}
        primaryLabel={buyPlan.primary.label}
        showAddToCart={buyPlan.showAddToCart}
      />
    </div>
  );
}
