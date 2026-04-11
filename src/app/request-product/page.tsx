import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageSearch, Truck, WalletCards } from "lucide-react";
import { ProductRequestForm } from "@/components/product-request-form";
import { getAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Request a Product",
  description: "Ask SuperTech to source and ship a product that is not already in the catalog.",
};

export const dynamic = "force-dynamic";

export default async function RequestProductPage() {
  const session = await getAuthSession();

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="soft-card p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Request a product
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Need something we do not stock yet? We can source and ship it for you.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Send us the product name, model, or a shopping link. We will review the
            request, check pricing and availability, and help coordinate delivery to your city.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: PackageSearch,
                title: "Exact model sourcing",
                description: "Share the model, spec, or listing you want us to track down.",
              },
              {
                icon: Truck,
                title: "Shipping support",
                description: "We can help estimate shipping and arrange delivery for you.",
              },
              {
                icon: WalletCards,
                title: "Manual quotes",
                description: "You can request a quote first before deciding to continue.",
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
            <ProductRequestForm
              initialCustomer={{
                name: session?.name ?? "",
                email: session?.email ?? "",
                city: "",
              }}
            />
          </div>
        </section>

        <aside className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            How it works
          </p>
          <div className="mt-6 space-y-4">
            {[
              "Send the product name, model, or shopping link and choose whether you want a quote or full sourcing plus shipping.",
              "Our team checks availability, pricing, and delivery options for your city.",
              "We contact you with the next step for approval before any sourcing continues.",
              "If you move ahead, we coordinate the shipment and keep you updated.",
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

          {!session ? (
            <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
              <p className="text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                Want your requests saved to an account?
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)]"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
