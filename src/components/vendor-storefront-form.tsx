"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { CheckCircle2, ImagePlus, Trash2 } from "lucide-react";

type VendorStorefrontFormProps = {
  vendorSlug: string;
  vendorName: string;
  initialCoverImage: string;
  initialLogoMark: string;
  initialHeadline: string;
  accent: string;
  canEdit: boolean;
};

function extractSecureUrl(result: unknown) {
  if (
    typeof result === "object" &&
    result !== null &&
    "info" in result &&
    typeof result.info === "object" &&
    result.info !== null &&
    "secure_url" in result.info &&
    typeof result.info.secure_url === "string"
  ) {
    return result.info.secure_url;
  }

  return null;
}

export function VendorStorefrontForm({
  vendorSlug,
  vendorName,
  initialCoverImage,
  initialLogoMark,
  initialHeadline,
  accent,
  canEdit,
}: VendorStorefrontFormProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const uploadsEnabled = Boolean(cloudName && apiKey);

  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [logoMark, setLogoMark] = useState(initialLogoMark);
  const [headline, setHeadline] = useState(initialHeadline);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  // Reset local state when the selected vendor changes (admin switching).
  useEffect(() => {
    setCoverImage(initialCoverImage);
    setLogoMark(initialLogoMark);
    setHeadline(initialHeadline);
    setStatus("idle");
    setError("");
  }, [vendorSlug, initialCoverImage, initialLogoMark, initialHeadline]);

  async function persist(overrides?: {
    coverImage?: string;
    logoMark?: string;
    headline?: string;
  }) {
    const payload = {
      vendorSlug,
      coverImage: overrides?.coverImage ?? coverImage,
      logoMark: overrides?.logoMark ?? logoMark,
      headline: overrides?.headline ?? headline,
    };

    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/vendor-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok || result.error) {
        throw new Error(result.error ?? "Unable to save storefront.");
      }

      setStatus("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save storefront.");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-[0.75rem] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

  return (
    <section className="soft-card p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <ImagePlus className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">
          Storefront branding
        </h2>
      </div>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        This cover image and logo appear on your public store page and in the
        vendor directory.
      </p>

      {!canEdit ? (
        <div className="mt-6 rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-4 text-sm text-[var(--muted)]">
          This storefront is managed by SuperTech and can&apos;t be edited here.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Cover image */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Cover image
            </p>
            <div className="relative mt-2 aspect-[16/8.4] overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-[rgba(15,23,42,0.04)]">
              {coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt={`${vendorName} cover`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  <div
                    className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
                    style={{ backgroundColor: accent }}
                  >
                    {logoMark || vendorName.slice(0, 1).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--muted)]">
                  <ImagePlus className="h-7 w-7 opacity-40" />
                  <p className="text-xs">No cover image yet</p>
                </div>
              )}
            </div>

            {uploadsEnabled ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <CldUploadWidget
                  signatureEndpoint="/api/cloudinary/sign"
                  options={{
                    folder: "supertech/vendors",
                    multiple: false,
                    maxFiles: 1,
                    sources: ["local", "url", "camera"],
                    resourceType: "image",
                    clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  }}
                  onSuccess={(result) => {
                    const secureUrl = extractSecureUrl(result);
                    if (secureUrl) {
                      setCoverImage(secureUrl);
                      // Persist immediately so the cover survives a refresh
                      // without needing a separate save click.
                      void persist({ coverImage: secureUrl });
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {coverImage ? "Replace cover" : "Upload cover"}
                    </button>
                  )}
                </CldUploadWidget>
                {coverImage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage("");
                      void persist({ coverImage: "" });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 rounded-[1rem] border border-dashed border-[var(--line)] bg-[rgba(15,23,42,0.03)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and
                `NEXT_PUBLIC_CLOUDINARY_API_KEY` to enable cover uploads.
              </div>
            )}
          </div>

          {/* Text fields */}
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Logo initials
              </span>
              <input
                value={logoMark}
                onChange={(event) => {
                  setLogoMark(event.target.value.slice(0, 3));
                  setStatus("idle");
                }}
                maxLength={3}
                placeholder={vendorName.slice(0, 1).toUpperCase()}
                className={inputClass}
              />
              <span className="text-[11px] text-[var(--muted)]">
                Up to 3 characters shown on the logo badge.
              </span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Headline
              </span>
              <textarea
                value={headline}
                onChange={(event) => {
                  setHeadline(event.target.value.slice(0, 160));
                  setStatus("idle");
                }}
                rows={3}
                maxLength={160}
                placeholder="A short tagline for your store"
                className={`${inputClass} resize-none`}
              />
              <span className="text-[11px] text-[var(--muted)]">
                {headline.length}/160
              </span>
            </label>

            {error ? (
              <p className="rounded-[0.75rem] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void persist()}
              disabled={status === "saving"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {status === "saved" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </>
              ) : status === "saving" ? (
                "Saving..."
              ) : (
                "Save storefront"
              )}
            </button>
            <p className="text-center text-[11px] text-[var(--muted)]">
              Cover image saves automatically on upload. Use this button to
              save logo initials and headline changes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
