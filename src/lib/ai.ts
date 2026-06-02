import { products, vendors } from "@/lib/marketplace";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

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

type GenerateAiTextOptions = {
  instructions: string;
  input: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export class AiConfigurationError extends Error {
  constructor() {
    super("AI is not configured. Add OPENAI_API_KEY in your environment settings.");
    this.name = "AiConfigurationError";
  }
}

export function hasAiConfig() {
  return Boolean(process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY);
}

export function getAiModel() {
  return process.env.OPENAI_MODEL || process.env.CHATGPT_MODEL || "gpt-4.1-mini";
}

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
    "SuperTech is an African marketplace for tech, beauty, wellness, home essentials, vendors, product requests, cart orders, and order tracking.",
    "Important customer paths: /catalog, /request-product, /track-order, /cart, /vendors, /become-vendor, /account.",
    "Sample products:",
    productLines,
    "Sample vendors:",
    vendorLines,
  ].join("\n");
}

export async function generateAiText({
  instructions,
  input,
  temperature = 0.5,
  maxOutputTokens = 900,
}: GenerateAiTextOptions) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) {
    throw new AiConfigurationError();
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getAiModel(),
      instructions,
      input,
      temperature,
      max_output_tokens: maxOutputTokens,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as OpenAITextResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "AI request failed.");
  }

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim();

  if (!outputText) {
    throw new Error("The AI did not return any text.");
  }

  return outputText;
}
