"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Review = {
  reviewId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
};

type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
};

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[rgba(15,23,42,0.15)]"}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productSlug=${encodeURIComponent(productSlug)}`)
      .then((r) => r.json())
      .then((data: { reviews?: Review[]; summary?: ReviewSummary }) => {
        setReviews(data.reviews ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [productSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, customerName: name, customerEmail: email, rating, title, body }),
      });
      const data = (await res.json()) as { reviewId?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to submit.");
      setSubmitted(true);
      setShowForm(false);
      setReviews((prev) => [
        { reviewId: data.reviewId!, customerName: name, rating, title, body, verified: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      if (summary) setSummary({ ...summary, totalReviews: summary.totalReviews + 1 });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="h-24 animate-pulse rounded-[1.5rem] bg-[rgba(15,23,42,0.05)]" />;
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">Customer reviews</h2>
          {summary && summary.totalReviews > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={Math.round(summary.averageRating)} />
              <span className="text-sm text-[var(--muted)]">
                {summary.averageRating} · {summary.totalReviews} reviews
              </span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:bg-[var(--foreground)] hover:text-white"
          >
            {showForm ? "Cancel" : "Write a review"}
          </button>
        )}
      </div>

      {submitted && (
        <div className="mt-4 rounded-[1.2rem] border border-[rgba(8,145,178,0.3)] bg-[rgba(8,145,178,0.08)] px-4 py-3 text-sm text-[var(--teal)]">
          Thanks for your review!
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="rv-name">Name</label>
              <input id="rv-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-[0.9rem] border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="rv-email">Email</label>
              <input id="rv-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-[0.9rem] border border-[var(--line)] px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Rating</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" onClick={() => setRating(i)} className="p-0.5">
                  <Star
                    className={`h-6 w-6 ${i <= rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[rgba(15,23,42,0.2)]"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="rv-title">Title</label>
            <input id="rv-title" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-[0.9rem] border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="rv-body">Review</label>
            <textarea id="rv-body" required rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 w-full rounded-[0.9rem] border border-[var(--line)] px-3 py-2 text-sm" />
          </div>
          {formError && <p className="text-sm text-[var(--accent)]">{formError}</p>}
          <button type="submit" disabled={submitting} className="rounded-full bg-[var(--foreground)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.reviewId} className="rounded-[1.4rem] border border-[var(--line)] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Stars rating={r.rating} size={14} />
                  <p className="mt-2 font-semibold tracking-[-0.03em]">{r.title}</p>
                </div>
                <div className="text-right text-xs text-[var(--muted)]">
                  <p>{r.customerName}</p>
                  {r.verified && <p className="text-[var(--teal)]">Verified</p>}
                  <p>{formatDate(r.createdAt)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
