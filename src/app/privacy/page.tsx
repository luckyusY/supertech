import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SuperTech Marketplace collects, uses, and protects customer and seller information.",
};

const sections = [
  {
    title: "Information We Collect",
    body:
      "SuperTech collects information you provide when you create an account, request a product, place an order, contact support, apply as a vendor, or submit product details. This can include your name, email address, phone number, delivery location, order details, payment preference, seller profile details, and messages sent through the marketplace.",
  },
  {
    title: "How We Use Information",
    body:
      "We use this information to operate the marketplace, process order requests, connect shoppers with vendors, provide customer support, prevent misuse, improve product listings, send service messages, and maintain account and vendor tools.",
  },
  {
    title: "Payments And Orders",
    body:
      "SuperTech may show payment instructions or merchant details for supported payment methods. Payment confirmation, delivery coordination, refunds, and dispute handling may require sharing relevant order information with the vendor or service provider involved in the transaction.",
  },
  {
    title: "Vendors And Service Providers",
    body:
      "We share only the information needed to fulfill a request, support a customer, review a vendor application, deliver a product, maintain hosting, store media, send email, or provide analytics and security services. We do not sell personal information.",
  },
  {
    title: "Cookies And Device Data",
    body:
      "The website and mobile app may use cookies, local storage, device identifiers, log data, and similar technologies to keep you signed in, remember cart activity, improve performance, measure traffic, and protect the service.",
  },
  {
    title: "Your Choices",
    body:
      "You can contact us to request access, correction, or deletion of your personal information, subject to records we must keep for security, legal, payment, or order-management reasons.",
  },
  {
    title: "Data Security",
    body:
      "We use reasonable technical and organizational safeguards to protect marketplace data. No online service is completely risk-free, so customers and vendors should keep account credentials private and report suspicious activity quickly.",
  },
  {
    title: "Children",
    body:
      "SuperTech is not intended for children under 13. If we learn that a child has provided personal information without appropriate consent, we will take steps to delete it.",
  },
  {
    title: "Changes",
    body:
      "We may update this policy as the marketplace grows, including when we add new payment, delivery, notification, or seller tools. The updated date on this page shows when the policy last changed.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[#fff8ef]">
      <section className="page-shell py-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            SuperTech Marketplace
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
            Last updated: June 6, 2026. This policy explains how SuperTech handles
            information from shoppers, vendors, and visitors using our website and mobile app.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold tracking-[-0.02em] text-[var(--foreground)]">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-[var(--foreground)]">
            Contact
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            For privacy questions or account requests, contact SuperTech support through the
            marketplace support tools or email{" "}
            <a className="font-semibold text-[var(--accent)]" href="mailto:support@supertech.africa">
              support@supertech.africa
            </a>
            .
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to marketplace
          </Link>
        </section>
      </section>
    </div>
  );
}
