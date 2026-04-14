"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/utils";

type Submission = {
  id: string;
  submissionId: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  badge: string;
  description: string;
  heroImage: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
};

function SubmissionImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className="flex h-40 w-full items-center justify-center bg-[rgba(15,23,42,0.04)]">
        <Package className="h-10 w-10 text-[var(--muted)] opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-40 w-full object-cover"
    />
  );
}

export function ProductApprovalInbox() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  async function loadSubmissions() {
    setState("loading");
    try {
      const response = await fetch(
        "/api/product-submissions?status=pending_review&limit=8",
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Failed");
      const payload = (await response.json()) as { submissions: Submission[] };
      setSubmissions(payload.submissions);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    void loadSubmissions();
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/product-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed");
      await loadSubmissions();
    } catch {
      setState("error");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  }

  if (state === "loading") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)]">
        Loading pending submissions…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)]">
        Unable to load submissions right now.{" "}
        <button
          type="button"
          onClick={() => void loadSubmissions()}
          className="font-semibold text-[var(--foreground)] underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[1.4rem] border border-[var(--line)] bg-white p-8 text-center">
        <CheckCircle className="h-8 w-8 text-[var(--teal)] opacity-60" />
        <p className="text-sm font-semibold">All caught up!</p>
        <p className="text-xs text-[var(--muted)]">No pending product submissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {submissions.map((submission) => {
        const busy = !!processing[submission.id];
        return (
          <div
            key={submission.id}
            className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white"
          >
            {/* Product image */}
            <SubmissionImage src={submission.heroImage} alt={submission.name} />

            {/* Content */}
            <div className="p-5">
              {/* ID + meta */}
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {submission.submissionId}
                </p>
                <p className="shrink-0 text-xs text-[var(--muted)]">
                  {formatDateTime(submission.createdAt)}
                </p>
              </div>

              {/* Name + price */}
              <div className="mt-2 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-snug tracking-[-0.02em]">
                  {submission.name}
                </h3>
                <p className="shrink-0 text-base font-semibold">
                  {formatPrice(submission.price)}
                </p>
              </div>

              {/* Vendor + category */}
              <p className="mt-1 text-sm text-[var(--muted)]">
                {submission.vendorName} &middot; {submission.category}
              </p>

              {/* Description */}
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
                {submission.description}
              </p>

              {/* Badge */}
              <div className="mt-3">
                <span className="rounded-full bg-[rgba(245,158,11,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9c6b0b]">
                  {submission.badge}
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void updateStatus(submission.id, "rejected")}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-[rgba(37,99,235,0.4)] py-2.5 text-sm font-semibold text-[var(--accent)] transition-opacity disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {busy ? "…" : "Reject"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void updateStatus(submission.id, "approved")}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--foreground)] py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {busy ? "…" : "Approve"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
