import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { AiConfigurationError, generateAiText, getMarketplaceContext } from "@/lib/ai";

const contentTypes = {
  article: "a helpful SEO-friendly article",
  product: "a product description and sales copy",
  social: "short social media captions",
  email: "a customer email or newsletter section",
} as const;

type ContentType = keyof typeof contentTypes;

export async function POST(request: Request) {
  const auth = authorizeRequest(request, ["admin"]);
  if (!auth.ok) return auth.response;

  let body: { topic?: string; audience?: string; contentType?: ContentType; tone?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const topic = String(body.topic || "").trim();
  if (topic.length < 3) {
    return NextResponse.json({ error: "Add a topic with at least 3 characters." }, { status: 400 });
  }

  const contentType = body.contentType && body.contentType in contentTypes ? body.contentType : "article";
  const audience = String(body.audience || "online shoppers across Africa").trim();
  const tone = String(body.tone || "clear, trustworthy, and conversion-focused").trim();

  try {
    const result = await generateAiText({
      instructions: [
        "You are SuperTech's in-house marketing and support copywriter.",
        `Create ${contentTypes[contentType]} for the marketplace.`,
        "Use concrete headings, useful details, and a polished commercial tone without making unsupported claims.",
        "For articles, include a title, meta description, intro, sections, and a short call to action.",
        "For product copy, include a headline, short description, bullets, and SEO keywords.",
        "For social copy, include several caption options and calls to action.",
        "For email copy, include a subject line, preview text, body, and call to action.",
        getMarketplaceContext(),
      ].join("\n\n"),
      input: `Topic: ${topic}\nAudience: ${audience}\nTone: ${tone}`,
      temperature: 0.65,
      maxOutputTokens: 1200,
    });

    return NextResponse.json({ result });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("AI content error", error);
    return NextResponse.json({ error: "Unable to generate content right now." }, { status: 500 });
  }
}
