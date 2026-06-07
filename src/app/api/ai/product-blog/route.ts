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
        "You write helpful product stories for SuperTech, an African online marketplace.",
        "Write a blog-style story that a shopper can edit before sharing.",
        "Be accurate. Do not invent specs, certifications, quantities, warranties, or claims not provided.",
        "Mention the product naturally and explain practical use cases.",
        "Keep it clear for mobile readers.",
        "Return ONLY valid minified JSON, no markdown fences, with this exact shape:",
        '{"title": string, "excerpt": string, "body": string, "hashtags": string[]}',
        "Body should be 5-7 short paragraphs, separated by blank lines.",
        "Hashtags should be 3-6 short tags without spaces.",
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
        `Requested angle: ${angle}`,
        `Tone: ${tone}`,
        `Audience: ${audience}`,
      ]
        .filter(Boolean)
        .join("\n"),
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: {
      title?: string;
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

    const title = String(parsed.title || "").trim();
    const excerpt = String(parsed.excerpt || "").trim();
    const draftBody = String(parsed.body || "").trim();
    const hashtags = Array.isArray(parsed.hashtags)
      ? parsed.hashtags
          .map((item) => String(item).replace(/^#/, "").trim())
          .filter(Boolean)
          .slice(0, 6)
      : [];

    if (!title || !draftBody) {
      throw new Error("The AI did not return a usable blog draft.");
    }

    return NextResponse.json({
      title,
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
