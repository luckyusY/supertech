"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Check, Copy, Loader2, PenLine, Sparkles } from "lucide-react";
import type { Product } from "@/lib/marketplace";
import { formatPrice } from "@/lib/utils";

type ProductBlogWriterProps = {
  product: Product;
  vendorName: string;
};

type BlogDraft = {
  title: string;
  excerpt: string;
  body: string;
  hashtags: string[];
};

const toneOptions = ["friendly", "premium", "educational", "social media", "storytelling"];

export function ProductBlogWriter({ product, vendorName }: ProductBlogWriterProps) {
  const [angle, setAngle] = useState("why this product is useful for everyday life");
  const [tone, setTone] = useState("friendly");
  const [audience, setAudience] = useState("everyday shoppers");
  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [editableBody, setEditableBody] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const combinedDraft = useMemo(() => {
    if (!draft) return "";

    const tags = draft.hashtags.length
      ? `\n\n${draft.hashtags.map((tag) => `#${tag}`).join(" ")}`
      : "";

    return `${draft.title}\n\n${draft.excerpt}\n\n${editableBody}${tags}`;
  }, [draft, editableBody]);

  async function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setState("loading");
    setError("");
    setCopied(false);

    try {
      const response = await fetch("/api/ai/product-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          angle,
          tone,
          audience,
        }),
      });
      const data = (await response.json()) as Partial<BlogDraft> & { error?: string };

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Unable to generate this story.");
      }

      const nextDraft = {
        title: String(data.title || ""),
        excerpt: String(data.excerpt || ""),
        body: String(data.body || ""),
        hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
      };

      setDraft(nextDraft);
      setEditableBody(nextDraft.body);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI story generation failed.");
      setState("error");
    }
  }

  async function copyDraft() {
    if (!combinedDraft) return;

    await navigator.clipboard.writeText(combinedDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="soft-card overflow-hidden bg-white">
        <div className="relative aspect-square bg-[#f7f7f7]">
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 340px, 100vw"
          />
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {product.category}
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--foreground)]">
            {product.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{product.description}</p>
          <div className="mt-4 rounded-md bg-[var(--accent-soft)] p-3">
            <p className="text-xs font-semibold text-[var(--muted)]">Vendor</p>
            <p className="mt-1 font-bold text-[var(--foreground)]">{vendorName}</p>
            <p className="mt-2 text-lg font-black text-[var(--accent)]">
              {formatPrice(product.price)}
            </p>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
          >
            View product
          </Link>
        </div>
      </aside>

      <section className="soft-card overflow-hidden bg-white">
        <div className="border-b border-[var(--line)] bg-[#fff8ef] p-4 sm:p-6">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              AI product story
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
            Write a blog about this product
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Choose an angle, generate a draft, then edit the story before sharing it.
          </p>
        </div>

        <form onSubmit={generate} className="grid gap-4 p-4 sm:p-6">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">Story angle</span>
            <textarea
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              className="min-h-24 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              placeholder="Example: how this product helps a busy student, creator, parent, vendor..."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">Tone</span>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                {toneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">Audience</span>
              <input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                placeholder="Example: students, shoppers, parents"
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--red)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={state === "loading"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-bold text-white transition-opacity disabled:opacity-65 sm:w-auto"
          >
            {state === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PenLine className="h-4 w-4" />
            )}
            {draft ? "Regenerate story" : "Generate story"}
          </button>
        </form>

        {draft ? (
          <div className="border-t border-[var(--line)] p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Editable draft
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--foreground)]">
                  {draft.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{draft.excerpt}</p>
              </div>
              <button
                type="button"
                onClick={copyDraft}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold text-[var(--foreground)]"
              >
                {copied ? <Check className="h-4 w-4 text-[#1fae5b]" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <textarea
              value={editableBody}
              onChange={(event) => setEditableBody(event.target.value)}
              className="mt-4 min-h-[360px] w-full rounded-md border border-[var(--line)] bg-[#fffdf9] px-3 py-3 text-sm leading-7 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />

            {draft.hashtags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
