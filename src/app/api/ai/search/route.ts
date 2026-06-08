import { NextResponse } from "next/server";
import { AiConfigurationError, generateAiText, hasAiConfig } from "@/lib/ai";
import { getPublicProducts } from "@/lib/public-marketplace";

type PublicProduct = Awaited<ReturnType<typeof getPublicProducts>>[number];

const STOP_WORDS = new Set([
  "and",
  "for",
  "the",
  "with",
  "that",
  "this",
  "find",
  "show",
  "need",
  "want",
  "best",
  "product",
  "products",
]);

function getFallbackMatches(products: PublicProduct[], query: string, limit: number) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));

  if (terms.length === 0) return [];

  return products
    .map((product) => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const description = product.description.toLowerCase();
      const features = product.features.join(" ").toLowerCase();
      const haystack = `${name} ${category} ${description} ${features}`;
      const score = terms.reduce((total, term) => {
        if (name.includes(term)) return total + 8;
        if (category.includes(term)) return total + 5;
        if (haystack.includes(term)) return total + 2;
        return total;
      }, 0);

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product)
    .slice(0, limit);
}

export async function POST(request: Request) {
  if (!hasAiConfig()) {
    return NextResponse.json({ products: [], note: "AI search is not configured." });
  }

  let body: { query?: string; limit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = String(body.query || "").trim();
  if (query.length < 2) {
    return NextResponse.json(
      { error: "Type what you are looking for." },
      { status: 400 },
    );
  }

  const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 20);

  try {
    const allProducts = await getPublicProducts();
    if (allProducts.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Keep the prompt bounded.
    const shortlist = allProducts.slice(0, 60);
    const catalogLines = shortlist
      .map(
        (product) =>
          `- ${product.slug} | ${product.name} | ${product.category} | $${product.price} | ${product.description.slice(0, 80)}`,
      )
      .join("\n");

    const raw = await generateAiText({
      instructions: [
        "You are the search engine for an African online marketplace.",
        "Given a shopper's natural-language request, return the most relevant products.",
        "Match intent, use-case, budget hints, and category — not just exact keywords.",
        "Choose ONLY from the catalog slugs provided. Never invent slugs.",
        `Return ONLY minified JSON: {"slugs": string[]} ordered best-first, up to ${limit} items. Return an empty array if nothing fits.`,
      ].join("\n"),
      input: [
        `Shopper request: ${query}`,
        "Catalog (slug | name | category | price | description):",
        catalogLines,
      ].join("\n"),
      temperature: 0.2,
      maxOutputTokens: 300,
    });

    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let slugs: string[] = [];
    try {
      const parsed = JSON.parse(cleaned) as { slugs?: unknown };
      slugs = Array.isArray(parsed.slugs)
        ? parsed.slugs.map((item) => String(item).trim())
        : [];
    } catch {
      slugs = [];
    }

    const bySlug = new Map(shortlist.map((product) => [product.slug, product]));
    const products = slugs
      .map((slug) => bySlug.get(slug))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
      .slice(0, limit);

    return NextResponse.json({
      products: products.length > 0 ? products : getFallbackMatches(allProducts, query, limit),
    });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      const products = getFallbackMatches(await getPublicProducts(), query, limit);
      return NextResponse.json({ products, note: error.message });
    }

    console.error("AI search error", error);
    const products = getFallbackMatches(await getPublicProducts(), query, limit);
    return NextResponse.json({ products, note: "AI search fallback was used." });
  }
}
