# SuperTech — project notes for Claude

Multivendor marketplace on Next.js 16, React 19, MongoDB, Cloudinary, deployed
to Vercel. Kigali, Rwanda; prices in RWF.

## AI provider: DeepSeek

**SuperTech uses DeepSeek, not ChatGPT/OpenAI.** Default to DeepSeek for any
new AI work, and do not reintroduce OpenAI as the primary provider.

- Provider resolution lives in `src/lib/ai-provider.ts`; request/response and
  SSE handling in `src/lib/ai.ts`. Every AI feature goes through
  `generateAiText` / `streamAiText` — do not call a provider API directly from
  a route.
- Select with `AI_PROVIDER` (`deepseek` | `openai`). When unset, DeepSeek wins
  if `DEEPSEEK_API_KEY` is set. Config: `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`
  (default `deepseek-chat`), `DEEPSEEK_BASE_URL`.
- DeepSeek speaks OpenAI-compatible **Chat Completions**
  (`/chat/completions`, `messages`, `max_tokens`) — *not* the OpenAI Responses
  API (`/responses`, `instructions`/`input`, `max_output_tokens`). The two
  protocols are branched on `provider.protocol` (`"chat"` vs `"responses"`).
- `deepseek-reasoner` ignores sampling parameters, so `temperature` is omitted
  for it. Its streamed `reasoning_content` is skipped; only `content` is
  emitted.
- OpenAI/ChatGPT is kept only as a fallback for older deployments.

AI features in the app: `/api/ai/search`, `/api/ai/recommend`,
`/api/ai/support`, `/api/ai/content`, `/api/ai/product-copy`,
`/api/ai/product-blog`.

## Conventions

- Secrets belong in `.env.local` (gitignored). Never commit a real API key;
  `.env.example` carries blank placeholders only.
- Checks before pushing: `npx tsc --noEmit`, `npx eslint src/`, `npm run build`.
  The repo has pre-existing lint errors in unrelated files — do not treat them
  as regressions, just keep touched files clean.
- Dev server is `npm run dev` (`node server.mjs`, which loads `.env.local`).
