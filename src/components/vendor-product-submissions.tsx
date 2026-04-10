"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatDateTime, formatPrice } from "@/lib/utils";

type Submission = {
  id: string;
  submissionId: string;
  vendorName: string;
  name: string;
  category: string;
  price: number;
  badge: string;
  heroImage: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
};

type VendorProductSubmissionsProps = {
  vendorSlug: string;
  refreshKey: number;
};

export function VendorProductSubmissions({
  vendorSlug,
  refreshKey,
}: VendorProductSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    let isActive = true;

    async function loadSubmissions() {
      setState("loading");

      try {
        const response = await fetch(
          `/api/product-submissions?vendorSlug=${encodeURIComponent(vendorSlug)}&limit=8`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Unable to load product submissions.");
        }

        const payload = (await response.json()) as { submissions: Submission[] };

        if (isActive) {
          setSubmissions(payload.submissions);
          setState("ready");
        }
      } catch {
        if (isActive) {
          setState("error");
        }
      }
    }

    loadSubmissions();

    return () => {
      isActive = false;
    };
  }, [refreshKey, vendorSlug]);

  if (state === "loading") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-4 text-sm text-[var(--muted)]">
        Loading product submissions...
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-4 text-sm text-[var(--muted)]">
        Unable to load product submissions right now.
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-4 text-sm text-[var(--muted)]">
        No submissions yet for this vendor.
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
            <div className="relative min-h-[140px]">
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
                  <p className="mt-1 text-sm text-[var(--muted)]">{submission.category}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      submission.status === "approved"
                        ? "bg-[rgba(26,123,112,0.12)] text-[var(--teal)]"
                        : submission.status === "rejected"
                          ? "bg-[rgba(228,90,54,0.14)] text-[var(--accent)]"
                          : "bg-[rgba(242,191,99,0.18)] text-[#9c6b0b]"
                    }`}
                  >
                    {submission.status.replaceAll("_", " ")}
                  </span>
                  <p className="mt-3 text-lg font-semibold">{formatPrice(submission.price)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 text-sm text-[var(--muted)]">
                <p>{submission.badge}</p>
                <p>{formatDateTime(submission.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
