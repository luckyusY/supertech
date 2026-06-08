"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

type HeaderSearchProps = {
  variant?: "desktop" | "mobile";
};

export function HeaderSearch({ variant = "desktop" }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    const params = new URLSearchParams();
    if (value) params.set("query", value);
    if (aiMode) params.set("ai", "1");
    router.push(params.size ? `/catalog?${params.toString()}` : "/catalog");
  }

  const isMobile = variant === "mobile";

  return (
    <form
      onSubmit={submit}
      className={isMobile ? "mt-3 md:hidden" : "hidden min-w-0 flex-1 md:flex md:flex-col"}
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          {aiMode ? (
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accent)]" />
          ) : (
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          )}
          <input
            type="search"
            name="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              aiMode
                ? "Describe what you need — AI will find it"
                : isMobile
                  ? "Search products"
                  : "Search products, stores and categories"
            }
            className="h-11 w-full rounded-md border border-white/55 bg-white pl-10 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[var(--foreground)] px-5 text-sm font-semibold text-white"
        >
          {aiMode ? <Sparkles className="h-4 w-4" /> : null}
          Search
        </button>
      </div>

      {/* AI mode toggle */}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAiMode((value) => !value)}
          role="switch"
          aria-checked={aiMode}
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
            aiMode
              ? "border-white bg-white text-[var(--accent)]"
              : "border-white/55 bg-white/12 text-white hover:bg-white/20"
          }`}
        >
          <span
            className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors ${
              aiMode ? "bg-[var(--accent)]" : "bg-white/45"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                aiMode ? "translate-x-2.5" : "translate-x-0.5"
              }`}
            />
          </span>
          <Sparkles className="h-3 w-3" />
          {aiMode ? "AI search on" : "Switch to AI"}
        </button>
      </div>
    </form>
  );
}
