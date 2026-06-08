import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { ProductBlogWriter } from "@/components/product-blog-writer";
import { getPublicProductBySlug, getPublicProducts, getPublicVendors } from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";

type BlogWritePageProps = {
  searchParams: Promise<{ product?: string }>;
};

export const metadata: Metadata = {
  title: "Write Product Blog",
  description: "Use AI to draft an editable SuperTech product story or blog post.",
};

export const dynamic = "force-dynamic";

export default async function BlogWritePage({ searchParams }: BlogWritePageProps) {
  const { product: productSlug = "" } = await searchParams;
  const [selectedProduct, products, vendors] = await Promise.all([
    productSlug ? getPublicProductBySlug(productSlug) : Promise.resolve(undefined),
    getPublicProducts(),
    getPublicVendors(),
  ]);

  const vendorName = selectedProduct
    ? vendors.find((vendor) => vendor.slug === selectedProduct.vendorSlug)?.name ?? selectedProduct.vendorSlug
    : "";

  return (
    <div className="marketplace-campaign-bg py-5 sm:py-6">
      <div className="page-shell">
        {selectedProduct ? (
          <ProductBlogWriter product={selectedProduct} vendorName={vendorName} />
        ) : (
          <section className="soft-card overflow-hidden bg-white">
            <div className="border-b border-[var(--line)] bg-[#fff8ef] p-4 sm:p-6">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <PenLine className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Product story writer
                </p>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
                Choose a product to write about
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Pick any product and SuperTech AI drafts a search-optimized blog for shoppers in
                Kigali, Rwanda — then publish it in one click.
              </p>
              {productSlug ? (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--red)]">
                  We could not find that product. Choose another one below.
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.slice(0, 24).map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/write?product=${encodeURIComponent(item.slug)}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square bg-[#f7f7f7]">
                    <Image
                      src={item.heroImage}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      {item.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[var(--foreground)]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                      {formatPrice(item.price)}
                    </p>
                    <span className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3 text-xs font-bold text-white transition-colors group-hover:bg-[var(--accent-hover)]">
                      <PenLine className="h-3.5 w-3.5" />
                      Write SEO blog
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
