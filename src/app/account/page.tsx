import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, PackageSearch, Truck } from "lucide-react";
import { getCurrentCustomerAccount, requirePageSession } from "@/lib/auth";
import { hasMongoConfig } from "@/lib/integrations";
import { getProductRequestsByCustomerEmail } from "@/lib/product-requests";

export const metadata: Metadata = {
  title: "My Account",
  description: "See your account details and recent product requests.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requirePageSession({
    roles: ["customer"],
    nextPath: "/account",
  });
  const account = await getCurrentCustomerAccount(session);
  const requests =
    hasMongoConfig() ? await getProductRequestsByCustomerEmail({ customerEmail: session.email }) : [];

  return (
    <div className="page-shell py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="soft-card p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            My account
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Welcome back, {session.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Use your account to request products we do not yet stock, keep your basic
            details ready, and come back to your recent sourcing requests.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Account email", value: session.email },
              { label: "City", value: account?.city || "Add on your next request" },
              {
                label: "Recent product requests",
                value: String(requests.length),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-4"
              >
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/request"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
            >
              Request a product
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/catalog"
              className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Shop catalog
            </Link>
            <Link
              href="/track-order"
              className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Track an order
            </Link>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-3">
              <PackageSearch className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Recent product requests
              </h2>
            </div>

            {requests.length === 0 ? (
              <div className="mt-6 rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-5 text-sm leading-7 text-[var(--muted)]">
                No product requests yet. Use the request page if you want us to source
                and ship something that is not currently in the catalog.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {requests.map((request) => (
                  <div
                    key={String(request._id)}
                    className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                          {request.productName}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {request.category} | {request.city}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="rounded-full bg-[rgba(26,123,112,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--teal)]">
                          {request.status}
                        </span>
                        <p className="mt-3 text-sm text-[var(--muted)]">
                          {request.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {request.description ? (
                      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                        {request.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            Account shortcuts
          </p>
          <div className="mt-6 space-y-4">
            {[
              {
                icon: PackageSearch,
                title: "Request a hard-to-find item",
                description: "Tell us the product and we will source it for you.",
              },
              {
                icon: Truck,
                title: "Get shipping estimates",
                description: "Share your city and address details when you want delivery.",
              },
              {
                icon: Clock3,
                title: "Come back anytime",
                description: "Your recent sourcing requests stay attached to your account email.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4"
              >
                <item.icon className="h-5 w-5 text-[var(--gold)]" />
                <p className="mt-4 text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.72)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
