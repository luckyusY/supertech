import { NextResponse } from "next/server";
import {
  AiConfigurationError,
  generateAiText,
  getMarketplaceContext,
  streamAiText,
} from "@/lib/ai";

const PLAIN_TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Accel-Buffering": "no",
} as const;

type SupportMessage = {
  role?: string;
  content?: string;
};

export async function POST(request: Request) {
  let body: { message?: string; messages?: SupportMessage[]; page?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .slice(-8)
    .map((item) => `${item.role === "assistant" ? "Assistant" : "Customer"}: ${item.content}`)
    .join("\n");

  const aiOptions = {
    instructions: [
      "You are SuperTech AI Support, a concise and friendly marketplace assistant.",
      "Help customers find products, understand ordering, request unavailable items, track orders, and become vendors.",
      "Use the provided marketplace context. If the customer needs account, payment, or delivery help you cannot complete, guide them to the best page and tell them support will follow up.",
      "Do not invent order status, payment confirmations, stock guarantees, discounts, phone numbers, or policies not in the context.",
      "Keep replies short and practical. You may use light markdown: **bold** for emphasis, '- ' bullet lists, and link site pages as plain paths like /catalog.",
      getMarketplaceContext(),
    ].join("\n\n"),
    input: [
      body.page ? `Current page: ${body.page}` : "",
      history ? `Recent chat:\n${history}` : "",
      `Customer: ${message}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    temperature: 0.4,
    maxOutputTokens: 450,
  };

  try {
    // Prefer streaming. Some OpenAI organizations are not verified for
    // streaming (non-streaming requests still succeed), so fall back to a
    // single non-streamed response if streaming is rejected. The client
    // reads both the same way.
    try {
      const stream = await streamAiText(aiOptions);
      return new Response(stream, { headers: PLAIN_TEXT_HEADERS });
    } catch (streamError) {
      if (streamError instanceof AiConfigurationError) {
        throw streamError;
      }
      console.warn("AI support streaming failed, using non-streaming fallback:", streamError);
      const reply = await generateAiText(aiOptions);
      return new Response(reply, { headers: PLAIN_TEXT_HEADERS });
    }
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("AI support error", error);
    return NextResponse.json({ error: "AI support is unavailable right now." }, { status: 500 });
  }
}
