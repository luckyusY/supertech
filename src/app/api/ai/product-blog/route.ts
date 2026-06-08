import { NextResponse } from "next/server";
import { AiConfigurationError, generateAiText, hasAiConfig } from "@/lib/ai";
import { getPublicProductBySlug, getPublicVendors } from "@/lib/public-marketplace";
import { formatPrice } from "@/lib/utils";

type ProductBlogRequest = {
  productSlug?: string;
  angle?: string;
  tone?: string;
  audience?: string;
};

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
  const angle = String(body.angle || "why this product is useful").trim().slice(0, 180);

  try {
    const raw = await generateAiText({
      instructions: [
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
      ].join("\n"),
      input: [
        `Product: ${product.name}`,
        `Category: ${product.category}`,
        `Vendor: ${vendor?.name ?? product.vendorSlug}`,
        `Price: ${formatPrice(product.price)}`,
        product.compareAt ? `Compare at: ${formatPrice(product.compareAt)}` : "",
        `Badge: ${product.badge}`,
        `Stock/shipping: ${product.stockLabel}; ${product.shipWindow}`,
        `Description: ${product.description}`,
        product.features.length ? `Features: ${product.features.join(", ")}` : "",
        `Requested angle / focus keyword: ${angle}`,
        `Tone: ${tone}`,
        `Target audience: ${audience}`,
      ]
        .filter(Boolean)
        .join("\n"),
      temperature: 0.6,
      maxOutputTokens: 1500,
    });

    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: {
      title?: string;
      metaTitle?: string;
      metaDescription?: string;
      slug?: string;
      keywords?: unknown;
      excerpt?: string;
      body?: string;
      hashtags?: unknown;
    };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        title: `Why ${product.name} deserves a closer look`,
        excerpt: product.description,
        body: cleaned,
        hashtags: [],
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
    const draftBody = String(parsed.body || "").trim();
    const metaTitle = String(parsed.metaTitle || title).trim().slice(0, 70);
    const metaDescription = String(parsed.metaDescription || excerpt).trim().slice(0, 180);
    const slug =
      String(parsed.slug || title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 70) || product.slug;
    const keywords = toStringList(parsed.keywords, 8);
    const hashtags = toStringList(parsed.hashtags, 6);

    if (!title || !draftBody) {
      throw new Error("The AI did not return a usable blog draft.");
    }

    return NextResponse.json({
      title,
      metaTitle,
      metaDescription,
      slug,
      keywords,
      excerpt,
      body: draftBody,
      hashtags,
    });
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
