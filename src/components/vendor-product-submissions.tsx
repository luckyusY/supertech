"use client";

import { useEffect, useState } from "react";
import { Clock, Package, Pencil, Save, X } from "lucide-react";
import { ProductImageUploader } from "@/components/product-image-uploader";
import {
  BADGE_OPTIONS,
  PRODUCT_LISTING_CATEGORIES,
  SHIP_OPTIONS,
  STOCK_OPTIONS,
} from "@/lib/product-listing-options";
import { formatDateTime, formatPrice } from "@/lib/utils";

type Submission = {
  id: string;
  submissionId: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  badge: string;
  stockLabel: string;
  shipWindow: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

type VendorProductSubmissionsProps = {
  vendorSlug: string;
  refreshKey: number;
  categories: string[];
  onUpdated: () => void;
};

const STATUS_STYLES: Record<
  Submission["status"],
  { label: string; pill: string }
> = {
  pending_review: {
    label: "Pending review",
    pill: "bg-[rgba(245,158,11,0.18)] text-[#9c6b0b]",
  },
  approved: {
    label: "Approved",
    pill: "bg-[rgba(8,145,178,0.12)] text-[var(--teal)]",
  },
  rejected: {
    label: "Rejected",
    pill: "bg-[rgba(37,99,235,0.14)] text-[var(--accent)]",
  },
};

function SubmissionThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.8rem] bg-[rgba(15,23,42,0.06)]">
        <Package className="h-5 w-5 text-[var(--muted)] opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-[0.8rem] object-cover"
    />
  );
}

function uniqueOptions(options: readonly string[], currentValue?: string) {
  return Array.from(new Set([...(currentValue ? [currentValue] : []), ...options]));
}

type SubmissionEditFormProps = {
  submission: Submission;
  categories: string[];
  onCancel: () => void;
  onSaved: (submission: Submission) => void;
};

function SubmissionEditForm({
  submission,
  categories,
  onCancel,
  onSaved,
}: SubmissionEditFormProps) {
  const [name, setName] = useState(submission.name);
  const [category, setCategory] = useState(submission.category);
  const [price, setPrice] = useState(String(submission.price));
  const [compareAt, setCompareAt] = useState(
    submission.compareAt ? String(submission.compareAt) : "",
  );
  const [badge, setBadge] = useState(submission.badge);
  const [stockLabel, setStockLabel] = useState(submission.stockLabel);
  const [shipWindow, setShipWindow] = useState(submission.shipWindow);
  const [description, setDescription] = useState(submission.description);
  const [features, setFeatures] = useState(submission.features.join("\n"));
  const [images, setImages] = useState(
    Array.from(new Set([submission.heroImage, ...submission.gallery].filter(Boolean))).slice(
      0,
      4,
    ),
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const categoryOptions =
    categories.length > 0 ? categories : [...PRODUCT_LISTING_CATEGORIES];
  const inputClass =
    "w-full rounded-[0.75rem] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/product-submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          compareAt: compareAt ? Number(compareAt) : undefined,
          badge,
          stockLabel,
          shipWindow,
          description,
          features: features
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean),
          heroImage: images[0] ?? "",
          gallery: images.slice(1),
        }),
      });
      const result = (await response.json()) as Submission & { error?: string };

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Unable to update product.");
      }

      onSaved(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update product.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-t border-[var(--line)] bg-white px-5 py-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Product name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            className={inputClass}
          >
            {uniqueOptions(categoryOptions, category).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Badge
          </span>
          <select
            value={badge}
            onChange={(event) => setBadge(event.target.value)}
            className={inputClass}
          >
            {uniqueOptions(BADGE_OPTIONS, badge).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Price
          </span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Compare-at
          </span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={compareAt}
            onChange={(event) => setCompareAt(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Stock
          </span>
          <select
            value={stockLabel}
            onChange={(event) => setStockLabel(event.target.value)}
            className={inputClass}
          >
            {uniqueOptions(STOCK_OPTIONS, stockLabel).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Shipping
          </span>
          <select
            value={shipWindow}
            onChange={(event) => setShipWindow(event.target.value)}
            className={inputClass}
          >
            {uniqueOptions(SHIP_OPTIONS, shipWindow).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Description
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Key features
        </span>
        <textarea
          value={features}
          onChange={(event) => setFeatures(event.target.value)}
          rows={4}
          className={`${inputClass} resize-none font-mono text-xs leading-6`}
        />
      </label>

      <ProductImageUploader images={images} onChange={setImages} />

      {error ? (
        <p className="rounded-[0.75rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export function VendorProductSubmissions({
  vendorSlug,
  refreshKey,
  categories,
  onUpdated,
}: VendorProductSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setState("loading");
      try {
        const response = await fetch(
          `/api/product-submissions?vendorSlug=${encodeURIComponent(vendorSlug)}&limit=10`,
          { cache: "no-store" },
        );
        if (!response.ok) throw new Error("Failed");
        const payload = (await response.json()) as { submissions: Submission[] };
        if (active) {
          setSubmissions(payload.submissions);
          setEditingId(null);
          setState("ready");
        }
      } catch {
        if (active) setState("error");
      }
    }

    void load();
    return () => { active = false; };
  }, [refreshKey, vendorSlug]);

  if (state === "loading") {
    return (
      <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">
        Loading your submissions…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">
        Unable to load submissions right now.
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white/70 p-8 text-center">
        <Package className="h-7 w-7 text-[var(--muted)] opacity-40" />
        <p className="text-sm font-semibold">No submissions yet</p>
        <p className="text-xs text-[var(--muted)]">
          Submit a product above — it will appear here after review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-white/70">
      <ul className="divide-y divide-[var(--line)]">
        {submissions.map((sub) => {
          const st = STATUS_STYLES[sub.status];
          return (
            <li key={sub.id}>
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Thumbnail */}
                <SubmissionThumb src={sub.heroImage} alt={sub.name} />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
                    <p className="truncate text-sm font-semibold leading-snug">
                      {sub.name}
                    </p>
                    <p className="shrink-0 text-sm font-semibold">
                      {formatPrice(sub.price)}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                    {sub.category} &middot; {sub.badge}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${st.pill}`}
                    >
                      {st.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(sub.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingId((current) => current === sub.id ? null : sub.id)}
                  className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                  aria-label={`Edit ${sub.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              {editingId === sub.id ? (
                <SubmissionEditForm
                  submission={sub}
                  categories={categories}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updated) => {
                    setSubmissions((current) =>
                      current.map((item) => item.id === updated.id ? updated : item),
                    );
                    setEditingId(null);
                    onUpdated();
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
