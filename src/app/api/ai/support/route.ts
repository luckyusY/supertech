import { NextResponse } from "next/server";
import { AiConfigurationError, getMarketplaceContext, streamAiText } from "@/lib/ai";

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

  try {
    const stream = await streamAiText({
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
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("AI support error", error);
    return NextResponse.json({ error: "AI support is unavailable right now." }, { status: 500 });
  }
}
