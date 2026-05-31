"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Wallet } from "lucide-react";
import { MomoPayCard } from "@/components/momo-pay-card";
import {
  DEFAULT_MOMO_BUSINESS_NAME,
  DEFAULT_MOMO_MERCHANT_CODE,
} from "@/lib/payment-methods";

type VendorPaymentFormProps = {
  vendorSlug: string;
  initialMerchantCode: string;
  initialBusinessName: string;
  canEdit: boolean;
};

export function VendorPaymentForm({
  vendorSlug,
  initialMerchantCode,
  initialBusinessName,
  canEdit,
}: VendorPaymentFormProps) {
  const [merchantCode, setMerchantCode] = useState(
    initialMerchantCode || DEFAULT_MOMO_MERCHANT_CODE,
  );
  const [businessName, setBusinessName] = useState(
    initialBusinessName || DEFAULT_MOMO_BUSINESS_NAME,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setMerchantCode(initialMerchantCode || DEFAULT_MOMO_MERCHANT_CODE);
    setBusinessName(initialBusinessName || DEFAULT_MOMO_BUSINESS_NAME);
    setStatus("idle");
    setError("");
  }, [vendorSlug, initialMerchantCode, initialBusinessName]);

  const usingDefault =
    merchantCode === DEFAULT_MOMO_MERCHANT_CODE &&
    businessName === DEFAULT_MOMO_BUSINESS_NAME;

  async function handleSave() {
    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/vendor-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorSlug,
          momoMerchantCode: merchantCode,
          momoBusinessName: businessName,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Unable to save payment method.");
      }

      setStatus("saved");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save payment method.",
      );
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-[0.75rem] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

  return (
    <section className="soft-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Wallet className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          Payment method
        </h2>
      </div>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        Customers see this MTN MoMoPay card to pay for your orders.
        {usingDefault
          ? " You're currently using the SuperTech default — replace it with your own merchant code below."
          : ""}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Live preview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Preview
          </p>
          <div className="mt-2">
            <MomoPayCard merchantCode={merchantCode} businessName={businessName} />
          </div>
        </div>

        {/* Editable fields */}
        {canEdit ? (
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                MoMoPay merchant code
              </span>
              <input
                value={merchantCode}
                onChange={(event) => {
                  setMerchantCode(
                    event.target.value.replace(/[^\d]/g, "").slice(0, 12),
                  );
                  setStatus("idle");
                }}
                inputMode="numeric"
                placeholder={DEFAULT_MOMO_MERCHANT_CODE}
                className={inputClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Registered business name
              </span>
              <input
                value={businessName}
                onChange={(event) => {
                  setBusinessName(event.target.value.slice(0, 60));
                  setStatus("idle");
                }}
                placeholder={DEFAULT_MOMO_BUSINESS_NAME}
                className={inputClass}
              />
            </label>

            {error ? (
              <p className="rounded-[0.75rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={status === "saving"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {status === "saved" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                  </>
                ) : status === "saving" ? (
                  "Saving..."
                ) : (
                  "Save payment method"
                )}
              </button>
              {!usingDefault ? (
                <button
                  type="button"
                  onClick={() => {
                    setMerchantCode(DEFAULT_MOMO_MERCHANT_CODE);
                    setBusinessName(DEFAULT_MOMO_BUSINESS_NAME);
                    setStatus("idle");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]"
                >
                  Reset to default
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
            This storefront is managed by SuperTech and its payment method
            can&apos;t be edited here.
          </div>
        )}
      </div>
    </section>
  );
}
