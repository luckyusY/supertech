/**
 * Provider resolution for SuperTech AI features.
 *
 * Two providers are supported today:
 * - `deepseek` — DeepSeek's OpenAI-compatible Chat Completions API (default)
 * - `openai`   — the OpenAI Responses API (also used for ChatGPT-labelled keys)
 *
 * SuperTech runs on DeepSeek, so it is preferred when `AI_PROVIDER` is unset.
 * OpenAI stays supported as a fallback: with no DeepSeek key but an OpenAI one
 * configured, OpenAI is still used, so older deployments keep working.
 */

export type AiProviderId = "openai" | "deepseek";

/** Wire protocol a provider speaks. DeepSeek only offers chat completions. */
type AiWireProtocol = "responses" | "chat";

type AiProviderDefinition = {
  id: AiProviderId;
  label: string;
  protocol: AiWireProtocol;
  apiKeyEnv: string[];
  modelEnv: string[];
  baseUrlEnv: string[];
  defaultBaseUrl: string;
  defaultModel: string;
  endpointPath: string;
  /** Where to create a key, shown in configuration errors. */
  keyHint: string;
};

export type ResolvedAiProvider = {
  id: AiProviderId;
  label: string;
  protocol: AiWireProtocol;
  apiKey: string;
  model: string;
  endpoint: string;
};

const PROVIDERS: AiProviderDefinition[] = [
  {
    id: "deepseek",
    label: "DeepSeek",
    protocol: "chat",
    apiKeyEnv: ["DEEPSEEK_API_KEY"],
    modelEnv: ["DEEPSEEK_MODEL"],
    baseUrlEnv: ["DEEPSEEK_BASE_URL"],
    defaultBaseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
    endpointPath: "/chat/completions",
    keyHint: "DEEPSEEK_API_KEY",
  },
  {
    id: "openai",
    label: "OpenAI",
    protocol: "responses",
    apiKeyEnv: ["OPENAI_API_KEY", "CHATGPT_API_KEY"],
    modelEnv: ["OPENAI_MODEL", "CHATGPT_MODEL"],
    baseUrlEnv: ["OPENAI_BASE_URL"],
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4.1-mini",
    endpointPath: "/responses",
    keyHint: "OPENAI_API_KEY",
  },
];

/** Friendly spellings accepted in AI_PROVIDER. */
const PROVIDER_ALIASES: Record<string, AiProviderId> = {
  deepseek: "deepseek",
  "deep-seek": "deepseek",
  deep_seek: "deepseek",
  openai: "openai",
  "open-ai": "openai",
  chatgpt: "openai",
  gpt: "openai",
};

export function readEnvValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value || value === '""' || value === "''") return "";
  return value;
}

function readFirstEnvValue(names: string[]) {
  for (const name of names) {
    const value = readEnvValue(name);
    if (value) return value;
  }
  return "";
}

function buildEndpoint(definition: AiProviderDefinition) {
  const baseUrl =
    readFirstEnvValue(definition.baseUrlEnv) || definition.defaultBaseUrl;
  return `${baseUrl.replace(/\/+$/, "")}${definition.endpointPath}`;
}

function resolveDefinition(definition: AiProviderDefinition): ResolvedAiProvider | null {
  const apiKey = readFirstEnvValue(definition.apiKeyEnv);
  if (!apiKey) return null;

  return {
    id: definition.id,
    label: definition.label,
    protocol: definition.protocol,
    apiKey,
    model: readFirstEnvValue(definition.modelEnv) || definition.defaultModel,
    endpoint: buildEndpoint(definition),
  };
}

/** The provider named in AI_PROVIDER, or null when it is unset/unrecognised. */
function getRequestedDefinition(): AiProviderDefinition | null {
  const requested = readEnvValue("AI_PROVIDER").toLowerCase();
  if (!requested) return null;

  const id = PROVIDER_ALIASES[requested];
  return PROVIDERS.find((provider) => provider.id === id) ?? null;
}

/**
 * Returns the provider the app should call, or null when nothing is configured.
 * An explicit AI_PROVIDER is never silently swapped for another provider — if
 * its key is missing the app reports itself as unconfigured instead.
 */
export function resolveAiProvider(): ResolvedAiProvider | null {
  const requested = getRequestedDefinition();
  if (requested) return resolveDefinition(requested);

  for (const definition of PROVIDERS) {
    const resolved = resolveDefinition(definition);
    if (resolved) return resolved;
  }

  return null;
}

/** Env var name to set when AI is unconfigured, tailored to AI_PROVIDER. */
export function getMissingKeyHint() {
  const requested = getRequestedDefinition();
  if (requested) return requested.keyHint;
  return "DEEPSEEK_API_KEY or OPENAI_API_KEY";
}

export class AiConfigurationError extends Error {
  constructor() {
    super(`AI is not configured. Add ${getMissingKeyHint()} in your environment settings.`);
    this.name = "AiConfigurationError";
  }
}

export function hasAiConfig() {
  return resolveAiProvider() !== null;
}

/** Model id of the active provider, falling back to the default when unset. */
export function getAiModel() {
  const provider = resolveAiProvider();
  if (provider) return provider.model;

  const requested = getRequestedDefinition() ?? PROVIDERS[0];
  return readFirstEnvValue(requested.modelEnv) || requested.defaultModel;
}

/** Active provider id, or the requested one when it is not configured yet. */
export function getAiProviderId(): AiProviderId {
  return (resolveAiProvider() ?? getRequestedDefinition() ?? PROVIDERS[0]).id;
}

/** Human-readable provider name for dashboards and status endpoints. */
export function getAiProviderLabel() {
  return (resolveAiProvider() ?? getRequestedDefinition() ?? PROVIDERS[0]).label;
}
