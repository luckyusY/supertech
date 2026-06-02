import { NextResponse } from "next/server";
import { AiConfigurationError, generateAiText, hasAiConfig } from "@/lib/ai";
import { getPublicProducts } from "@/lib/public-marketplace";

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

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json({ products: [], note: error.message });
    }

    console.error("AI search error", error);
    return NextResponse.json(
      { error: "AI search is unavailable right now." },
      { status: 500 },
    );
  }
}
