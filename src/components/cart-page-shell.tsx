"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/utils";

type CartOrderSuccess = {
  requestId: string;
  productName: string;
  vendorName: string;
  estimatedTotal: number;
  itemCount: number;
  customerEmail: string;
};

type CartOrderSuccessPayload = Omit<CartOrderSuccess, "customerEmail">;

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

export function CartPageShell() {
  const { isReady, items, itemCount, subtotal, clearCart, removeItem, updateQuantity } =
    useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPreference, setContactPreference] = useState("whatsapp");
  const [paymentPreference, setPaymentPreference] = useState("cash_on_delivery");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<CartOrderSuccess | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Add at least one item to your cart before placing an order.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/order-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productSlug: item.slug,
              quantity: item.quantity,
            })),
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
          | CartOrderSuccessPayload;

        if (!response.ok || "error" in result) {
          throw new Error("error" in result ? result.error : "Unable to place order. Please try again.");
        }

        setSuccess({
          ...result,
          customerEmail,
        });
        clearCart();
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setCity("");
        setDeliveryAddress("");
        setContactPreference("whatsapp");
        setPaymentPreference("cash_on_delivery");
        setNotes("");
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to place order. Please try again.",
        );
      }
    });
  }

  if (success) {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="soft-card p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Order placed
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            We have received your order.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            Our team will review your order details, confirm stock with the seller, and
            reach out within 24 hours to arrange delivery and payment.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Request ID", value: success.requestId },
              { label: "Items", value: `${success.itemCount} items` },
              { label: "Vendor coverage", value: success.vendorName },
              { label: "Estimated total", value: formatPrice(success.estimatedTotal) },
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
            >
              Start another cart
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
              Keep browsing
            </Link>
          </div>
        </section>

        <aside className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            What happens next
          </p>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
            <p>Our team contacts you within 24 hours to confirm availability and delivery details.</p>
            <p>We coordinate with the seller and arrange dispatch to your city.</p>
            <p>Use your request ID and email on the tracking page to follow your order at any time.</p>
          </div>
        </aside>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Your cart
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Loading your cart...
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Getting your saved items ready.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="soft-card p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-[rgba(15,23,42,0.06)]">
            <ShoppingBag className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Your cart
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Your cart is empty.
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">
            Browse our catalog and add items to your cart. You can order multiple
            products from different sellers in a single checkout.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/catalog"
              className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white"
            >
              Browse catalog
            </Link>
            <Link
              href="/order"
              className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Place a single order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
      <section className="soft-card p-6 sm:p-8 lg:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Your cart
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Review your items.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Add your delivery details below to place your order. Our team will confirm
          availability and coordinate delivery to your city within 24 hours.
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="grid gap-4 overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white sm:grid-cols-[140px_minmax(0,1fr)]"
            >
              <div className="relative min-h-[160px]">
                <Image
                  src={item.heroImage}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--muted)]">{item.vendorName}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {item.name}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">{item.badge}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-[rgba(15,23,42,0.03)] px-3 py-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-[var(--muted)]">
                      {formatPrice(item.price)} each
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <section className="dark-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.6)]">
            Basket summary
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <p className="text-sm text-[rgba(255,255,255,0.62)]">Items</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {itemCount}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <p className="text-sm text-[rgba(255,255,255,0.62)]">Estimated total</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {formatPrice(subtotal)}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/6 p-4 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
              Free delivery on orders over $150. Our team will confirm your order
              and arrange delivery by phone, WhatsApp, or email.
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="soft-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Customer details
          </p>
          <div className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-semibold" htmlFor="cartCustomerName">
                Full name
              </label>
              <input
                id="cartCustomerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="cartCustomerEmail">
                  Email address
                </label>
                <input
                  id="cartCustomerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="cartCustomerPhone">
                  Phone number
                </label>
                <input
                  id="cartCustomerPhone"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  required
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="cartCity">
                  City
                </label>
                <input
                  id="cartCity"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                  className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="cartContactPreference">
                  Best contact method
                </label>
                <select
                  id="cartContactPreference"
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
              <label className="text-sm font-semibold" htmlFor="cartDeliveryAddress">
                Delivery address
              </label>
              <textarea
                id="cartDeliveryAddress"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                rows={4}
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="cartPaymentPreference">
                Preferred payment method
              </label>
              <select
                id="cartPaymentPreference"
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
            <div>
              <label className="text-sm font-semibold" htmlFor="cartNotes">
                Notes
              </label>
              <textarea
                id="cartNotes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                placeholder="Preferred delivery timing, bundling notes, or special instructions."
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-[1rem] border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Placing order..." : "Place order"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Clear cart
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
