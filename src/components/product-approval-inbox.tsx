"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
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

export function ProductApprovalInbox() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [isPending, startTransition] = useTransition();

  async function loadSubmissions() {
    setState("loading");

    try {
      const response = await fetch(
        "/api/product-submissions?status=pending_review&limit=8",
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Unable to load product submissions.");
      }

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

  function updateStatus(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/product-submissions/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error("Unable to update submission.");
        }

        await loadSubmissions();
      } catch {
        setState("error");
      }
    });
  }

  if (state === "loading") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        Loading pending product submissions...
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        Unable to load or update product approvals right now.
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
        No pending product submissions right now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white"
        >
          <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
            <div className="relative min-h-[160px]">
              <Image
                src={submission.heroImage}
                alt={submission.name}
                fill
                className="object-cover"
                sizes="140px"
              />
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {submission.submissionId}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                    {submission.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {submission.vendorName} | {submission.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatPrice(submission.price)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatDateTime(submission.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {submission.description}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="rounded-full bg-[rgba(242,191,99,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9c6b0b]">
                  {submission.badge}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => updateStatus(submission.id, "rejected")}
                    className="rounded-full border border-[rgba(228,90,54,0.35)] px-4 py-2 text-sm font-semibold text-[var(--accent)] disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => updateStatus(submission.id, "approved")}
                    className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
