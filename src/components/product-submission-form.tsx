"use client";

import { useState, useTransition } from "react";
import { ProductImageUploader } from "@/components/product-image-uploader";
import type { Vendor } from "@/lib/marketplace";

type ProductSubmissionFormProps = {
  availableVendors: Vendor[];
  canSwitchVendor: boolean;
  vendorSlug: string;
  onVendorChange: (vendorSlug: string) => void;
  onSubmitted: () => void;
};

export function ProductSubmissionForm({
  availableVendors,
  canSwitchVendor,
  vendorSlug,
  onVendorChange,
  onSubmitted,
}: ProductSubmissionFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [badge, setBadge] = useState("New listing");
  const [stockLabel, setStockLabel] = useState("In stock");
  const [shipWindow, setShipWindow] = useState("Ships within 48h");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setCategory("");
    setPrice("");
    setCompareAt("");
    setBadge("New listing");
    setStockLabel("In stock");
    setShipWindow("Ships within 48h");
    setDescription("");
    setFeatures("");
    setImages([]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/product-submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendorSlug,
            name,
            category,
            price: Number(price),
            compareAt: compareAt ? Number(compareAt) : undefined,
            badge,
            stockLabel,
            shipWindow,
            description,
            features: features
              .split(",")
              .map((feature) => feature.trim())
              .filter(Boolean),
            heroImage: images[0] ?? "",
            gallery: images.slice(1),
          }),
        });

        const result = (await response.json()) as
          | { error: string }
          | { submissionId: string; name: string };

        if (!response.ok || "error" in result) {
          throw new Error(
            "error" in result ? result.error : "Unable to submit product.",
          );
        }

        setSuccessMessage("Product submitted for admin review.");
        resetForm();
        onSubmitted();
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to submit product.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="soft-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Seller product composer
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Submit a product for review
          </h2>
        </div>
        <div className="min-w-[220px]">
          {canSwitchVendor ? (
            <>
              <label className="text-sm font-semibold" htmlFor="vendorSlug">
                Vendor
              </label>
              <select
                id="vendorSlug"
                value={vendorSlug}
                onChange={(event) => onVendorChange(event.target.value)}
                className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
              >
                {availableVendors.map((vendor) => (
                  <option key={vendor.slug} value={vendor.slug}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Vendor</p>
              <div className="mt-2 rounded-[1rem] border border-[var(--line)] bg-[rgba(16,32,25,0.03)] px-4 py-3 text-sm font-medium">
                {availableVendors[0]?.name ?? "Assigned vendor"}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-semibold" htmlFor="name">
            Product name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            placeholder="Creator Gear"
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            type="number"
            min="1"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="compareAt">
            Compare-at price
          </label>
          <input
            id="compareAt"
            type="number"
            min="1"
            step="0.01"
            value={compareAt}
            onChange={(event) => setCompareAt(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="badge">
            Badge
          </label>
          <input
            id="badge"
            value={badge}
            onChange={(event) => setBadge(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="stockLabel">
            Stock label
          </label>
          <input
            id="stockLabel"
            value={stockLabel}
            onChange={(event) => setStockLabel(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-semibold" htmlFor="shipWindow">
            Shipping window
          </label>
          <input
            id="shipWindow"
            value={shipWindow}
            onChange={(event) => setShipWindow(event.target.value)}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-semibold" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={5}
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-semibold" htmlFor="features">
            Features
          </label>
          <textarea
            id="features"
            value={features}
            onChange={(event) => setFeatures(event.target.value)}
            rows={3}
            placeholder="Hidden cable channel, Tool-free tilt, Desk clamp mount"
            className="mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-sm font-semibold">Product images</label>
          <div className="mt-3">
            <ProductImageUploader images={images} onChange={setImages} />
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-[1rem] border border-[rgba(228,90,54,0.3)] bg-[rgba(228,90,54,0.08)] px-4 py-3 text-sm text-[var(--accent)]">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-[1rem] border border-[rgba(26,123,112,0.24)] bg-[rgba(26,123,112,0.08)] px-4 py-3 text-sm text-[var(--teal)]">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Products submitted here stay in review until the admin approves them.
          This keeps the catalog clean while you are still shaping the seller flow.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Submitting..." : "Submit product"}
        </button>
      </div>
    </form>
  );
}
