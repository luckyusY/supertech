"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/utils";

type OrderFormProduct = {
  slug: string;
  name: string;
  vendorName: string;
  price: number;
  badge: string;
};

type OrderRequestFormProps = {
  products: OrderFormProduct[];
  initialProductSlug: string;
};

type SuccessState = {
  requestId: string;
  productName: string;
  vendorName: string;
  estimatedTotal: number;
  customerEmail: string;
};

type SuccessPayload = Omit<SuccessState, "customerEmail">;

const contactOptions = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
] as const;

const paymentOptions = [
  { value: "cash_on_delivery", label: "Cash on delivery" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "manual_arrangement", label: "Manual arrangement" },
] as const;

export function OrderRequestForm({
  products,
  initialProductSlug,
}: OrderRequestFormProps) {
  const defaultProduct =
    products.find((product) => product.slug === initialProductSlug) ?? products[0];

  const [selectedProductSlug, setSelectedProductSlug] = useState(defaultProduct.slug);
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPreference, setContactPreference] = useState("whatsapp");
  const [paymentPreference, setPaymentPreference] = useState("cash_on_delivery");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProduct =
    products.find((product) => product.slug === selectedProductSlug) ?? defaultProduct;
  const parsedQuantity = Math.max(1, Number(quantity) || 1);
  const estimatedTotal = selectedProduct.price * parsedQuantity;

  function resetForm() {
    setQuantity("1");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCity("");
    setDeliveryAddress("");
    setContactPreference("whatsapp");
    setPaymentPreference("cash_on_delivery");
    setNotes("");
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/order-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productSlug: selectedProduct.slug,
            quantity: parsedQuantity,
            customerName,
            customerEmail,
            customerPhone,
            city,
            deliveryAddress,
            contactPreference,
            paymentPreference,
            notes,
          }),
        });

        const result = (await response.json()) as
          | { error: string }
          | SuccessPayload;

        if (!response.ok || "error" in result) {
          throw new Error(
            "error" in result ? result.error : "Unable to place order request.",
          );
        }

        setSuccess({
          ...result,
          customerEmail,
        });
        resetForm();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to place order request.",
        );
      }
    });
  }

  if (success) {
    return (
      <div className="soft-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Request submitted
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
          Your order request is in our queue.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Request ID", value: success.requestId },
            { label: "Product", value: success.productName },
            { label: "Vendor", value: success.vendorName },
            { label: "Estimated total", value: formatPrice(success.estimatedTotal) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[1.35rem] border border-[var(--line)] bg-white/72 p-4"
            >
              <p className="text-sm text-[var(--muted)]">{item.label}</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
          We will contact you to confirm stock, delivery details, and the payment
          method you selected before anything is finalized.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
          >
            Send another request
          </button>
          <Link
            href={`/track-order?requestId=${encodeURIComponent(success.requestId)}&email=${encodeURIComponent(success.customerEmail)}`}
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
          >
            Track this request
          </Link>
          <Link
            href="/catalog"
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="soft-card p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold" htmlFor="productSlug">
              Product
            </label>
            <select
              id="productSlug"
              value={selectedProductSlug}
              onChange={(event) => setSelectedProductSlug(event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name} - {product.vendorName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-[rgba(15,23,42,0.03)] px-4 py-3">
              <p className="text-sm text-[var(--muted)]">Estimated total</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {formatPrice(estimatedTotal)}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Color preference, preferred delivery time, or any special instructions."
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="customerName">
                Full name
              </label>
              <input
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="customerPhone">
                Phone number
              </label>
              <input
                id="customerPhone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="customerEmail">
              Email address
            </label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="city">
                City
              </label>
              <input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="contactPreference">
                Best contact method
              </label>
              <select
                id="contactPreference"
                value={contactPreference}
                onChange={(event) => setContactPreference(event.target.value)}
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              >
                {contactOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="deliveryAddress">
              Delivery address
            </label>
            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              required
              rows={4}
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="paymentPreference">
              Preferred payment method
            </label>
            <select
              id="paymentPreference"
              value={paymentPreference}
              onChange={(event) => setPaymentPreference(event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1rem] border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
          No online payment is required yet. Submit the request and we will confirm
          stock, delivery, and final payment manually.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Submitting..." : "Send order request"}
        </button>
      </div>
    </form>
  );
}
