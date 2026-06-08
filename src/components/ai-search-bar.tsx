"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/marketplace";

const EXAMPLES = [
  "a gift for someone who loves cooking",
  "affordable skincare under $20",
  "something to upgrade my home office",
];

type AiSearchBarProps = {
  initialQuery?: string;
  autoRun?: boolean;
};

export function AiSearchBar({ initialQuery = "", autoRun = false }: AiSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[] | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const autoRanFor = useRef<string | null>(null);

  // Auto-run when the shopper arrived via the header "switch to AI" toggle.
  useEffect(() => {
    const value = initialQuery.trim();
    if (autoRun && value.length >= 2 && autoRanFor.current !== value) {
      autoRanFor.current = value;
      void runSearch(value);
    }
  }, [autoRun, initialQuery]);

  async function runSearch(text: string) {
    const value = text.trim();
    if (value.length < 2) return;

    setState("loading");
    setError("");

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value, limit: 12 }),
      });
      const data = (await response.json()) as {
        products?: Product[];
        error?: string;
        note?: string;
      };

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "AI search is unavailable right now.");
      }

      setResults(data.products ?? []);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI search failed.");
      setState("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  function clear() {
    setQuery("");
    setResults(null);
    setState("idle");
    setError("");
  }

  return (
    <div className="mb-4">
      <div className="soft-card overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--accent)] to-[#6d28d9] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">Ask AI to find products</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Describe what you need in your own words..."
              className="h-11 min-w-0 flex-1 rounded-full border border-transparent bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-white"
            />
            <button
              type="submit"
              disabled={state === "loading" || query.trim().length < 2}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--foreground)] px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {state === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {!results && state !== "loading" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setQuery(example);
                    void runSearch(example);
                  }}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
                >
                  {example}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="px-4 py-3 text-sm text-[var(--red)] sm:px-6">{error}</p>
        ) : null}

        {results ? (
          <div className="p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {results.length > 0
                  ? `${results.length} AI match${results.length === 1 ? "" : "es"}`
                  : "No AI matches — try rephrasing."}
              </p>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
                {results.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
