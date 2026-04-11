"use client";

import { useEffect, useState } from "react";
import { Clock, Package } from "lucide-react";
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

const STATUS_STYLES: Record<
  Submission["status"],
  { label: string; pill: string }
> = {
  pending_review: {
    label: "Pending review",
    pill: "bg-[rgba(242,191,99,0.18)] text-[#9c6b0b]",
  },
  approved: {
    label: "Approved",
    pill: "bg-[rgba(26,123,112,0.12)] text-[var(--teal)]",
  },
  rejected: {
    label: "Rejected",
    pill: "bg-[rgba(228,90,54,0.14)] text-[var(--accent)]",
  },
};

function SubmissionThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.8rem] bg-[rgba(16,32,25,0.06)]">
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

export function VendorProductSubmissions({
  vendorSlug,
  refreshKey,
}: VendorProductSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");

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
            <li key={sub.id} className="flex items-center gap-4 px-5 py-4">
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
