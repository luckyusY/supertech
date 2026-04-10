"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

type ProductImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function ProductImageUploader({
  images,
  onChange,
}: ProductImageUploaderProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const disabled = !cloudName || !apiKey;

  function handleRemove(index: number) {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  }

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-white"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image}
                alt={`Uploaded product asset ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 33vw, 100vw"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {index === 0 ? "Hero image" : `Gallery ${index}`}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {disabled ? (
        <div className="rounded-[1rem] border border-dashed border-[var(--line)] bg-[rgba(16,32,25,0.03)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
          Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_API_KEY`
          to enable seller uploads.
        </div>
      ) : (
        <CldUploadWidget
          signatureEndpoint="/api/cloudinary/sign"
          options={{
            folder: "supertech/products",
            multiple: true,
            maxFiles: 4,
            sources: ["local", "url", "camera"],
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          }}
          onSuccess={(result) => {
            const secureUrl = extractSecureUrl(result);

            if (secureUrl) {
              onChange([...images, secureUrl].slice(0, 4));
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
            >
              Upload product images
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
