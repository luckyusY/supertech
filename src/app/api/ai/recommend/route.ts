import { NextResponse } from "next/server";
import { AiConfigurationError, generateAiText, hasAiConfig } from "@/lib/ai";
import { getPublicProducts } from "@/lib/public-marketplace";

type PublicProduct = Awaited<ReturnType<typeof getPublicProducts>>[number];

/**
 * Non-AI related products: same category first, then anything else. Used when
 * the model is unavailable so the "You may also like" rail is never empty.
 */
function getFallbackRecommendations(
  products: PublicProduct[],
  slug: string,
  limit: number,
) {
  const current = products.find((product) => product.slug === slug);
  const candidates = products.filter((product) => product.slug !== slug);
  if (!current) return candidates.slice(0, limit);

  const sameCategory = candidates.filter(
    (product) => product.category === current.category,
  );
  const rest = candidates.filter(
    (product) => product.category !== current.category,
  );

  return [...sameCategory, ...rest].slice(0, limit);
}

export async function POST(request: Request) {
  let body: { slug?: string; limit?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = String(body.slug || "").trim();
  const limit = Math.min(Math.max(Number(body.limit) || 4, 1), 6);

  if (!hasAiConfig()) {
    const products = getFallbackRecommendations(await getPublicProducts(), slug, limit);
    return NextResponse.json({ products });
  }

  try {
    const allProducts = await getPublicProducts();
    const current = allProducts.find((product) => product.slug === slug);
    const candidates = allProducts.filter((product) => product.slug !== slug);

    if (candidates.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Cap the candidate list to keep the prompt small.
    const shortlist = candidates.slice(0, 40);
    const candidateLines = shortlist
      .map(
        (product) =>
          `- ${product.slug} | ${product.name} | ${product.category} | $${product.price}`,
      )
      .join("\n");

    const raw = await generateAiText({
      instructions: [
        "You recommend related products for an African online marketplace.",
        "Pick the products a shopper viewing the current product is most likely to also want (similar or complementary).",
        "Choose ONLY from the candidate slugs provided. Never invent slugs.",
        `Return ONLY minified JSON: {"slugs": string[]} with up to ${limit} slugs, best first.`,
      ].join("\n"),
      input: [
        current
          ? `Current product: ${current.name} | ${current.category} | $${current.price}`
          : `Current product slug: ${slug}`,
        "Candidates (slug | name | category | price):",
        candidateLines,
      ].join("\n"),
      temperature: 0.3,
      maxOutputTokens: 200,
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
    const recommended = slugs
      .map((recommendedSlug) => bySlug.get(recommendedSlug))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
      .slice(0, limit);

    // Fallback: same-category products if the model returned nothing usable.
    if (recommended.length === 0) {
      return NextResponse.json({
        products: getFallbackRecommendations(allProducts, slug, limit),
      });
    }

    return NextResponse.json({ products: recommended });
  } catch (error) {
    if (!(error instanceof AiConfigurationError)) {
      console.error("AI recommend error", error);
    }

    const products = await getPublicProducts()
      .then((all) => getFallbackRecommendations(all, slug, limit))
      .catch(() => []);
    return NextResponse.json({ products });
  }
}
