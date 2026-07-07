import { NextResponse } from "next/server";
import { AiConfigurationError, generateAiText, hasAiConfig } from "@/lib/ai";
import type { Product, Vendor } from "@/lib/marketplace";
import { getPublicProductBySlug, getPublicVendors } from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";

type ProductBlogRequest = {
  productSlug?: string;
  angle?: string;
  tone?: string;
  audience?: string;
  productDetails?: string;
  count?: number;
};

export type BlogDraftPayload = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  excerpt: string;
  body: string;
  hashtags: string[];
};

// Distinct SEO angles so a multi-blog generation never repeats itself.
const DISTINCT_ANGLES = [
  "a complete buying guide",
  "the key benefits and who it is for",
  "how to use it for the best results",
  "why choose it over the alternatives",
  "a frequently-asked-questions deep dive",
  "an honest value-for-money review",
  "the perfect gift idea angle",
  "a first-time buyer guide for Kigali shoppers",
  "real-life use cases and scenarios",
  "what to know before you buy",
];

function buildInstructions() {
  return [
    "You are an SEO content writer for SuperTech, an online marketplace based in Kigali, Rwanda.",
    "Write a search-engine-optimized blog article about the product that a shopper or vendor can edit before publishing.",
    "GOAL: rank on Google for shoppers in Kigali and across Rwanda, and drive organic traffic to the product. Optimize for SEO throughout.",
    "LOCAL SEO: target Kigali, Rwanda. Naturally include local intent phrases like 'in Kigali', 'in Rwanda', 'buy online in Rwanda', and reference fast local delivery where relevant. Prices are in Rwandan Francs (RWF). Do NOT fabricate specific neighborhoods, landmarks, laws, or delivery times not provided.",
    "Be accurate. Do not invent specs, certifications, quantities, warranties, or claims not provided.",
    "Naturally weave in relevant keywords (the product name, category, use-cases, buyer intent, and Kigali/Rwanda local terms). Do not keyword-stuff.",
    "Structure the body with clear H2/H3 markdown headings (## and ###), short scannable paragraphs, and at least one bulleted list.",
    "Include a short FAQ section (2-3 questions) near the end.",
    "Write for mobile readers in clear, helpful language.",
    "Return ONLY valid minified JSON, no markdown fences, with this exact shape:",
    '{"title": string, "metaTitle": string, "metaDescription": string, "slug": string, "keywords": string[], "excerpt": string, "body": string, "hashtags": string[]}',
    "title: the on-page H1 (compelling, includes the main keyword).",
    "metaTitle: <= 60 characters, keyword-first, ideally including 'Kigali' or 'Rwanda', for the <title> tag.",
    "metaDescription: 140-160 characters, includes the main keyword, a local Kigali/Rwanda signal, and a call to action.",
    "slug: lowercase, hyphenated, <= 70 characters, derived from the title.",
    "keywords: 5-8 SEO keywords/phrases.",
    "excerpt: 1-2 sentence summary.",
    "body: 6-9 short sections using markdown headings, lists, and a FAQ. Use blank lines between blocks.",
    "hashtags: 4-6 short social tags without spaces or the # symbol.",
  ].join("\n");
}

function buildInput(
  product: Product,
  vendor: Vendor | undefined,
  options: { angle: string; tone: string; audience: string; details: string },
) {
  return [
    `Product: ${product.name}`,
    `Category: ${product.category}`,
    `Vendor: ${vendor?.name ?? product.vendorSlug}`,
    `Price: ${formatPrice(product.price)}`,
    product.compareAt ? `Compare at: ${formatPrice(product.compareAt)}` : "",
    `Badge: ${product.badge}`,
    `Stock/shipping: ${product.stockLabel}; ${product.shipWindow}`,
    `Product description (primary source — base the article on this): ${options.details}`,
    product.features.length ? `Features: ${product.features.join(", ")}` : "",
    `Requested angle / focus keyword: ${options.angle}`,
    `Tone: ${options.tone}`,
    `Target audience: ${options.audience}`,
    "Make THIS article distinct from any other article about the same product: use a unique title, unique slug, a different structure, and different supporting keywords.",
  ]
    .filter(Boolean)
    .join("\n");
}

function parseDraft(raw: string, product: Product): BlogDraftPayload | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: Partial<BlogDraftPayload> & { keywords?: unknown; hashtags?: unknown };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = {
      title: `Why ${product.name} deserves a closer look`,
      excerpt: product.description,
      body: cleaned,
    };
  }

  const toStringList = (value: unknown, max: number) =>
    Array.isArray(value)
      ? value
          .map((item) => String(item).replace(/^#/, "").trim())
          .filter(Boolean)
          .slice(0, max)
      : [];

  const title = String(parsed.title || "").trim();
  const excerpt = String(parsed.excerpt || "").trim();
  const body = String(parsed.body || "").trim();

  if (!title || !body) return null;

  const slug =
    String(parsed.slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || product.slug;

  return {
    title,
    metaTitle: String(parsed.metaTitle || title).trim().slice(0, 70),
    metaDescription: String(parsed.metaDescription || excerpt).trim().slice(0, 180),
    slug,
    keywords: toStringList(parsed.keywords, 8),
    excerpt,
    body,
    hashtags: toStringList(parsed.hashtags, 6),
  };
}

export async function POST(request: Request) {
  if (!hasAiConfig()) {
    return NextResponse.json(
      { error: "AI is not configured. Add OPENAI_API_KEY in your environment settings." },
      { status: 503 },
    );
  }

  let body: ProductBlogRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const productSlug = String(body.productSlug || "").trim();
  if (!productSlug) {
    return NextResponse.json({ error: "Choose a product first." }, { status: 400 });
  }

  const product = await getPublicProductBySlug(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const vendors = await getPublicVendors();
  const vendor = vendors.find((item) => item.slug === product.vendorSlug);
  const tone = String(body.tone || "friendly").trim().slice(0, 50);
  const audience = String(body.audience || "everyday shoppers").trim().slice(0, 80);
  const focus = String(body.angle || "why this product is useful").trim().slice(0, 180);
  const details = (String(body.productDetails || "").trim() || product.description).slice(0, 1200);
  const count = Math.min(Math.max(Math.round(Number(body.count) || 1), 1), 10);

  const instructions = buildInstructions();

  // For each requested article pick a distinct angle, blended with the user focus.
  const angles = Array.from({ length: count }, (_, index) => {
    const distinct = DISTINCT_ANGLES[index % DISTINCT_ANGLES.length];
    return count === 1 ? focus : `${focus} — framed as ${distinct}`;
  });

  try {
    const results = await Promise.all(
      angles.map(async (angle) => {
        try {
          const raw = await generateAiText({
            instructions,
            input: buildInput(product, vendor, { angle, tone, audience, details }),
            temperature: 0.7,
            maxOutputTokens: 1500,
          });
          return parseDraft(raw, product);
        } catch (error) {
          if (error instanceof AiConfigurationError) throw error;
          console.error("AI product-blog single error", error);
          return null;
        }
      }),
    );

    const blogs = results.filter((draft): draft is BlogDraftPayload => draft !== null);

    if (blogs.length === 0) {
      return NextResponse.json(
        { error: "The AI did not return a usable blog draft. Try again." },
        { status: 502 },
      );
    }

    // Keep first-blog fields at the top level for backward compatibility.
    return NextResponse.json({ blogs, ...blogs[0] });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("AI product-blog error", error);
    return NextResponse.json(
      { error: "Unable to generate a product story right now." },
      { status: 500 },
    );
  }
}
