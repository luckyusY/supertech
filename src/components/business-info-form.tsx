"use client";

import { useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type BusinessInfoFormProps = {
  vendorSlug: string;
  initialName: string;
  initialLocation: string;
  initialWhatsappNumber: string;
  initialCategories: string[];
  canEdit: boolean;
};

export function BusinessInfoForm({
  vendorSlug,
  initialName,
  initialLocation,
  initialWhatsappNumber,
  initialCategories,
  canEdit,
}: BusinessInfoFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsappNumber);
  const [categories, setCategories] = useState(initialCategories.join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/vendor-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorSlug,
          name,
          location,
          whatsappNumber,
          categories: categories
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Unable to save business info.");
      }

      setStatus("saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save business info.");
      setStatus("error");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

  return (
    <section className="soft-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">Business info</h2>
      </div>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        Update the public store details shoppers see across vendor lists and product pages.
      </p>

      {!canEdit ? (
        <p className="mt-5 rounded-[1rem] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm text-[var(--muted)]">
          This built-in SuperTech storefront is managed in code and cannot be edited here.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Business name
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setStatus("idle");
              }}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            Location
            <input
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setStatus("idle");
              }}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            WhatsApp number
            <input
              value={whatsappNumber}
              onChange={(event) => {
                setWhatsappNumber(event.target.value);
                setStatus("idle");
              }}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold">
            Categories
            <input
              value={categories}
              onChange={(event) => {
                setCategories(event.target.value);
                setStatus("idle");
              }}
              className={inputClass}
              placeholder="Mobile Essentials, Audio"
            />
          </label>

          {error ? (
            <p className="sm:col-span-2 rounded-[0.9rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void save()}
            disabled={status === "saving"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
          >
            {status === "saved" ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : status === "saving" ? (
              "Saving..."
            ) : (
              "Save business info"
            )}
          </button>
        </div>
      )}
    </section>
  );
}
