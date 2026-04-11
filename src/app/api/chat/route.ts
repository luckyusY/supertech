import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

type ProductContext = {
  name: string;
  price: number;
  vendorName: string;
  category: string;
  description: string;
  features: string[];
  stockLabel: string;
  shipWindow: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const { messages, productContext, room } = (await request.json()) as {
      messages: Message[];
      productContext?: ProductContext;
      room?: string;
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Chat is not configured. Please contact the site admin." }),
        { status: 503 },
      );
    }

    const client = new Anthropic({ apiKey });

    // Build system prompt
    let system = `You are a helpful, friendly support assistant for SuperTech Marketplace — a premium tech marketplace serving East and West Africa. You help customers with product questions, orders, shipping, and general support.

Keep replies concise and practical. Use plain language. If you're unsure about something specific (like a real order status), ask the customer to email support@supertech.com or check their order tracking page.`;

    if (productContext) {
      system += `

The customer is asking about a specific product. Here are the details:
• Product: ${productContext.name}
• Vendor: ${productContext.vendorName}
• Category: ${productContext.category}
• Price: $${productContext.price.toFixed(2)}
• Stock: ${productContext.stockLabel}
• Shipping: ${productContext.shipWindow}
• Description: ${productContext.description}
• Key features: ${productContext.features.slice(0, 8).join(", ")}

Use this information to answer questions about this product accurately. If the customer asks something not covered above, say you'll pass their question to the seller.`;
    }

    if (room?.startsWith("vendor-")) {
      system += `\n\nThis chat is about products from a specific seller on SuperTech.`;
    }

    // Stream the response
    const stream = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[Chat API]", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
