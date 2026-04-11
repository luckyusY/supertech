import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { getVendorBySlug, type Product } from "@/lib/marketplace";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const vendor = getVendorBySlug(product.vendorSlug);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-white transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/4.8] overflow-hidden">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 40vw, 100vw"
        />
        <div
          className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: product.accent }}
        >
          {product.badge}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              {vendor?.name ?? "Marketplace vendor"}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
              {product.name}
            </h3>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
        </div>
        <p className="text-sm leading-6 text-[var(--muted)]">{product.description}</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em]">
              {formatPrice(product.price)}
            </p>
            {product.compareAt ? (
              <p className="text-sm text-[var(--muted)] line-through">
                {formatPrice(product.compareAt)}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {product.reviewCount > 0 ? product.rating.toFixed(1) : "New"}
          </div>
        </div>
      </div>
    </Link>
  );
}
