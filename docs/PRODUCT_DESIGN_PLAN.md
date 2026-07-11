# SuperTech Product Design Master Plan

**Status:** Active — execution started  
**Owners:** Product design + engineering  
**Last updated:** 2026-07-11  
**Product:** Multivendor marketplace for East & West Africa  
**Stack:** Next.js 16 · React 19 · MongoDB · Capacitor

---

## 0. Product thesis

### Problem
Shoppers face untrusted sellers, fragmented discovery (WhatsApp/Instagram/markets), missing catalog items, and opaque post-payment status. Sellers lack a trusted storefront, clean order ops, and listing tools.

### Positioning
**SuperTech is the trusted African marketplace where you can shop verified products, request what’s missing, pay the local way, and always know where your order stands.**

### Product promises (UI must make true)

| Promise | Design implication |
|--------|---------------------|
| Verified | Trust is a first-class UI object |
| Find or request | Catalog + Request Product are co-equal paths |
| Local payment | MoMo / pay methods visible before anxiety peaks |
| Trackable | Status timeline is a core surface |
| Seller-backed | Vendor identity is always one tap away |

### What “best” means
Highest **confidence per second of attention** — not the flashiest UI. Optimize decision quality and completion.

### Commerce model
Assisted commerce, not pure self-serve Amazon:

- Browse verified listings
- **Add to cart** and/or **request order**
- **WhatsApp** seller when needed
- **MoMoPay** and other local payment preferences
- **Track** order request status

See implementation: `src/lib/product-rules.ts`.

---

## 1. Personas & jobs-to-be-done

| Persona | Job | Success | Fear |
|---------|-----|---------|------|
| Amina — shopper | Buy without getting scammed | Clear price, verified seller, status | Fake product, lost money |
| Kofi — deal hunter | Complete a flash deal on mid-range Android | Fast UI, big price, obvious discount | Slow/confusing UI |
| Grace — requester | Get a missing item handled | Form → ID → track | Black-hole form |
| Isaac — new vendor | List + first order | Guided onboarding | Dashboard overwhelm |
| Admin ops | Clear queues | Batch actions, risk visibility | Missed pending items |

### JTBD

| When I… | I want to… | So I can… |
|---------|------------|-----------|
| Land on SuperTech | understand what it sells and why it’s safe | decide to browse |
| Search or browse | compare honest prices + seller trust | pick one product |
| Can’t find an item | request it in under 2 minutes | still get help |
| Place an order | know payment + next steps | feel in control |
| Wait for delivery | track without calling | reduce anxiety |
| Sell | list and fulfill without training | earn this week |
| Run the marketplace | clear today’s queue | keep quality high |

---

## 2. Core journeys (spines)

1. **Discover → Decide → Order** — Home → Search/Category → Catalog → PDP → Cart/Request → Confirm → Track  
2. **Request missing product** — Empty search → Request → Confirmation + ID → Track  
3. **Track without account friction** — Track → ID/phone → Timeline → Support  
4. **Vendor activation** — Apply → Approve → Checklist → Payment → First product → Live  
5. **Ops queue clear** — Attention → Table → Action → Done  

If a screen doesn’t serve a spine, deprioritize it.

---

## 3. Product principles

1. Trust is a feature  
2. Assisted commerce is OK (and should feel premium)  
3. One primary action per screen  
4. Mobile is the product  
5. Local by default (MoMo, WhatsApp, plain status language)  
6. Empty states are acquisition  
7. Ops UX is customer UX  
8. Honesty over hype — UI claims must be policy-backed  

---

## 4. Marketplace modes

Catalog spans goods, motors, and property. **Three mental models** need different card grammar and CTAs.

| Mode | Categories (examples) | Primary CTA style |
|------|----------------------|-------------------|
| `shop` | Tech, beauty, wellness, home, audio, gaming… | Add to cart + Request order |
| `motors` | Cars for sale/rent | Enquire / Request viewing |
| `property` | Apartments, land, commercial | Enquire / Request viewing |

Default landing experience = **Shop**. Motors/Property are secondary modes.

Implementation: `getMarketplaceMode(category)` in `src/lib/product-rules.ts`.

---

## 5. CTA decision matrix (PDP)

| Mode | Stock / listing | Primary | Secondary | Tertiary |
|------|-----------------|---------|-----------|----------|
| shop | Available | Request order (`/order?product=`) | Add to cart | WhatsApp |
| shop | Low / limited | Request order | Add to cart | WhatsApp |
| motors / property | Any | Enquire (`/order?product=`) | WhatsApp | Visit store |
| any | Out of stock label | Request product | WhatsApp | — |

Payment (MoMo) is **supporting UI**, not a competing primary CTA.

---

## 6. Order status system

Canonical statuses (shopper + vendor + admin share labels/colors):

| Status | Shopper label | Tone |
|--------|---------------|------|
| `pending_confirmation` | Pending confirmation | warning |
| `confirmed` | Confirmed | info |
| `preparing` | Preparing | neutral |
| `ready_for_delivery` | Ready for delivery | info |
| `out_for_delivery` | Out for delivery | brand |
| `completed` | Completed | success |
| `cancelled` | Cancelled | danger |

Implementation: `ORDER_STATUS_META` in `product-rules.ts`; UI: `StatusPill` / existing `OrderStatusBadge`.

---

## 7. Information architecture

### Shopper
```
Home
├── Search (global)
├── Categories / Modes
├── Deals
├── Official stores
├── Request product
├── Track order
├── Cart
└── Account
Help → Track, Request, Support, Policies
Sell on SuperTech
```

### Admin
Attention → Orders → Approvals → Catalog → Sellers → Content → Insights → Settings  

### Vendor
Home (next steps) → Orders → Products → Storefront → Money → Growth → Profile  

---

## 8. Experience specs (by surface)

### Header
- Sticky primary bar only on mobile: logo · search · account · cart  
- Search is product: typeahead later; AI as progressive enhancement inside field  
- Help is a real menu (not mislabeled track)  
- Remove duplicate mobile quick-link grid when bottom nav covers destinations  

### Hero
- Answers: what is this, what’s hot, where do I start  
- Campaign-led slides; stats in trust strip under hero  
- Right rail: max 2 promo modules  

### Homepage
- Narrative: hero → categories → flash (if real) → top selling → stocked shelves only → stores → sell CTA  
- Reduce full-page orange wash; orange = action accent  

### PDP
- Mode-aware buy box (see §5)  
- Trust row: verified seller, ship window, buyer protection  
- Sticky mobile action bar  
- MoMo as payment guidance block  

### Request / Track
- Flagship differentiators; confirmation always yields trackable ID  

### Dashboards
- **Attention model**: what needs me now  
- Dense tables for queues; cards only for KPIs  
- Vendor onboarding checklist  

---

## 9. Design system

### Foundations (`globals.css`)
- Color roles, type scale, spacing, elevation, motion, z-index, radii  
- Shelf tokens preserved for commerce personality  

### Primitives (`src/components/ui/`)
- `Button`, `Badge`, `StatusPill`, `EmptyState`, `Price`  

### Patterns (planned)
- PageHeader, CommandBar, DataTable, ListRow, BuyBox, Shelf, SellerBadge  

### Visual rules
- Accent orange = primary actions only  
- Page bg = warm neutral  
- Dark = authority (footer, ops nav)  
- White cards = commerce content  

---

## 10. Content & trust policy

- Announcement bar messages must be real policy or removed  
- “Verified” links to a short definition of what SuperTech checks  
- Shipping/dispatch claims only when data supports them  
- Buttons use verbs; errors include fix; empty states offer next action  

---

## 11. Prioritized roadmap

| Phase | Focus | Outcome | Status |
|-------|--------|---------|--------|
| **0** | Foundations: rules, tokens, primitives | Consistent decisions | **Done** |
| **1** | Conversion spine: PDP buy box, confirm→track | Clear next action | **Done** (PDP + sticky CTA) |
| **2** | Header + search simplification | Faster discovery | **Done** (v1) |
| **3** | Homepage + hero hierarchy | Clear first impression | **Done** (v1) |
| **4** | Catalog + mode-aware filters | Better comparison | **Done** (v1 modes/sort/empty) |
| **5** | Admin/vendor attention dashboards | Ops & seller speed | **Done** (v1 Attention + checklist) |
| **6** | Unify `/app` + typeahead + mode cards | One product language | **Done** (v1) |
| **7** | Instrumentation / a11y deep audit | Measurable quality | **Done** (v1 events + a11y + nav badges) |

### Execution order (engineering)
1. `docs/PRODUCT_DESIGN_PLAN.md` + `src/lib/product-rules.ts`  
2. Tokens + `src/components/ui/*`  
3. PDP buy box + sticky mobile CTA  
4. Header/search cleanup  
5. Homepage/hero  
6. Dashboard attention model  

---

## 12. Metrics

**North star:** Successful order completions per week (confirmed/paid per ops definition).

| Journey | Leading indicators |
|---------|-------------------|
| Discover | Search usage, time to first PDP |
| Decide | PDP → primary CTA rate |
| Complete | CTA → confirmation rate |
| Track | Track page usage post-order |
| Vendor | Time to first live product |
| Admin | Median queue clear time |

**Guardrails:** support tickets/order, vendor listing completion, a11y, mobile LCP/CLS.

---

## 13. Non-goals

- Visual rebrand for its own sake  
- Dashboard gamification  
- Second design system for `/app`  
- Infinite homepage sections  
- AI blocking core search  
- Pixel-copy of Amazon/Jumia without MoMo/request/track reality  

---

## 14. Definition of done

1. New shopper understands offer in ~5 seconds  
2. Find **or** request without dead ends  
3. Every PDP explains how buying works here  
4. Every order has a calm trackable after-state  
5. New vendor always sees one next step  
6. Admin sees what needs action today  
7. System is consistent, accessible, fast on mid-range Android  
8. Claims in UI are true  

---

## 15. Key files

| File | Role |
|------|------|
| `docs/PRODUCT_DESIGN_PLAN.md` | This plan |
| `src/lib/product-rules.ts` | Modes, CTAs, status meta |
| `src/app/globals.css` | Design tokens |
| `src/components/ui/*` | Primitives |
| `src/components/product-buy-box.tsx` | PDP commerce decision UI |
| `src/components/site-header.tsx` | Shopper chrome |
| `src/components/hero-slider.tsx` | Hero stage |
| `src/app/products/[slug]/page.tsx` | PDP |
| `src/app/dashboard/**` | Ops / seller |

---

## 16. Changelog

| Date | Change |
|------|--------|
| 2026-07-11 | Plan documented; Phase 0–1 execution started (rules, tokens, primitives, PDP buy box, header) |
| 2026-07-11 | Phase 3–5: trust strip, hero campaign slides, homepage hierarchy, catalog modes/sort/empty→request, admin Attention, vendor checklist cockpit |
| 2026-07-11 | Phase 6: search typeahead API + header dropdown, mode-aware product cards, /app shell token unification |
| 2026-07-11 | Phase 7: admin/vendor nav badges, `/api/events` product analytics, skip link, `/` search hotkey, status timeline tokens |
| 2026-07-11 | Phase 7+: admin Product Events page, dense order queue (filters/search/expandable rows) |
| 2026-07-11 | Vendor order queue densified (filters/search/expandable); product status pills tokenized |
