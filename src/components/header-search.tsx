"use client";

import {
  FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PackageSearch,
  Search,
  Sparkles,
  Store,
  Tag,
} from "lucide-react";
import { trackEvent } from "@/lib/client-analytics";
import { formatPrice } from "@/lib/utils";

type HeaderSearchProps = {
  variant?: "desktop" | "mobile";
};

type SuggestProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  heroImage: string;
  href: string;
};

type SuggestVendor = {
  slug: string;
  name: string;
  headline: string;
  activeProducts: number;
  href: string;
};

type SuggestCategory = {
  name: string;
  href: string;
};

type SuggestResponse = {
  query: string;
  products: SuggestProduct[];
  vendors: SuggestVendor[];
  categories: SuggestCategory[];
};

export function HeaderSearch({ variant = "desktop" }: HeaderSearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [data, setData] = useState<SuggestResponse | null>(null);

  const isMobile = variant === "mobile";

  const flatLinks = buildFlatLinks(data, query, aiMode);

  const fetchSuggestions = useCallback(async (value: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      const res = await fetch(`/api/search/suggest?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("suggest failed");
      const json = (await res.json()) as SuggestResponse;
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      void fetchSuggestions(query);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [query, open, fetchSuggestions]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    const params = new URLSearchParams();
    if (value) params.set("query", value);
    if (aiMode) params.set("ai", "1");
    setOpen(false);
    trackEvent("search_submit", {
      query: value,
      ai: aiMode,
      source: isMobile ? "header_mobile" : "header_desktop",
    });
    router.push(params.size ? `/catalog?${params.toString()}` : "/catalog");
  }

  function goToActiveOrSubmit() {
    if (activeIndex >= 0 && flatLinks[activeIndex]) {
      const link = flatLinks[activeIndex];
      setOpen(false);
      trackEvent("search_suggest_click", {
        href: link.href,
        kind: link.kind,
        query: query.trim(),
      });
      router.push(link.href);
      return;
    }
    const value = query.trim();
    const params = new URLSearchParams();
    if (value) params.set("query", value);
    if (aiMode) params.set("ai", "1");
    setOpen(false);
    trackEvent("search_submit", {
      query: value,
      ai: aiMode,
      source: isMobile ? "header_mobile" : "header_desktop",
    });
    router.push(params.size ? `/catalog?${params.toString()}` : "/catalog");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatLinks.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      goToActiveOrSubmit();
    }
  }

  const showPanel = open && !aiMode;
  const hasResults =
    (data?.products.length ?? 0) +
      (data?.vendors.length ?? 0) +
      (data?.categories.length ?? 0) >
    0;

  return (
    <form
      ref={rootRef}
      onSubmit={submit}
      className={isMobile ? "relative mt-2.5 md:hidden" : "relative hidden min-w-0 flex-1 md:block"}
      role="search"
    >
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          {aiMode ? (
            <Sparkles className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--accent)]" />
          ) : (
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          )}
          <input
            type="search"
            name="query"
            value={query}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={showPanel}
            role="combobox"
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder={
              aiMode
                ? "Describe what you need — AI will find it"
                : isMobile
                  ? "Search products, stores…"
                  : "Search products, stores and categories"
            }
            className="h-11 w-full rounded-[var(--radius-sm)] border border-white/55 bg-white pl-10 pr-16 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            aria-label={aiMode ? "AI product search" : "Product search"}
          />
          <button
            type="button"
            onClick={() => setAiMode((value) => !value)}
            role="switch"
            aria-checked={aiMode}
            aria-label={aiMode ? "Switch to keyword search" : "Switch to AI search"}
            className={`absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
              aiMode
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--neutral-100)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            AI
          </button>

          {showPanel ? (
            <div
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-[var(--z-drawer)] max-h-[min(70vh,28rem)] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--line)] bg-white shadow-[var(--elevation-3)]"
            >
              {loading && !data ? (
                <p className="px-4 py-6 text-center text-sm text-[var(--muted)]">Searching…</p>
              ) : null}

              {!loading && data && !hasResults && query.trim() ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm font-semibold text-[var(--foreground)]">No matches</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Try another term or request the product.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Link
                      href={`/catalog?query=${encodeURIComponent(query.trim())}`}
                      onClick={() => setOpen(false)}
                      className="rounded-[var(--radius-sm)] bg-[var(--foreground)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Search catalog
                    </Link>
                    <Link
                      href={`/request-product?hint=${encodeURIComponent(query.trim())}`}
                      onClick={() => setOpen(false)}
                      className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Request product
                    </Link>
                  </div>
                </div>
              ) : null}

              {data && hasResults ? (
                <div className="py-2">
                  {!query.trim() ? (
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Popular right now
                    </p>
                  ) : null}

                  {data.categories.length > 0 ? (
                    <SuggestSection title="Categories" icon={Tag}>
                      {data.categories.map((item) => {
                        const idx = flatLinks.findIndex((l) => l.href === item.href && l.kind === "category");
                        return (
                          <SuggestLink
                            key={item.href}
                            href={item.href}
                            active={idx === activeIndex}
                            onClick={() => setOpen(false)}
                            icon={<Tag className="h-4 w-4 text-[var(--accent)]" />}
                            title={item.name}
                            subtitle="Category"
                            kind="category"
                          />
                        );
                      })}
                    </SuggestSection>
                  ) : null}

                  {data.products.length > 0 ? (
                    <SuggestSection title="Products" icon={PackageSearch}>
                      {data.products.map((item) => {
                        const idx = flatLinks.findIndex((l) => l.href === item.href && l.kind === "product");
                        return (
                          <SuggestLink
                            key={item.slug}
                            href={item.href}
                            active={idx === activeIndex}
                            onClick={() => setOpen(false)}
                            image={item.heroImage}
                            title={item.name}
                            subtitle={`${item.category} · ${formatPrice(item.price)}`}
                            kind="product"
                          />
                        );
                      })}
                    </SuggestSection>
                  ) : null}

                  {data.vendors.length > 0 ? (
                    <SuggestSection title="Stores" icon={Store}>
                      {data.vendors.map((item) => {
                        const idx = flatLinks.findIndex((l) => l.href === item.href && l.kind === "vendor");
                        return (
                          <SuggestLink
                            key={item.slug}
                            href={item.href}
                            active={idx === activeIndex}
                            onClick={() => setOpen(false)}
                            icon={<Store className="h-4 w-4 text-[var(--accent)]" />}
                            title={item.name}
                            subtitle={`${item.activeProducts} products · ${item.headline}`}
                            kind="vendor"
                          />
                        );
                      })}
                    </SuggestSection>
                  ) : null}

                  {query.trim() ? (
                    <div className="border-t border-[var(--line)] px-2 pt-1">
                      <Link
                        href={`/catalog?query=${encodeURIComponent(query.trim())}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                      >
                        <Search className="h-4 w-4" />
                        Search all for “{query.trim()}”
                      </Link>
                      <Link
                        href={`/request-product?hint=${encodeURIComponent(query.trim())}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--neutral-50)]"
                      >
                        <PackageSearch className="h-4 w-4" />
                        Request “{query.trim()}”
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--foreground)] px-4 text-sm font-semibold text-white sm:px-5"
        >
          Search
        </button>
      </div>
    </form>
  );
}

type FlatLink = { href: string; kind: "category" | "product" | "vendor" | "action" };

function buildFlatLinks(
  data: SuggestResponse | null,
  query: string,
  aiMode: boolean,
): FlatLink[] {
  if (aiMode || !data) return [];
  const links: FlatLink[] = [];
  for (const c of data.categories) links.push({ href: c.href, kind: "category" });
  for (const p of data.products) links.push({ href: p.href, kind: "product" });
  for (const v of data.vendors) links.push({ href: v.href, kind: "vendor" });
  if (query.trim()) {
    links.push({
      href: `/catalog?query=${encodeURIComponent(query.trim())}`,
      kind: "action",
    });
  }
  return links;
}

function SuggestSection({
  title,
  children,
}: {
  title: string;
  icon: typeof Tag;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-[var(--line)] px-1 pb-1 last:border-b-0">
      <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SuggestLink({
  href,
  title,
  subtitle,
  active,
  onClick,
  image,
  icon,
  kind,
}: {
  href: string;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
  image?: string;
  icon?: ReactNode;
  kind?: string;
}) {
  return (
    <Link
      href={href}
      role="option"
      aria-selected={active}
      onClick={() => {
        trackEvent("search_suggest_click", {
          href,
          kind: kind ?? "unknown",
          title,
        });
        onClick();
      }}
      className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 transition-colors ${
        active ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--neutral-50)]"
      }`}
    >
      {image ? (
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--neutral-100)]">
          <Image src={image} alt="" fill className="object-cover" sizes="40px" />
        </span>
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--neutral-100)]">
          {icon}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
          {title}
        </span>
        <span className="block truncate text-xs text-[var(--muted)]">{subtitle}</span>
      </span>
    </Link>
  );
}
