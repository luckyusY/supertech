import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth";
import { AiConfigurationError, generateAiText } from "@/lib/ai";

export async function POST(request: Request) {
  const auth = authorizeRequest(request, ["admin", "vendor"]);
  if (!auth.ok) return auth.response;

  let body: { name?: string; category?: string; keywords?: string; price?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  if (name.length < 3) {
    return NextResponse.json(
      { error: "Add a product name (at least 3 characters) first." },
      { status: 400 },
    );
  }

  const category = String(body.category || "").trim();
  const keywords = String(body.keywords || "").trim();

  try {
    const raw = await generateAiText({
      instructions: [
        "You are SuperTech's product copywriter for an African online marketplace.",
        "Write accurate, compelling marketing copy for a single product listing.",
        "Do NOT invent specific technical specs, brands, certifications, or numbers you cannot infer from the product name.",
        "Return ONLY valid minified JSON, no markdown fences, with this exact shape:",
        '{"description": string, "features": string[]}',
        "The description must be 2-3 sentences, persuasive and clear.",
        "Provide 4-6 short benefit-focused feature bullets (max ~8 words each).",
      ].join("\n"),
      input: [
        `Product name: ${name}`,
        category ? `Category: ${category}` : "",
        keywords ? `Seller notes/keywords: ${keywords}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      temperature: 0.6,
      maxOutputTokens: 500,
    });

    // The model is instructed to return JSON; strip any stray fences first.
    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let description = "";
    let features: string[] = [];

    try {
      const parsed = JSON.parse(cleaned) as {
        description?: string;
        features?: unknown;
      };
      description = String(parsed.description || "").trim();
      features = Array.isArray(parsed.features)
        ? parsed.features
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, 8)
        : [];
    } catch {
      // Fallback: treat the whole output as the description.
      description = cleaned;
    }

    if (!description) {
      throw new Error("The AI did not return usable copy.");
    }

    return NextResponse.json({ description, features });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("AI product-copy error", error);
    return NextResponse.json(
      { error: "Unable to generate product copy right now." },
      { status: 500 },
    );
  }
}
