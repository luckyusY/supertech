"use client";

import { FormEvent, useState } from "react";
import { Copy, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const contentTypeOptions = [
  { value: "article", label: "Article" },
  { value: "product", label: "Product copy" },
  { value: "social", label: "Social captions" },
  { value: "email", label: "Email" },
] as const;

export function AiContentGenerator() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("online shoppers across Africa");
  const [tone, setTone] = useState("clear, trustworthy, and conversion-focused");
  const [contentType, setContentType] = useState<(typeof contentTypeOptions)[number]["value"]>("article");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/ai/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, tone, contentType }),
      });
      const data = (await response.json()) as { result?: string; error?: string };

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Unable to generate content.");
      }

      setResult(data.result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate content.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast.success("Copied AI draft.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <form onSubmit={handleSubmit} className="soft-card p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em]">Generate content</h2>
            <p className="text-sm text-[var(--muted)]">Articles, product copy, emails, and captions.</p>
          </div>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-semibold">Content type</span>
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value as typeof contentType)}
            className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]"
          >
            {contentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Topic</span>
          <textarea
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Example: Why smart home devices are growing in Rwanda"
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-[var(--line)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Audience</span>
          <input
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Tone</span>
          <input
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate draft
        </button>
      </form>

      <section className="soft-card min-h-[34rem] p-5">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold tracking-[-0.03em]">AI draft</h2>
          </div>
          <button
            type="button"
            onClick={copyResult}
            disabled={!result}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm font-semibold transition-colors hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>

        {result ? (
          <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-[var(--foreground)]">
            {result}
          </pre>
        ) : (
          <div className="flex min-h-[24rem] items-center justify-center rounded-md border border-dashed border-[var(--line)] bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
            Generated content will appear here.
          </div>
        )}
      </section>
    </div>
  );
}
