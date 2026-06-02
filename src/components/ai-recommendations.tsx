"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/marketplace";

type AiRecommendationsProps = {
  slug: string;
};

export function AiRecommendations({ slug }: AiRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    let active = true;
    setState("loading");

    (async () => {
      try {
        const response = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, limit: 4 }),
        });
        const data = (await response.json()) as { products?: Product[] };
        if (!active) return;
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setState("ready");
        } else {
          setState("empty");
        }
      } catch {
        if (active) setState("empty");
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  if (state === "empty") return null;

  return (
    <section className="mt-8 soft-card p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
          You may also like
        </p>
      </div>

      {state === "loading" ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-xl border border-[var(--line)] bg-[rgba(15,23,42,0.04)]"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
