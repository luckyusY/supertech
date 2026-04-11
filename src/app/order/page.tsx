import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { OrderRequestForm } from "@/components/order-request-form";
import { getPublicProducts, getPublicVendorBySlug } from "@/lib/public-marketplace";

type OrderPageProps = {
  searchParams: Promise<{
    product?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Place Order",
  description:
    "Order premium tech from verified sellers across East and West Africa. Fast delivery, buyer protection.",
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const { product } = await searchParams;
  const publicProducts = await getPublicProducts();
  const formProducts = await Promise.all(
    publicProducts.map(async (item) => ({
      slug: item.slug,
      name: item.name,
      vendorName: (await getPublicVendorBySlug(item.vendorSlug))?.name ?? item.vendorSlug,
      price: item.price,
      badge: item.badge,
    })),
  );

  const initialProductSlug =
    formProducts.find((item) => item.slug === product)?.slug ?? formProducts[0]?.slug;

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="soft-card p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Place an order
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Get any product delivered to your door.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Fill in your details below and our team will confirm your order, coordinate
            with the seller, and arrange fast delivery to your city. We cover major
            cities across East and West Africa.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verified sellers",
                description: "Every vendor is vetted and reviewed before they list products here.",
              },
              {
                icon: MapPin,
                title: "Wide coverage",
                description: "We deliver across major cities in East and West Africa.",
              },
              {
                icon: Clock3,
                title: "Fast confirmation",
                description: "Our team contacts you quickly to confirm availability and delivery.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5"
              >
                <item.icon className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <OrderRequestForm products={formProducts} initialProductSlug={initialProductSlug} />
          </div>
        </section>

        <aside className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            How it works
          </p>
          <div className="mt-6 space-y-4">
            {[
              "Pick a product, enter your delivery details and preferred payment method.",
              "Our team reviews your order and contacts you within 24 hours to confirm.",
              "We coordinate with the verified seller for packaging and dispatch.",
              "Your order ships and you receive a tracking update to follow it to your door.",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-7 text-[rgba(255,255,255,0.76)]"
              >
                <span className="mr-3 font-mono text-[var(--gold)]">0{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
            <p className="text-sm leading-7 text-[rgba(255,255,255,0.76)]">
              Want to track an existing order?
            </p>
            <Link
              href="/track-order"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)]"
            >
              Track my order
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
