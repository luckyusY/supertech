# SuperTech Marketplace

A multivendor ecommerce starter for `Next.js 16`, `React 19`, `MongoDB`, `Cloudinary`, and `Vercel`.

## Product design

Active UX/product plan and execution roadmap:

- [`docs/PRODUCT_DESIGN_PLAN.md`](./docs/PRODUCT_DESIGN_PLAN.md) — strategy, journeys, CTA rules, phases  
- `src/lib/product-rules.ts` — marketplace modes, PDP buy-box plan, order status meta  
- `src/components/ui/*` — shared design primitives  

## What is included

- Premium storefront homepage with category and vendor sections
- Catalog, product detail, vendor directory, and vendor storefront pages
- Vendor dashboard and admin dashboard starter shells
- MongoDB connection helper for Atlas or any compatible cluster
- Cloudinary configuration and signed upload endpoint starter
- `.env.example` with the variables needed for local development and Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` file from `.env.example`.

```bash
cp .env.example .env.local
```

Required for real integrations:

- `MONGODB_URI`
- `MONGODB_DB`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`

## AI provider

SuperTech runs its AI features on **DeepSeek**. AI search, product
recommendations, support chat, product copy, and the blog writer all go through
one provider.

Create a key at [platform.deepseek.com](https://platform.deepseek.com) and add
it to `.env.local`:

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-key
DEEPSEEK_MODEL=deepseek-chat
```

`deepseek-reasoner` also works if you want DeepSeek's reasoning model; the
temperature is dropped automatically for it because DeepSeek ignores sampling
parameters on reasoning models.

OpenAI/ChatGPT remains supported as a fallback so older deployments keep
working, but it is not what the app is built around:

| Provider | API key | Model variable | Default model |
| --- | --- | --- | --- |
| DeepSeek (default) | `DEEPSEEK_API_KEY` | `DEEPSEEK_MODEL` | `deepseek-chat` |
| OpenAI / ChatGPT (fallback) | `OPENAI_API_KEY` (or `CHATGPT_API_KEY`) | `OPENAI_MODEL` | `gpt-4.1-mini` |

Notes:

- `AI_PROVIDER` accepts `deepseek` or `openai`. Leave it blank and DeepSeek is
  preferred whenever `DEEPSEEK_API_KEY` is set; otherwise OpenAI is used.
- If `AI_PROVIDER` names a provider whose key is missing, the app reports AI as
  "not configured" rather than silently calling the other provider.
- `DEEPSEEK_BASE_URL` / `OPENAI_BASE_URL` let you point at a proxy or gateway.
- The active provider and model are shown in the admin **AI Studio** header and
  in `GET /api/health`.

## Suggested next steps

1. Add authentication for admins, vendors, and customers.
2. Persist vendors, products, carts, and orders in MongoDB.
3. Connect Cloudinary uploads to the vendor product creation flow.
4. Add cart, checkout, payments, and vendor payout orchestration.
5. Protect dashboard routes with role-based access control before going live.
"# Deployment fix - $(date)"  
