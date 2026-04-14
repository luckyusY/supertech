"use client";

import { useState, useTransition } from "react";
import { ImagePlus, Package, Send, Tag, Truck } from "lucide-react";
import { ProductImageUploader } from "@/components/product-image-uploader";
import type { Vendor } from "@/lib/marketplace";

// Must match the categories used across the public site catalog
const SITE_CATEGORIES = [
  "Home Control",
  "Mobile Essentials",
  "Creator Gear",
  "Gaming",
  "Audio",
  "Wearables",
] as const;

const BADGE_OPTIONS = [
  "New listing",
  "Best seller",
  "Limited stock",
  "Editor's pick",
  "Sale",
  "Pre-order",
];

const STOCK_OPTIONS = [
  "In stock",
  "Limited stock",
  "Only 3 left",
  "Pre-order",
  "Out of stock",
];

const SHIP_OPTIONS = [
  "Ships within 24h",
  "Ships within 48h",
  "Ships within 3–5 days",
  "Ships within 1 week",
];

type Props = {
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
}: Props) {
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
          headers: { "Content-Type": "application/json" },
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
            features: features.split("\n").map((f) => f.trim()).filter(Boolean),
            heroImage: images[0] ?? "",
            gallery: images.slice(1),
          }),
        });

        const result = (await response.json()) as { error?: string; submissionId?: string; name?: string };

        if (!response.ok || result.error) {
          throw new Error(result.error ?? "Unable to submit product.");
        }

        setSuccessMessage(`"${result.name ?? name}" submitted for admin review.`);
        resetForm();
        onSubmitted();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to submit product.");
      }
    });
  }

  const inputClass =
    "w-full rounded-[0.9rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30";
  const selectClass =
    "w-full rounded-[0.9rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="soft-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-[var(--line)] bg-[rgba(15,23,42,0.02)] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Product listing
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Add a product for review
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Once submitted, an admin will review and publish it to the catalog.
            </p>
          </div>

          {/* Vendor selector */}
          <div className="w-full sm:w-56">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Selling as
            </p>
            {canSwitchVendor ? (
              <select
                value={vendorSlug}
                onChange={(e) => onVendorChange(e.target.value)}
                className={`mt-2 ${selectClass}`}
              >
                {availableVendors.map((v) => (
                  <option key={v.slug} value={v.slug}>{v.name}</option>
                ))}
              </select>
            ) : (
              <div className="mt-2 rounded-[0.9rem] border border-[var(--line)] bg-[rgba(15,23,42,0.04)] px-4 py-3 text-sm font-semibold">
                {availableVendors[0]?.name ?? "Your store"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Section: Basic info */}
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Product details
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              Product name <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Category <span className="text-[var(--accent)]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={selectClass}
            >
              <option value="">Select a category</option>
              {SITE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Badge label</label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className={selectClass}
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Price (USD) <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Compare-at price{" "}
              <span className="font-normal text-[var(--muted)]">(strikethrough, optional)</span>
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              Description <span className="text-[var(--accent)]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="What does this product do? Who is it for? What makes it worth buying?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">
              Key features{" "}
              <span className="font-normal text-[var(--muted)]">(one per line, up to 8)</span>
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={5}
              placeholder={"Active noise cancellation\n40h battery life\nUSB-C fast charging\nFoldable design"}
              className={`${inputClass} resize-none font-mono text-xs leading-6`}
            />
          </div>
        </div>

        {/* Section: Availability */}
        <div className="mt-8 flex items-center gap-2 border-t border-[var(--line)] pt-6">
          <Truck className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Availability &amp; shipping
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Stock status</label>
            <select
              value={stockLabel}
              onChange={(e) => setStockLabel(e.target.value)}
              className={selectClass}
            >
              {STOCK_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Shipping window</label>
            <select
              value={shipWindow}
              onChange={(e) => setShipWindow(e.target.value)}
              className={selectClass}
            >
              {SHIP_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section: Images */}
        <div className="mt-8 flex items-center gap-2 border-t border-[var(--line)] pt-6">
          <ImagePlus className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Product images
          </p>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          First image becomes the hero. Add up to 4 total.
        </p>
        <div className="mt-4">
          <ProductImageUploader images={images} onChange={setImages} />
        </div>

        {/* Feedback */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-[0.9rem] border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-4 py-3">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
            <p className="text-sm text-[var(--accent)]">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mt-6 rounded-[0.9rem] border border-[rgba(8,145,178,0.25)] bg-[rgba(8,145,178,0.08)] px-4 py-3 text-sm font-medium text-[var(--teal)]">
            ✓ {successMessage}
          </div>
        )}

        {/* Submit */}
        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Products go live after admin approval — usually within 24 hours.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isPending ? "Submitting..." : "Submit for review"}
          </button>
        </div>
      </div>
    </form>
  );
}
