import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, MessagesSquare, ShieldCheck } from "lucide-react";
import { OrderRequestForm } from "@/components/order-request-form";
import { getPublicProducts, getPublicVendorBySlug } from "@/lib/public-marketplace";

type OrderPageProps = {
  searchParams: Promise<{
    product?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Order Request",
  description:
    "Submit a manual order request while the marketplace is still in the pre-payment phase.",
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
            Phase 1 checkout
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Customers can place an order request even before payments go live.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            This flow captures the product, quantity, contact information, delivery
            details, and preferred payment method so you can confirm everything
            manually. Newly approved vendor products are available here too, so
            customers can order from the live catalog before checkout is built.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: MessagesSquare,
                title: "Manual confirmation",
                description: "You contact the customer after the request is submitted.",
              },
              {
                icon: ShieldCheck,
                title: "No payment gateway yet",
                description: "Customers pick a payment preference but are not charged online.",
              },
              {
                icon: Clock3,
                title: "Fast MVP launch",
                description: "Start selling while payments, cart, and checkout are still in progress.",
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
            What happens next
          </p>
          <div className="mt-6 space-y-4">
            {[
              "Customer submits a request with product, address, and payment preference.",
              "The request is saved in MongoDB so it is visible from the admin side.",
              "You confirm availability, delivery timing, and payment manually.",
              "Phase 3 also adds a quote cart for customers who want to request multiple items at once.",
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
              Want to see the whole build path?
            </p>
            <Link
              href="/phases"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)]"
            >
              Open roadmap
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
