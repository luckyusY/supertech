"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, PenLine, Rocket, Search, Sparkles } from "lucide-react";
import type { Product } from "@/lib/marketplace";
import { formatPrice } from "@/lib/utils";

type ProductBlogWriterProps = {
  product: Product;
  vendorName: string;
};

type BlogDraft = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
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
  const [copied, setCopied] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "done" | "error">("idle");
  const [publishError, setPublishError] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");

  const combinedDraft = useMemo(() => {
    if (!draft) return "";

    const tags = draft.hashtags.length
      ? `\n\n${draft.hashtags.map((tag) => `#${tag}`).join(" ")}`
      : "";

    return `# ${draft.title}\n\n${draft.excerpt}\n\n${editableBody}${tags}`;
  }, [draft, editableBody]);

  async function generate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setState("loading");
    setError("");
    setCopied(null);

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

      const nextDraft: BlogDraft = {
        title: String(data.title || ""),
        metaTitle: String(data.metaTitle || data.title || ""),
        metaDescription: String(data.metaDescription || data.excerpt || ""),
        slug: String(data.slug || ""),
        keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
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

  async function copyText(value: string, key: string) {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1800);
  }

  async function publish() {
    if (!draft) return;

    setPublishState("publishing");
    setPublishError("");

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          title: draft.title,
          metaTitle: draft.metaTitle,
          metaDescription: draft.metaDescription,
          slug: draft.slug,
          excerpt: draft.excerpt,
          body: editableBody,
          keywords: draft.keywords,
          hashtags: draft.hashtags,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || data.error || !data.url) {
        throw new Error(data.error ?? "Unable to publish this blog.");
      }

      setPublishedUrl(data.url);
      setPublishState("done");
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Unable to publish this blog.");
      setPublishState("error");
    }
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
              AI SEO blog writer
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
            Write an SEO blog about this product
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Pick a focus keyword and tone, then generate a search-optimized article with meta title, description, slug, and keywords — ready to publish.
          </p>
        </div>

        <form onSubmit={generate} className="grid gap-4 p-4 sm:p-6">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              Focus keyword / angle
            </span>
            <textarea
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              className="min-h-24 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              placeholder="Example: best budget skincare in Rwanda, gift for gamers, affordable home office upgrade..."
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
            {draft ? "Regenerate SEO blog" : "Generate SEO blog"}
          </button>
        </form>

        {draft ? (
          <div className="border-t border-[var(--line)] p-4 sm:p-6">
            {/* SEO panel */}
            <div className="rounded-lg border border-[var(--line)] bg-[var(--background)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                  <Search className="h-3.5 w-3.5" />
                  SEO metadata
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyText(combinedDraft, "article")}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-xs font-semibold text-[var(--foreground)]"
                  >
                    {copied === "article" ? (
                      <Check className="h-3.5 w-3.5 text-[#1fae5b]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === "article" ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={publish}
                    disabled={publishState === "publishing"}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-xs font-bold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
                  >
                    {publishState === "publishing" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Rocket className="h-3.5 w-3.5" />
                    )}
                    {publishState === "done" ? "Published" : "Publish"}
                  </button>
                </div>
              </div>

              {publishState === "done" && publishedUrl ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Check className="h-4 w-4" />
                    Blog published &amp; live for SEO.
                  </span>
                  <Link
                    href={publishedUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
                  >
                    View blog
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}

              {publishState === "error" && publishError ? (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--red)]">
                  {publishError}
                </p>
              ) : null}

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <SeoField
                  label="Meta title"
                  value={draft.metaTitle}
                  hint={`${draft.metaTitle.length}/60`}
                  copied={copied === "metaTitle"}
                  onCopy={() => copyText(draft.metaTitle, "metaTitle")}
                />
                <SeoField
                  label="URL slug"
                  value={draft.slug}
                  copied={copied === "slug"}
                  onCopy={() => copyText(draft.slug, "slug")}
                />
                <div className="sm:col-span-2">
                  <SeoField
                    label="Meta description"
                    value={draft.metaDescription}
                    hint={`${draft.metaDescription.length}/160`}
                    copied={copied === "metaDescription"}
                    onCopy={() => copyText(draft.metaDescription, "metaDescription")}
                  />
                </div>
              </dl>

              {draft.keywords.length ? (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Keywords
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {draft.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-[var(--line)] bg-white px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Editable article (markdown)
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--foreground)]">
                  {draft.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{draft.excerpt}</p>
              </div>
            </div>

            <textarea
              value={editableBody}
              onChange={(event) => setEditableBody(event.target.value)}
              className="mt-4 min-h-[360px] w-full rounded-md border border-[var(--line)] bg-[#fffdf9] px-3 py-3 font-mono text-[13px] leading-7 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
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

type SeoFieldProps = {
  label: string;
  value: string;
  hint?: string;
  copied: boolean;
  onCopy: () => void;
};

function SeoField({ label, value, hint, copied, onCopy }: SeoFieldProps) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {hint ? <span className="text-[10px] text-[var(--muted)]">{hint}</span> : null}
          <button
            type="button"
            onClick={onCopy}
            className="text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#1fae5b]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      <p className="mt-1 break-words text-sm font-medium text-[var(--foreground)]">
        {value || "—"}
      </p>
    </div>
  );
}
