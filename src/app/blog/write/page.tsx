import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { ProductBlogWriter } from "@/components/product-blog-writer";
import { ProductCard } from "@/components/product-card";
import { getPublicProductBySlug, getPublicProducts, getPublicVendors } from "@/lib/public-marketplace";

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
                Pick any product and SuperTech AI will help draft an editable blog or story.
              </p>
              {productSlug ? (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--red)]">
                  We could not find that product. Choose another one below.
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
              {products.slice(0, 20).map((item, index) => (
                <div key={item.id} className="relative">
                  <ProductCard product={item} index={index} />
                  <Link
                    href={`/blog/write?product=${encodeURIComponent(item.slug)}`}
                    className="absolute inset-x-2 bottom-2 z-30 inline-flex h-9 items-center justify-center rounded-sm bg-[var(--foreground)] px-2 text-xs font-bold text-white shadow-lg"
                  >
                    Write story
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
