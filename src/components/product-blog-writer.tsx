"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  PenLine,
  Rocket,
  Search,
  Sparkles,
} from "lucide-react";
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

type EditableDraft = BlogDraft & {
  id: string;
  editableBody: string;
  publishState: "idle" | "publishing" | "done" | "error";
  publishedUrl: string;
  publishError: string;
};

const toneOptions = ["friendly", "premium", "educational", "social media", "storytelling"];
const countOptions = [1, 2, 3, 5, 7, 10];

function toEditable(draft: Partial<BlogDraft>, index: number): EditableDraft {
  const body = String(draft.body || "");
  return {
    title: String(draft.title || ""),
    metaTitle: String(draft.metaTitle || draft.title || ""),
    metaDescription: String(draft.metaDescription || draft.excerpt || ""),
    slug: String(draft.slug || ""),
    keywords: Array.isArray(draft.keywords) ? draft.keywords.map(String) : [],
    excerpt: String(draft.excerpt || ""),
    body,
    hashtags: Array.isArray(draft.hashtags) ? draft.hashtags.map(String) : [],
    id: `${Date.now()}-${index}`,
    editableBody: body,
    publishState: "idle",
    publishedUrl: "",
    publishError: "",
  };
}

export function ProductBlogWriter({ product, vendorName }: ProductBlogWriterProps) {
  const [angle, setAngle] = useState("why this product is useful for everyday life");
  const [tone, setTone] = useState("friendly");
  const [audience, setAudience] = useState("everyday shoppers");
  const [productDetails, setProductDetails] = useState(product.description);
  const [count, setCount] = useState(3);
  const [drafts, setDrafts] = useState<EditableDraft[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [publishingAll, setPublishingAll] = useState(false);

  const active = drafts[activeIndex] ?? null;

  function combinedDraft(draft: EditableDraft) {
    const tags = draft.hashtags.length
      ? `\n\n${draft.hashtags.map((tag) => `#${tag}`).join(" ")}`
      : "";
    return `# ${draft.title}\n\n${draft.excerpt}\n\n${draft.editableBody}${tags}`;
  }

  function patchDraft(index: number, patch: Partial<EditableDraft>) {
    setDrafts((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

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
          productDetails,
          count,
        }),
      });
      const data = (await response.json()) as {
        blogs?: Partial<BlogDraft>[];
        error?: string;
      };

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Unable to generate these stories.");
      }

      const list = Array.isArray(data.blogs) ? data.blogs : [];
      if (list.length === 0) {
        throw new Error("The AI did not return any blog drafts.");
      }

      setDrafts(list.map((item, index) => toEditable(item, index)));
      setActiveIndex(0);
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

  async function publishDraft(index: number) {
    const draft = drafts[index];
    if (!draft || draft.publishState === "done") return;

    patchDraft(index, { publishState: "publishing", publishError: "" });

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
          body: draft.editableBody,
          keywords: draft.keywords,
          hashtags: draft.hashtags,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || data.error || !data.url) {
        throw new Error(data.error ?? "Unable to publish this blog.");
      }

      patchDraft(index, { publishState: "done", publishedUrl: data.url });
    } catch (err) {
      patchDraft(index, {
        publishState: "error",
        publishError: err instanceof Error ? err.message : "Unable to publish this blog.",
      });
    }
  }

  async function publishAll() {
    setPublishingAll(true);
    for (let i = 0; i < drafts.length; i += 1) {
      if (drafts[i].publishState !== "done") {
        await publishDraft(i);
      }
    }
    setPublishingAll(false);
  }

  const publishedCount = drafts.filter((draft) => draft.publishState === "done").length;

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="soft-card overflow-hidden bg-white lg:sticky lg:top-4 lg:self-start">
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">AI SEO blog writer</p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
            Write SEO blogs about this product
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Edit the product description, choose how many distinct articles to generate, then publish
            the ones you like — each optimized for Kigali, Rwanda search.
          </p>
        </div>

        <form onSubmit={generate} className="grid gap-4 p-4 sm:p-6">
          <label className="grid gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
              <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
              Product description (used by AI)
            </span>
            <textarea
              value={productDetails}
              onChange={(event) => setProductDetails(event.target.value)}
              className="min-h-28 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              placeholder="Describe the product — features, benefits, what makes it special..."
            />
            <span className="text-xs text-[var(--muted)]">
              Prefilled from the product. The AI bases every article on this text.
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">
              Focus keyword / angle
            </span>
            <input
              value={angle}
              onChange={(event) => setAngle(event.target.value)}
              className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              placeholder="Example: best budget skincare in Kigali, gift for gamers in Rwanda..."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
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

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-[var(--foreground)]"># of blogs</span>
              <select
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                {countOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} {option === 1 ? "blog" : "blogs"}
                  </option>
                ))}
              </select>
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
            {state === "loading"
              ? `Generating ${count} ${count === 1 ? "blog" : "blogs"}…`
              : drafts.length > 0
                ? `Regenerate ${count} ${count === 1 ? "blog" : "blogs"}`
                : `Generate ${count} ${count === 1 ? "blog" : "blogs"}`}
          </button>
        </form>

        {drafts.length > 0 ? (
          <div className="border-t border-[var(--line)] p-4 sm:p-6">
            {/* Draft switcher */}
            {drafts.length > 1 ? (
              <div className="mb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {drafts.length} distinct drafts
                    {publishedCount > 0 ? ` · ${publishedCount} published` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={publishAll}
                    disabled={publishingAll || publishedCount === drafts.length}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--foreground)] px-4 text-xs font-bold text-white transition-opacity disabled:opacity-60"
                  >
                    {publishingAll ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Rocket className="h-3.5 w-3.5" />
                    )}
                    {publishedCount === drafts.length ? "All published" : "Publish all"}
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {drafts.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`flex items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
                          isActive
                            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                            : "border-[var(--line)] bg-white hover:border-[var(--accent)]/50"
                        }`}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">
                            {item.title}
                          </span>
                          <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium">
                            {item.publishState === "done" ? (
                              <span className="inline-flex items-center gap-1 text-[#166534]">
                                <Check className="h-3 w-3" /> Published
                              </span>
                            ) : item.publishState === "error" ? (
                              <span className="text-[var(--red)]">Failed — retry</span>
                            ) : item.publishState === "publishing" ? (
                              <span className="text-[var(--muted)]">Publishing…</span>
                            ) : (
                              <span className="text-[var(--muted)]">Draft</span>
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {active ? (
              <>
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
                        onClick={() => copyText(combinedDraft(active), "article")}
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
                        onClick={() => publishDraft(activeIndex)}
                        disabled={active.publishState === "publishing"}
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-xs font-bold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
                      >
                        {active.publishState === "publishing" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Rocket className="h-3.5 w-3.5" />
                        )}
                        {active.publishState === "done" ? "Published" : "Publish"}
                      </button>
                    </div>
                  </div>

                  {active.publishState === "done" && active.publishedUrl ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#bbf7d0] bg-[#dcfce7] px-3 py-2 text-sm text-[#166534]">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Check className="h-4 w-4" />
                        Blog published &amp; live for SEO.
                      </span>
                      <Link
                        href={active.publishedUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
                      >
                        View blog
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : null}

                  {active.publishState === "error" && active.publishError ? (
                    <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--red)]">
                      {active.publishError}
                    </p>
                  ) : null}

                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <SeoField
                      label="Meta title"
                      value={active.metaTitle}
                      hint={`${active.metaTitle.length}/60`}
                      copied={copied === "metaTitle"}
                      onCopy={() => copyText(active.metaTitle, "metaTitle")}
                    />
                    <SeoField
                      label="URL slug"
                      value={active.slug}
                      copied={copied === "slug"}
                      onCopy={() => copyText(active.slug, "slug")}
                    />
                    <div className="sm:col-span-2">
                      <SeoField
                        label="Meta description"
                        value={active.metaDescription}
                        hint={`${active.metaDescription.length}/160`}
                        copied={copied === "metaDescription"}
                        onCopy={() => copyText(active.metaDescription, "metaDescription")}
                      />
                    </div>
                  </dl>

                  {active.keywords.length ? (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Keywords
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {active.keywords.map((keyword) => (
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

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Editable article (markdown)
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[var(--foreground)]">
                    {active.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{active.excerpt}</p>
                </div>

                <textarea
                  value={active.editableBody}
                  onChange={(event) => patchDraft(activeIndex, { editableBody: event.target.value })}
                  className="mt-4 min-h-[360px] w-full rounded-md border border-[var(--line)] bg-[#fffdf9] px-3 py-3 font-mono text-[13px] leading-7 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />

                {active.hashtags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {active.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
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
      <p className="mt-1 break-words text-sm font-medium text-[var(--foreground)]">{value || "—"}</p>
    </div>
  );
}
