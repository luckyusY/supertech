"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

type ProductRequestFormProps = {
  initialCustomer?: {
    name?: string;
    email?: string;
    city?: string;
  };
};

type ProductRequestSuccess = {
  requestId: string;
  productName: string;
  serviceType: "source_and_ship" | "price_check" | "business_bulk";
  city: string;
};

const requestOptions = [
  {
    value: "source_and_ship",
    label: "Find it and ship it to me",
  },
  {
    value: "price_check",
    label: "Send me a quote first",
  },
  {
    value: "business_bulk",
    label: "Bulk or business sourcing",
  },
] as const;

export function ProductRequestForm({ initialCustomer }: ProductRequestFormProps) {
  const [serviceType, setServiceType] = useState<
    "source_and_ship" | "price_check" | "business_bulk"
  >("source_and_ship");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Custom Request");
  const [quantity, setQuantity] = useState("1");
  const [targetBudget, setTargetBudget] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [customerName, setCustomerName] = useState(initialCustomer?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(initialCustomer?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState(initialCustomer?.city ?? "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<ProductRequestSuccess | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/product-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceType,
            productName,
            category,
            quantity: Number(quantity),
            targetBudget: targetBudget ? Number(targetBudget) : undefined,
            productUrl,
            customerName,
            customerEmail,
            customerPhone,
            city,
            deliveryAddress,
            notes,
          }),
        });

        const payload = (await response.json()) as
          | { error: string }
          | ProductRequestSuccess;

        if (!response.ok || "error" in payload) {
          throw new Error(
            "error" in payload ? payload.error : "Unable to save your request.",
          );
        }

        setSuccess(payload);
        setProductName("");
        setCategory("Custom Request");
        setQuantity("1");
        setTargetBudget("");
        setProductUrl("");
        setCustomerPhone("");
        setDeliveryAddress("");
        setNotes("");
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to save your request.",
        );
      }
    });
  }

  if (success) {
    return (
      <div className="soft-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          Request received
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
          We have your sourcing and shipping request.
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Request ID", value: success.requestId },
            { label: "Product", value: success.productName },
            { label: "Request type", value: success.serviceType.replaceAll("_", " ") },
            { label: "Delivery city", value: success.city },
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
          Our team will review the request, check pricing and availability, then get
          back to you with the next step for sourcing or shipping.
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
            href="/account"
            className="rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold"
          >
            Open my account
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
            <label className="text-sm font-semibold" htmlFor="serviceType">
              What do you need?
            </label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(event) =>
                setServiceType(
                  event.target.value as "source_and_ship" | "price_check" | "business_bulk",
                )
              }
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            >
              {requestOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="productName">
              Product name or model
            </label>
            <input
              id="productName"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              required
              placeholder="PlayStation 5 Slim 1TB"
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              />
            </div>
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
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="targetBudget">
              Target budget
            </label>
            <input
              id="targetBudget"
              type="number"
              min={0}
              step="0.01"
              value={targetBudget}
              onChange={(event) => setTargetBudget(event.target.value)}
              placeholder="Optional"
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="productUrl">
              Product link
            </label>
            <input
              id="productUrl"
              value={productUrl}
              onChange={(event) => setProductUrl(event.target.value)}
              placeholder="https://example.com/product"
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-5">
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="customerEmail">
                Email
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
            <label className="text-sm font-semibold" htmlFor="city">
              Delivery city
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
            <label className="text-sm font-semibold" htmlFor="deliveryAddress">
              Delivery address
            </label>
            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              rows={4}
              placeholder="Optional for price checks, useful for shipping estimates."
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="notes">
              Extra details
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Brand preference, color, storage size, urgency, or anything else we should know."
              className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1rem] border border-[rgba(228,90,54,0.3)] bg-[rgba(228,90,54,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
          This page is for items that are not already in the catalog. We review the
          request, source the product, and help coordinate shipping to your city.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending request..." : "Request this product"}
        </button>
      </div>
    </form>
  );
}
