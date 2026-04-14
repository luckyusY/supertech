"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Clock, Copy, KeyRound, MapPin, Store, XCircle } from "lucide-react";

type Application = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  category: string;
  location: string;
  description: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type ApprovalResult = {
  id: string;
  email: string;
  tempPassword: string | null;
  vendorSlug: string;
};

type Props = {
  initialApplications: Application[];
};

export function VendorApplicationsInbox({ initialApplications }: Props) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [loading, setLoading] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null);

  async function review(id: string, status: "approved" | "rejected") {
    setLoading(id);
    setApprovalResult(null);
    try {
      const res = await fetch(`/api/vendor-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          success: boolean;
          email?: string;
          tempPassword?: string | null;
          vendorSlug?: string;
        };
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status } : a)),
        );
        if (status === "approved" && data.tempPassword) {
          setApprovalResult({
            id,
            email: data.email ?? "",
            tempPassword: data.tempPassword,
            vendorSlug: data.vendorSlug ?? "",
          });
        }
      }
    } finally {
      setLoading(null);
    }
  }

  const pending = applications.filter((a) => a.status === "pending");
  const reviewed = applications.filter((a) => a.status !== "pending");

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[1.4rem] border border-dashed border-[var(--line)] py-10 text-center">
        <Store className="h-8 w-8 text-[var(--muted)]" />
        <div>
          <p className="font-semibold">No applications yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">New vendor applications will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Temp password banner shown after approval */}
      {approvalResult?.tempPassword && (
        <div className="rounded-[1.4rem] border border-[rgba(8,145,178,0.3)] bg-[rgba(8,145,178,0.06)] p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-[var(--teal)]" />
            <p className="font-semibold text-[var(--teal)]">Vendor account created</p>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This vendor had no existing account. A new one was created. Share these credentials with them:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <CredentialBox label="Email" value={approvalResult.email} />
            <CredentialBox label="Temporary password" value={approvalResult.tempPassword} highlight />
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            The vendor should sign in at <strong>/sign-in</strong> with these credentials. They can change their password after logging in.
          </p>
          <button
            onClick={() => setApprovalResult(null)}
            className="mt-3 text-xs text-[var(--muted)] underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-600">
            <Clock className="h-4 w-4" />
            Awaiting review ({pending.length})
          </p>
          <div className="space-y-4">
            {pending.map((app) => (
              <ApplicationCard
                key={String(app._id)}
                app={app}
                loading={loading === String(app._id)}
                onApprove={() => review(String(app._id), "approved")}
                onReject={() => review(String(app._id), "rejected")}
              />
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--muted)]">
            Previously reviewed ({reviewed.length})
          </p>
          <div className="space-y-3">
            {reviewed.map((app) => (
              <div
                key={String(app._id)}
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[var(--line)] bg-white/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{app.businessName}</p>
                  <p className="text-[var(--muted)]">{app.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    app.status === "approved"
                      ? "bg-[rgba(8,145,178,0.1)] text-[var(--teal)]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {app.status === "approved" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CredentialBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`rounded-[1rem] border p-3 ${highlight ? "border-[var(--teal)] bg-white" : "border-[var(--line)] bg-white/70"}`}>
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className={`font-mono text-sm font-semibold ${highlight ? "text-[var(--teal)]" : ""}`}>{value}</p>
        <button onClick={copy} className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)]">
          {copied ? <CheckCircle2 className="h-4 w-4 text-[var(--teal)]" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ApplicationCard({
  app,
  loading,
  onApprove,
  onReject,
}: {
  app: Application;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/72 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[rgba(15,23,42,0.06)]">
            <Building2 className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div>
            <p className="font-semibold tracking-[-0.02em]">{app.businessName}</p>
            <p className="text-sm text-[var(--muted)]">{app.category}</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
          Pending
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">Contact:</span> {app.name}
        </div>
        <div className="text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">Email:</span> {app.email}
        </div>
        {app.phone && (
          <div className="text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">Phone:</span> {app.phone}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[var(--muted)]">
          <MapPin className="h-3.5 w-3.5" /> {app.location}
        </div>
        {app.website && (
          <div className="text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">Website:</span>{" "}
            <a href={app.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {app.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
        <div className="text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">Applied:</span>{" "}
          {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{app.description}</p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={onApprove}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--teal)] py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Processing..." : "Approve"}
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
      </div>
    </div>
  );
}
