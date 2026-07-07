"use client";

import { useState } from "react";
import { CheckCircle2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

type AccountProfileFormProps = {
  initialName: string;
  initialPhone: string;
  canEdit: boolean;
};

export function AccountProfileForm({
  initialName,
  initialPhone,
  canEdit,
}: AccountProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Unable to save profile.");
      }

      setStatus("saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile.");
      setStatus("error");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

  return (
    <section className="soft-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <UserRound className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">Personal info</h2>
      </div>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        Keep your customer and seller contact details up to date.
      </p>

      {!canEdit ? (
        <p className="mt-5 rounded-[1rem] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm text-[var(--muted)]">
          This sign-in profile is managed from environment settings, so it cannot be edited here.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Full name
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
            Phone or WhatsApp
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setStatus("idle");
              }}
              className={inputClass}
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
              "Save personal info"
            )}
          </button>
        </div>
      )}
    </section>
  );
}
