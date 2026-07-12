# SuperTech Android — Forms · Checkout · Cart · Lists · Icons · Images Plan

**Role:** Senior Kotlin app designer  
**App:** `mobile/android`  
**Date:** 2026-07-12  
**Status:** Ready to implement  
**Companions:** `ANDROID_APP_UI_UX_PRO_PLAN.md`, `ANDROID_SCREEN_MOTION_INTELLIGENCE_PLAN.md`  
**Web reference:** `src/components/product-card.tsx` (storefront) + `app-product-card.tsx` (web app shell)

---

## 0. North star

> Forms feel trustworthy and remember you.  
> Cart and checkout feel like retail, not a spreadsheet.  
> **Product cards match the website retail card** — wishlist, rating, clear cart/enquire CTAs.  
> Every list is scannable: **# · image · title · status · money · action**.  
> Header icons mean what they say. Stores look like stores.

---

## 1. Current-state audit (root causes)

| Issue | Reality today | Why |
|-------|---------------|-----|
| **Product card incomplete** | Has image + weak ♥ + tiny “＋” only | Missing web parity: vendor·★rating, full **Add** CTA with bag icon, WhatsApp, compare-at, mode badges |
| **Add-to-cart not visible** | 36dp orange circle with “＋” glyph | Easy to miss; no `ShoppingBag` icon; not full-width brand bar like website |
| **No review / rating on card** | Meta is only “by vendor” or category | API product payload omits `rating` / `reviewCount`; UI never draws ★ |
| **Like feels weak** | Dark translucent disc + white heart | Website = **white circle** + muted/filled heart (clearer on photos) |
| **Header icons wrong** | Phone = `ic_support` (headset); WhatsApp = `ic_sparkle` (stars) | Wrong drawables wired in `darkShopperHeader()` |
| **Official stores no images** | Vendor cards use **letter avatar** only | (1) Mobile API omits cover; (2) model/UI ignore images |
| **Admin/vendor product lists plain** | Text cards only — no thumb, no row # | Cards built as title + status + buttons |
| **Orders / dashboard rows** | No #, rarely product image | Same pattern |
| **Cart UI basic** | Small thumb only if product still in memory; no remove; stepper cramped | `Cart.Line` lacks `heroImage`; no delete control |
| **Checkout OK but thin** | Prefills name/email only; no sticky summary; success exists | Needs visual order cards + sticky place-order |
| **Forms forget** | Leave Request/BecomeVendor → data gone | No draft store |
| **Images only on VendorProduct** | Request/BecomeVendor can’t attach photos | No shared image picker component |

---

## 1B. Product card — website parity (critical)

**Reference implementation:** `src/components/product-card.tsx` (primary retail card).  
Also: `app-product-card.tsx` (compact web-app variant with full-width Add + green WA).

### Website anatomy (must mirror on Android)

```
┌─────────────────────────────────────┐
│  [IMAGE / gallery]                  │
│  badges TL: -% / Motors / badge     │
│  ♥ wishlist TR  (white 32 circle)   │
├─────────────────────────────────────┤
│  Vendor name  ·  ★ 4.8 or “New”     │
│  Product title (2 lines)            │
│  RWF price  [compare-at strike]     │
│  Save amount  OR  stock label       │
│  ┌──────────────┐ ┌────┐            │
│  │ 🛍 Add/Enquire│ │ 💬 │  ← footer │
│  └──────────────┘ └────┘            │
└─────────────────────────────────────┘
```

| Zone | Website | Android now | Target |
|------|---------|-------------|--------|
| Image | Cover, multi if gallery | Cover 144dp | Keep cover; optional multi later |
| Badge TL | Discount % / mode / badge | stock or badge only | Mode chip (Motors/Property) + badge; discount if `compareAt` |
| Wishlist | White circle, Heart fill accent | Dark disc, white/rose | **White 32–36dp circle**, muted heart → filled brand/rose when saved |
| Meta | Vendor · ★ rating / “New” | “by vendor” only | **Vendor · ★ X.X** or **New** (gold star) |
| Title | 2 lines semibold | 2 lines bold | Keep, 13–14sp |
| Price | Large ink/brand + strike compare | Brand only | Price + optional strike `compareAt` + “asking” for big-ticket |
| Primary CTA | **Full-width orange** + ShoppingBag + “Add to cart” / Enquire | Tiny ＋ circle | **Full-width h-40 bar**: bag icon + “Add” / “Enquire” / “Request” |
| Secondary | WhatsApp MessageCircle 36 square | Missing | **Green or teal WA icon button** beside CTA |

### Why add-to-cart feels invisible
1. “＋” is not a shopping bag — low recognition  
2. 36dp sits in the price row — competes with price, small hit target on 2-col grid  
3. No label (“Add”) — website always shows text + icon  
4. Same orange as price → less contrast hierarchy  

**Fix:** Move commerce actions to a **footer row** with border-top (like web), not crammed into price line.

### Data the card needs

| Field | Source today | Action |
|-------|--------------|--------|
| `heroImage`, name, price, badge, stock, category, vendorSlug | Marketplace API ✓ | Keep |
| `rating`, `reviewCount` | **Missing** on product mobile JSON | Add from product model / reviews aggregate |
| `compareAt` | **Missing** on mobile JSON | Add if present on product |
| `vendorName` | Resolved client-side from vendors list | Prefer API `vendorName` for card paint without join |
| Vendor WhatsApp | Not on mobile product | Optional: default SuperTech WA (current PDP) |

API extend (`/api/mobile/marketplace` products):

```ts
rating: product.rating ?? 0,
reviewCount: product.reviewCount ?? 0,
compareAt: product.compareAt ?? null,
vendorName: vendorNameBySlug[product.vendorSlug] ?? "",
```

### Android layout spec (`gridProductCard` rewrite)

```
FrameLayout image 148dp
  ImageView CENTER_CROP
  badges column top-start
  wishlist button top-end  (white circle, 34dp)

LinearLayout body pad 10–12
  meta row: vendor (muted 11) · ★ gold + rating/"New"
  title 13–14 bold, 2 lines minHeight
  price block: price 15–16 bold brand; strike muted if compareAt
  stock/save line 11 muted/success

LinearLayout footer pad 8, border-top 1px line
  weight 1: Button orange h-40  "🛍 Add" | "Enquire" | "Request"
  40dp: WhatsApp button (green #1FAE5B or #128C7E)
```

**Icons to add:** `ic_cart_bag` or reuse `ic_cart` (tinted white on CTA), `ic_whatsapp` / message, `ic_star` already exists.

### Mode rules (same as website)

| Mode | Primary CTA | Secondary |
|------|-------------|-----------|
| shop + in stock | Add to cart (+ bag icon) | WhatsApp |
| shop OOS | Request | WhatsApp |
| motors / property | Enquire | WhatsApp |

### Like / wishlist polish
- Match website: `bg white/95`, border subtle, heart muted → filled when saved  
- Bounce animation keep  
- Don’t use dark scrim unless image is very light (optional adaptive later)  

### Surfaces using the new card
- Home Featured (optional horizontal can use same body)  
- Home Fresh grid  
- Shop grid  
- Search results  
- Empty cart “Popular now”  
- List-style `productCard` (horizontal) can keep denser layout but should still show ★ + clearer cart  

### Acceptance (product card)
- [ ] Side-by-side with website: same information hierarchy in 3 seconds  
- [ ] Add button is **readable without guessing** (icon + text, full width)  
- [ ] ★ or “New” always visible  
- [ ] Heart visible on light and dark product photos  
- [ ] WhatsApp one tap from card  
- [ ] Motors/Property never show misleading “Add”

---

## 2. Design contracts

### 2.1 Universal list row (ops + shopper dense lists)

```
┌────────────────────────────────────────────────────────┐
│ #12  [IMG 56]  Title (bold, 2 lines)      [status pill]│
│              Meta · vendor · date                       │
│              RWF 125,000              [primary action]  │
└────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| **#** | 11–12sp muted, tabular, width ~36dp, right-aligned number |
| **Image** | 52–56dp square, radius 10, `CENTER_CROP`, placeholder color |
| **Title** | 15sp bold ink, max 2 lines |
| **Meta** | 12sp muted, 1 line ellipsis |
| **Status** | Semantic chip (existing colors) |
| **Money** | Brand bold, right or under meta |
| **Hit** | Whole row ≥ 64dp; actions 44dp |

**Pagination later:** show “Showing 1–25 of N”; for now **#** = 1-based index in current list (or page-aware when paging lands).

### 2.2 Vendor / store card (shopper)

```
┌──────────────────────────────────────┐
│ [Cover 100% × 96]  or solid accent   │
│  (logo 48 circle overlapping bottom) │
│  Name ★4.8 · Kigali                  │
│  Headline                            │
│  N products · response · [Visit]     │
└──────────────────────────────────────┘
```

Fallback if no image: gradient from `accent` + letter mark (current) — never empty gray box.

### 2.3 Form system

| Element | Spec |
|---------|------|
| Section card | White, 16 radius, label above field |
| Field | 48dp min height, 14sp, focus = brand border |
| Multline | min 3 lines for notes/description |
| Errors | Red helper under field + shake card |
| Sticky CTA | Optional bottom bar for long forms (checkout, list product) |
| Draft | Auto-save 400ms after edit; restore on reopen; clear on success |

### 2.4 Image attachment block (reusable)

```
┌─ Media ─────────────────────────────────┐
│ [Preview 160h or grid of thumbs]        │
│ [Upload from gallery]  [Take photo*]    │
│ or paste URL                            │
│ helper: “JPG/PNG, max ~5MB”             │
└─────────────────────────────────────────┘
```

\*Camera optional P2; gallery + URL in P1.

**Where required / optional:**

| Form | Images |
|------|--------|
| VendorProduct | **Required** (hero) — already has upload |
| Request product | **Optional** reference photo (helps vendors quote) |
| Become vendor | **Optional** shop logo / storefront |
| Checkout | Not needed |
| Track / auth | Not needed |
| Admin AI studio | Optional reference later |

---

## 3. Header icons (quick fix, high visibility)

| Control | Now | Correct |
|---------|-----|---------|
| Call | `ic_support` | **`ic_phone`** (new vector: handset) |
| WhatsApp | `ic_sparkle` | **`ic_whatsapp`** (new vector: WA-style glyph) or label “WA” in green circle |
| Search | `ic_search` | Keep (correct) |
| Logo | launcher | Keep; ensure tap → Home |

Also audit dock: Home/Browse/Request/Stores/Account/Cart icons — verify meaning matches label (likely OK).

---

## 4. Official stores — images end-to-end

### 4.1 API (required)

**Root cause confirmed:** Domain vendors already have `coverImage` + `logoMark` in `src/lib/marketplace.ts` / Mongo — but  
`GET /api/mobile/marketplace` **drops them** and only returns slug/name/headline/location/rating/counts.

Extend vendor payload:

```ts
vendors: vendors.map((v) => ({
  // existing…
  coverImage: v.coverImage ?? "",
  logoMark: v.logoMark ?? "",   // short letters e.g. "AL" — fallback if no photo
  accent: v.accent,
  // if a true logo URL field is added later, include logoUrl too
}))
```

Android: load `coverImage` as banner/thumb; if blank, show accent gradient + `logoMark` (or first letter).

### 4.2 Android model

```kotlin
data class Vendor(
  …,
  val logo: String,
  val coverImage: String,
  val accent: String,
)
```

Parse in `parseVendors`. Prefer `coverImage` for banner; `logo` for circle; fallback letter.

### 4.3 Surfaces that must show store images

| Surface | Image |
|---------|--------|
| Stores tab list | Cover + logo |
| Home “Top vendors” strip | Logo or cover thumb |
| Browse → Vendors sheet | Logo thumb |
| VendorProfile header | Cover + logo |
| Admin vendors list | Logo thumb + # |

---

## 5. Cart UI upgrade

### 5.1 Data model

```kotlin
// Cart.Line
slug, name, price, qty,
heroImage: String = "",   // NEW — persist with add()
category: String = "",    // optional mode
```

`addToCart` / `Cart.add` always pass `heroImage`. Checkout summary uses same thumbs.

### 5.2 Cart line UI

```
[IMG 72]  Name (2 lines)
          RWF unit · line total
          [−] qty [+]     [Remove]
```

| Improvement | Detail |
|-------------|--------|
| Larger image | 72dp crop |
| Line total | `qty × price` under unit |
| Remove | Text “Remove” or trash icon, 44dp |
| Stepper | 40dp targets |
| Sticky bar | Keep; show item count + total + Checkout |
| Empty | Keep popular picks (done) |

### 5.3 Persistence (P2)

Optional: save cart JSON to SharedPreferences so cart survives process death.

---

## 6. Checkout upgrade

### 6.1 Layout (Frame F + sticky)

```
[ Order items — image rows, not plain text only ]
[ Contact form — remembered fields ]
[ Contact preference chips ]
[ Payment preference chips ]
──── sticky ────
Total RWF …     [ Place order request ]
```

### 6.2 Intelligence

| Field | Prefill source (priority) |
|-------|---------------------------|
| Name | Session → FormDraft checkout → empty |
| Email | Session → draft |
| Phone | Draft → session phone if API adds it |
| City / address | Draft last successful order |
| After success | Clear cart + clear checkout draft; save phone/city to “profile draft” for next time |

### 6.3 Validation UX

- Inline under first invalid field  
- Shake form card  
- Disable double-submit (exists)  
- Success screen: order id if API returns + Track + Home (partially done)

### 6.4 Visual

- Each cart line mini-row with image  
- Total emphasized  
- Sticky primary never off-screen on long phones  

---

## 7. Forms — remember + polish

### 7.1 `FormDraft` helper

```kotlin
object FormDraft {
  fun save(context, key: String, map: Map<String, String>)
  fun load(context, key: String): Map<String, String>
  fun clear(context, key: String)
}
```

Keys: `request_product`, `checkout`, `become_vendor`, `track_order`.

### 7.2 Restore rules

1. On open: load draft → set fields (don’t override intent prefill from PDP if present for product name).  
2. On text change: debounce 400ms → save.  
3. On success submit: clear that draft.  
4. On back with dirty: optional “Keep draft?” — default **auto-keep** (simpler).

### 7.3 Form polish checklist (all forms)

- [ ] Labels consistent (`fieldLabel`)  
- [ ] 48dp fields  
- [ ] Keyboard next/done chain  
- [ ] Multiline notes  
- [ ] Error color + shake  
- [ ] Success not only toast (Request/BecomeVendor get success card like Checkout)  
- [ ] Image block where listed in §2.4  

### 7.4 Request product — image

Optional “Reference photo” using shared uploader (reuse VendorProduct upload endpoint if public; else store data-URI/temp URL only if API supports — **check `/api` for product-request image field**).

If API has no image field yet: still allow pick → upload to same media endpoint as vendor → put URL in `notes` or new `referenceImage` JSON field (add API field if missing).

---

## 8. Every list looks good — inventory

### 8.1 Shared builders in `BaseActivity` / `ListUi.kt`

| Builder | Use |
|---------|-----|
| `numberedThumbRow(#, imageUrl, title, meta, status, money?, onClick?)` | Products, orders, submissions |
| `listHeaderRow(columns)` | Optional table chrome |
| `rowNumber(n)` | Muted # |
| `thumb(url, size, fallbackColor)` | ImageView + loadImage |

### 8.2 Screen mapping

| Screen | # | Image | Notes |
|--------|---|-------|-------|
| **Admin products** submissions + seeds | Yes | `heroImage` | Load thumb left |
| **Vendor dashboard** recent products | Yes | `heroImage` | Tap edit |
| **Admin moderation** products | Yes | `heroImage` | Approve cards |
| **Admin vendors** | Yes | logo | Status enable/disable |
| **Orders** admin/vendor | Yes | first item image if API has it; else box icon | Status chip + actions |
| **Payouts** | Yes | — or vendor logo | Money primary |
| **Dashboard** vendor product rows | Yes | hero | Compact |
| **Stores** (shopper) | Optional # | cover/logo | See §4 |
| **Cart** | Optional # | hero | See §5 |
| **Admin categories** | Yes | optional icon | Counts |
| **Blogs** | Yes | hero | Already partial |

### 8.3 API fields to ensure on list endpoints

| Endpoint | Need |
|----------|------|
| `/api/admin/products` | `heroImage` on submissions + seeds |
| `/api/product-submissions` | `heroImage` |
| `/api/order-requests` | `productImage` or items[].image if available |
| `/api/mobile/marketplace` vendors | `logo`, `coverImage` |
| `/api/admin/vendors` | `logo` / `coverImage` |

If backend field missing, UI still shows placeholder — never crash.

---

## 9. Numbering rules

```
index on page: 1..N
display: "#${index}" or just "${index}."
font: 12sp muted, tabular if possible
```

When filters apply, renumber visible list 1..N (ops-friendly for “the third one”).  
Future: global index with pagination = `(page-1)*pageSize + i + 1`.

---

## 10. Implementation roadmap

### Phase L0 — Product card website parity (½–1 day) **DO FIRST / WITH L1**
0. API: product `rating`, `reviewCount`, `compareAt`, `vendorName` on mobile marketplace  
1. Rewrite `gridProductCard` to match web anatomy (meta ★, price block, footer CTA + WA)  
2. Wishlist button = white circle (web style)  
3. Primary CTA full-width: `ic_cart` + “Add” / “Enquire” / “Request” (mode-aware)  
4. Icons: ensure star gold, cart white-on-orange, WA green  
5. Apply to Home Fresh, Shop, Popular-now, Featured tiles as appropriate  

### Phase L1 — Header icons + store images
6. Add `ic_phone.xml`, `ic_whatsapp.xml`  
7. Wire header call/WA icons (stop using sparkle for WA)  
8. API: vendor `coverImage` + `logoMark` on mobile marketplace  
9. Parse Vendor; redesign store cards + home strip + browse vendors  
10. VendorProfile cover if needed  

### Phase L2 — List row system (ops)
11. `numberedThumbRow` / `thumb()` helpers  
12. Admin products, moderation, vendor product rows (# + hero)  
13. Orders rows with # + image when available  
14. Admin vendors with logo + #  
15. Dashboard recent products thumbs + #  

### Phase L3 — Cart + checkout
16. Cart.Line + heroImage  
17. Cart card redesign (image, remove, totals)  
18. Checkout item thumbs + sticky place bar  
19. FormDraft for checkout fields  

### Phase L4 — Forms memory + images
20. `FormDraft` for Request, BecomeVendor, Track  
21. Shared `ImagePickerBlock`  
22. Request optional reference image  
23. BecomeVendor optional logo  
24. Success states for Request / BecomeVendor  

### Phase L5 — Polish
25. Cart disk persistence  
26. Camera capture  
27. List pagination with global #  
28. Multi-image swipe on card (optional, web gallery parity)

---

## 11. File touch map

| File | Change |
|------|--------|
| `MainActivity.kt` → `gridProductCard` | **Full website-parity product card** |
| `MainActivity.kt` → `Product` data class | `rating`, `reviewCount`, `compareAt`, `vendorName` |
| `res/drawable/ic_phone.xml`, `ic_whatsapp.xml` | Header + card WA |
| `MainActivity.kt` | Header icons; vendor parse/UI; cart card; addToCart image |
| `Cart.kt` | `heroImage` on Line |
| `CheckoutActivity.kt` | Thumbs, sticky, drafts |
| `BaseActivity.kt` or `ListUi.kt` | numberedThumbRow, image block, form field polish |
| `FormDraft.kt` | Prefs drafts |
| `AdminProductsActivity.kt` | # + thumb rows |
| `AdminModerationActivity.kt` | # + thumb |
| `AdminVendorsActivity.kt` | # + logo |
| `DashboardActivity.kt` | productRow thumbs + # |
| `OrdersActivity.kt` | # + image if any |
| `RequestProductActivity.kt` | Draft + optional image |
| `BecomeVendorActivity.kt` | Draft + optional logo |
| `VendorProductActivity.kt` | Align image block to shared component |
| `src/app/api/mobile/marketplace/route.ts` | products: rating/reviewCount/compareAt; vendors: coverImage |

---

## 12. Success criteria

| Check | Pass |
|-------|------|
| **Product card** | Matches website: ♥, ★/New, full Add bar + WA; ＋-only gone |
| **Add CTA** | Bag icon + label, full width, obvious on 2-col grid |
| **Rating** | Shows ★ score or “New” on every grid card |
| Header | Phone looks like phone; WA looks like WhatsApp (not sparkle) |
| Stores | Cover/logo when API has data; letter fallback otherwise |
| Product lists | Every ops product row shows thumb + # |
| Cart | Image at add-time; Remove works |
| Checkout | Item images; sticky place; fields remembered |
| Forms | Reopen Request → draft still there until success |
| Scan test | Admin products identifiable in 2 seconds |

---

## 13. Recommended next step

Implement in order:

1. **L0 Product card** (website parity — like, review, visible Add + WA)  
2. **L1** Header icons + store covers  
3. **L2** Numbered image lists for admin/vendor  
4. **L3–L4** Cart, checkout, form drafts  

Say **implement** or **continue** to start coding (recommend **L0 first**).
