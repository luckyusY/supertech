import { products, vendors } from "@/lib/marketplace";
import {
  AiConfigurationError,
  getAiModel,
  getAiProviderId,
  getAiProviderLabel,
  hasAiConfig,
  resolveAiProvider,
  type ResolvedAiProvider,
} from "@/lib/ai-provider";

export {
  AiConfigurationError,
  getAiModel,
  getAiProviderId,
  getAiProviderLabel,
  hasAiConfig,
};
export type { AiProviderId } from "@/lib/ai-provider";

const REQUEST_TIMEOUT_MS = 25000;

/** OpenAI Responses API payload. */
type OpenAITextResponse = {
  output_text?: string;
  output?: {
    content?: {
      text?: string;
      type?: string;
    }[];
  }[];
  error?: {
    message?: string;
  };
};

/** Chat Completions payload (DeepSeek and other OpenAI-compatible APIs). */
type ChatCompletionsResponse = {
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
  error?: {
    message?: string;
  };
};

type GenerateAiTextOptions = {
  instructions: string;
  input: string;
  temperature?: number;
  maxOutputTokens?: number;
};

type AiRequestOptions = GenerateAiTextOptions & { stream?: boolean };

/**
 * DeepSeek's reasoning models ignore or reject sampling parameters, so the
 * temperature is dropped for them.
 */
function supportsTemperature(provider: ResolvedAiProvider) {
  return !(provider.id === "deepseek" && provider.model.includes("reasoner"));
}

function buildRequestBody(provider: ResolvedAiProvider, options: AiRequestOptions) {
  const { instructions, input, temperature, maxOutputTokens, stream } = options;

  if (provider.protocol === "chat") {
    return {
      model: provider.model,
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: input },
      ],
      ...(supportsTemperature(provider) ? { temperature } : {}),
      max_tokens: maxOutputTokens,
      ...(stream ? { stream: true } : {}),
    };
  }

  return {
    model: provider.model,
    instructions,
    input,
    temperature,
    max_output_tokens: maxOutputTokens,
    ...(stream ? { stream: true } : {}),
  };
}

async function requestAi(provider: ResolvedAiProvider, options: AiRequestOptions) {
  return fetch(provider.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify(buildRequestBody(provider, options)),
  });
}

async function readErrorMessage(response: Response) {
  const data = (await response.json().catch(() => ({}))) as
    | OpenAITextResponse
    | ChatCompletionsResponse;
  return data.error?.message || "AI request failed.";
}

function extractText(provider: ResolvedAiProvider, data: unknown) {
  if (provider.protocol === "chat") {
    const chat = data as ChatCompletionsResponse;
    return chat.choices?.[0]?.message?.content?.trim() || "";
  }

  const responses = data as OpenAITextResponse;
  return (
    responses.output_text ||
    responses.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim() ||
    ""
  );
}

/** Pulls the text delta out of one SSE event, whichever protocol produced it. */
function extractStreamDelta(provider: ResolvedAiProvider, payload: string) {
  if (provider.protocol === "chat") {
    const event = JSON.parse(payload) as {
      choices?: { delta?: { content?: string | null } }[];
    };
    const delta = event.choices?.[0]?.delta?.content;
    return typeof delta === "string" ? delta : "";
  }

  const event = JSON.parse(payload) as { type?: string; delta?: string };
  return event.type === "response.output_text.delta" && typeof event.delta === "string"
    ? event.delta
    : "";
}

const MARKETPLACE_HOW_TO = [
  "SuperTech is an online marketplace based in Kigali, Rwanda for tech, beauty, wellness, home essentials, vendors, product requests, cart orders, and order tracking. Prices are in Rwandan Francs (RWF).",
  "Important customer paths: /catalog, /blog, /request-product, /track-order, /cart, /vendors, /become-vendor, /account.",
  "How to buy: open a product, then either 'Buy now' (fills the order form), add to cart, or 'Chat on WhatsApp' with the seller.",
  "Payments: vendors accept MTN MoMoPay — customers dial *182*8*1*<merchant code># shown on the product's MoMoPay card to pay the seller.",
  "Becoming a vendor: apply at /become-vendor; once approved you manage products, storefront branding, and payment method from the vendor dashboard.",
];

export function getMarketplaceContext() {
  const productLines = products
    .slice(0, 18)
    .map((product) => {
      return `- ${product.name}: ${product.category}, $${product.price}`;
    })
    .join("\n");

  const vendorLines = vendors
    .slice(0, 10)
    .map((vendor) => `- ${vendor.name}: ${vendor.location}, ${vendor.activeProducts} products`)
    .join("\n");

  return [
    ...MARKETPLACE_HOW_TO,
    "Sample products:",
    productLines,
    "Sample vendors:",
    vendorLines,
  ].join("\n");
}

/**
 * Builds support context from the LIVE marketplace (seed + approved vendors and
 * products) so the assistant can answer "is vendor/product X on SuperTech?".
 */
export async function getMarketplaceContextAsync() {
  const { getPublicProducts, getPublicVendors } = await import("@/lib/public-marketplace");

  const [publicProducts, publicVendors] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicVendors().catch(() => []),
  ]);

  const vendorLines = publicVendors
    .slice(0, 60)
    .map(
      (vendor) =>
        `- ${vendor.name} (${vendor.location}) — ${vendor.categories.join(", ")} · /vendors/${vendor.slug}`,
    )
    .join("\n");

  const productLines = publicProducts
    .slice(0, 80)
    .map(
      (product) =>
        `- ${product.name} — ${product.category}, ${product.price} RWF · /products/${product.slug}`,
    )
    .join("\n");

  return [
    ...MARKETPLACE_HOW_TO,
    "",
    "VENDOR & PRODUCT DIRECTORY (this is the authoritative, current list of who and what is on SuperTech):",
    `Vendors (${publicVendors.length}):`,
    vendorLines || "- (no vendors listed yet)",
    `Products (${publicProducts.length} total, first 80 shown):`,
    productLines || "- (no products listed yet)",
    "",
    "When a shopper asks whether a vendor or product exists or how to find one: search this directory. If it is listed, confirm it and share its page link. If it is NOT in the directory, say it is not on SuperTech yet (or you couldn't find it) and suggest the closest alternatives or /catalog. Match names loosely (ignore case and small typos).",
  ].join("\n");
}

export async function generateAiText({
  instructions,
  input,
  temperature = 0.5,
  maxOutputTokens = 900,
}: GenerateAiTextOptions) {
  const provider = resolveAiProvider();
  if (!provider) {
    throw new AiConfigurationError();
  }

  const response = await requestAi(provider, {
    instructions,
    input,
    temperature,
    maxOutputTokens,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json().catch(() => ({}));
  const outputText = extractText(provider, data);

  if (!outputText) {
    throw new Error("The AI did not return any text.");
  }

  return outputText;
}

/**
 * Streams AI output as plain-text chunks. Parses the provider's SSE stream
 * server-side and re-emits only the text deltas so the client can append them
 * directly without parsing SSE.
 */
export async function streamAiText({
  instructions,
  input,
  temperature = 0.5,
  maxOutputTokens = 900,
}: GenerateAiTextOptions): Promise<ReadableStream<Uint8Array>> {
  const provider = resolveAiProvider();
  if (!provider) {
    throw new AiConfigurationError();
  }

  const response = await requestAi(provider, {
    instructions,
    input,
    temperature,
    maxOutputTokens,
    stream: true,
  });

  if (!response.ok || !response.body) {
    throw new Error(await readErrorMessage(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      // Keep reading until something is emitted or the upstream ends: a single
      // read often yields only non-text events (OpenAI lifecycle events, or the
      // role-only chunk DeepSeek opens with), and returning without enqueueing
      // would stall the stream.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last (possibly incomplete) line in the buffer.
        buffer = lines.pop() ?? "";

        let enqueued = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const delta = extractStreamDelta(provider, payload);
            if (delta) {
              controller.enqueue(encoder.encode(delta));
              enqueued = true;
            }
          } catch {
            // Ignore keep-alive or non-JSON lines.
          }
        }

        if (enqueued) return;
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}
