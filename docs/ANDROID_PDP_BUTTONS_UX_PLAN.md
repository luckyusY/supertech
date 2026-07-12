# SuperTech Android — PDP UX · Touch · Button Design System Plan

**Role:** Senior mobile UX / product designer + Kotlin engineer  
**Scope:** Single product page (PDP), touch targets, admin & vendor **action buttons**  
**App:** `mobile/android` · `ProductDetailActivity` + `BaseActivity` button system  
**Web reference:** `product-buy-box.tsx`, product gallery, product-rules  
**Date:** 2026-07-12  
**Status:** Ready to implement  

---

## 0. North star

> Opening a product should feel like **retail confidence in one thumb**:  
> big photo, clear price, rating, one obvious primary action, never hunting for buttons.  
> Admin and vendor screens should feel like a **control panel**: every action is a solid, labeled, 48dp+ control — never a pale ghost you miss.

---

## 1. Audit — product page today

| Area | Current state | Gap |
|------|---------------|-----|
| **Gallery** | 280dp, often `CENTER_INSIDE` until load; thumbs 64dp | Should be **CROP**, swipe/pager, larger thumbs (72+), pinch optional later |
| **Hierarchy** | Category → title → price → mode chip → how-it-works | Missing **★ rating**, compare-at, trust row (ship / verified) |
| **Sticky bar** | Name + price + ♥ + primary | Primary may be narrow; no cart icon; WA not sticky; no safe-area inset |
| **In-scroll CTAs** | Secondary “Add to cart” + “Message seller” stacked | Duplicate sticky intent; weak visual weight; not icon+label |
| **Vendor block** | Text + secondary Visit | No avatar/logo; Visit not full-width enough |
| **Touch** | Some 44–48dp; thumbs OK | Sticky CTA should be **52–56dp**; gallery swipe needs disallow intercept |
| **Top bar** | Truncated name only | Back + share + ♥ optional in chrome |
| **Loading** | Intent data only (good) | Skeleton if future network enrich |
| **AI FAB** | May fight sticky bar | Hide on PDP or raise above sticky + inset |

### Website PDP intelligence (to mirror)

From `product-buy-box.tsx` / product rules:

1. **Mode badge** (Shop / Motors / Property)  
2. **Large title + Price** (compare-at, “asking” for big ticket)  
3. **Stock + badge + rating** chips  
4. **How buying works** calm panel  
5. **Primary CTA full width** (Request order / Enquire / etc.)  
6. **Add to cart** + **WhatsApp** as strong secondaries  
7. Trust: verified seller, ship window, MoMo if relevant  

---

## 2. PDP information architecture (final)

```
┌─ Navy topBar: ← Back | SuperTech | [Share] [♥] ─────────┐
│                                                           │
│  ┌─ Gallery (full bleed width, 320–360dp) ─────────────┐  │
│  │  Image swipe  ·  1/N counter  ·  wishlist on image   │  │
│  └─ Thumbs strip (72dp, selected ring brand) ──────────┘  │
│                                                           │
│  Category · Mode chip                                     │
│  Title (H1 22–26sp)                                       │
│  ★ 4.8 (124) · Stock chip · Badge                         │
│  RWF price  [compare strike]  [asking]                    │
│                                                           │
│  ┌ How buying works ─────────────────────────────────┐    │
│  │ one short paragraph                               │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  Trust row: 🛡 Verified · 🚚 shipWindow · 💳 Assisted      │
│                                                           │
│  ┌ Sold by ──────────────────────────────────────────┐    │
│  │ [logo] Name · Visit store (full secondary)        │    │
│  └───────────────────────────────────────────────────┘    │
│                                                           │
│  About · Features (cards)                                 │
│  Related / more from vendor (optional P2)                 │
│  bottom padding ≥ sticky height + 16                      │
│                                                           │
├─ STICKY BUY BAR (always, safe area) ─────────────────────┤
│  [♥ 48] [WA 48]  [  PRIMARY full remaining 52–56dp   ]   │
│  or: price stack | ♥ | PRIMARY (if space tight)           │
└───────────────────────────────────────────────────────────┘
```

**Rule:** At most **one** full-width orange primary on screen at a time (sticky). In-scroll CTAs are secondary or removed if redundant.

---

## 3. PDP visual & type scale

| Element | Spec |
|---------|------|
| Gallery height | **320dp** phones; full width; radius 0 or 12 under header |
| Main image | Always `CENTER_CROP` after load; accent placeholder |
| Thumb | **72×72**, radius 10, selected = 2dp brand ring |
| Category | 11sp muted bold overline tracking |
| Title | 22–24sp bold ink, 2–3 lines |
| Price | 24–26sp bold brand (or ink + brand accent) |
| Compare | 14sp muted strike |
| Rating | Gold star 14 + 14sp bold |
| Body | 14–15sp muted/ink, line height 1.25 |
| Cards | White, 16 radius, 1px line, 14–16 pad |
| Sticky | White, top 1px line, elevation 16, pad 12–14 + nav inset |

### Color roles on PDP
- **Primary action** = brand orange `#E8770A`, white text, icon white  
- **WhatsApp** = `#1FAE5B` or `#128C7E`, white icon  
- **Like** = white circle / line border; filled rose when saved  
- **Destructive never on PDP**  

---

## 4. Touch-friendly rules (PDP + entire app)

| Rule | Value |
|------|--------|
| Min hit target | **48×48 dp** (prefer **52** for primary commerce) |
| Min gap between targets | **8 dp** |
| Primary full-width height | **52–56 dp** |
| Secondary full-width | **48–52 dp** |
| Icon-only | 48 min with 12 pad icon |
| Thumb gallery | 72 thumb, no tiny 40dp only |
| Scroll vs swipe | Gallery claims horizontal; parent vertical doesn’t steal |
| Sticky clear of gesture bar | `WindowInsets` bottom padding on sticky |
| Press feedback | Scale 0.97 + slight darken (existing pressable) |
| Disabled | α 0.45, no press, still 48dp height |

**Thumb zones (mobile retail):**  
- Primary CTA sits in **bottom third** (sticky) — natural right-thumb reach.  
- Like + WA flanking sticky so one hand can save / chat without scrolling.

---

## 5. PDP sticky CTA matrix (mode intelligence)

| Mode / state | Primary label | Primary action | Secondary sticky | In-scroll |
|--------------|---------------|----------------|------------------|-----------|
| Shop in stock | **Request order** or **Add & checkout** | request / cart+checkout | ♥, WA | Optional “Add to cart only” outline |
| Shop OOS | **Request this product** | request | ♥, WA | — |
| Motors | **Enquire about vehicle** | request prefill | ♥, WA | — |
| Property | **Enquire about listing** | request prefill | ♥, WA | — |

**Clarify product rule (align with web `buildBuyBoxPlan`):**  
Sticky primary should match website primary label, not invent a third path.  
If web primary is “Request order” and secondary is “Add to cart”, sticky = Request; secondary outline Add sits above sticky or as icon+text secondary full width **above** sticky inside scroll once.

**Recommended sticky layout (wide enough phones):**

```
[ RWF 125,000     ]   optional compact price if title drops
[ ♥ ][ WA ][ ========== Request order ========== ]
```

Or simpler (clearer):

```
[ ♥ 48 ][ WA 48 green ][ ===== Primary orange flex ===== ]
```

Price remains large in scroll body; sticky focuses on **action**.

---

## 6. PDP section specs

### 6.1 Gallery
- Horizontal pager (reuse MainActivity `PagerScrollView` pattern or ViewPager2)  
- Counter pill bottom-end  
- Optional on-image ♥ (duplicate sticky is OK if white circle like cards)  
- Thumbs update selected border; scroll thumbs into view  

### 6.2 Title block
- Category overline + mode chip  
- H1 name  
- Rating row: ★ + “4.8 (124 reviews)” or “New · Be the first”  
- Price + compareAt + stock chip  

### 6.3 How buying works
- Soft surface (`#F7F7F8` or softGreen tint), 12 radius  
- Title 11 uppercase muted  
- Body 14 ink  

### 6.4 Trust strip
Three compact cells or icon chips:
- Verified seller  
- Ship window (from intent / stock meta)  
- Assisted checkout / Enquire first  

### 6.5 Vendor card
```
[48 logo]  Name
           Verified SuperTech seller
[ Visit store — full width secondary 48dp ]
[ Message on WhatsApp — outline or green soft ]
```

### 6.6 About / Features
- Keep cards  
- Features as check rows (ic_shield or simple check) not only “•”  

### 6.7 Share
- Top bar share → system share sheet with product name + link `https://supertech.africa/products/{slug}`  

---

## 7. Button design system (admin + vendor + global)

### 7.1 Problem today
- `primaryButton` / `secondaryButton` look **flat and similar**  
- Ops actions (Approve / Reject / Enable / Delete) use **secondary** for critical paths → low visibility  
- Many buttons lack min height, icons, or semantic color  
- Side-by-side secondaries look like gray mush  

### 7.2 Button hierarchy (5 variants)

| Variant | Use | Fill | Text | Border | Height | Icon |
|---------|-----|------|------|--------|--------|------|
| **Primary** | Main positive action (Save, Submit, Checkout, Approve) | Brand `#E8770A` | White bold 15 | none | **52** | optional left |
| **Primary success** | Approve, Complete, Enable | Success `#0E9F6E` | White bold | none | **52** | check |
| **Secondary** | Neutral alternate (Edit, Visit, Write blog) | White | Brand bold | 1.5dp line | **48** | optional |
| **Soft** | Tertiary (Cancel dialog-ish) | `#FFF4E5` | Brand | none | **48** | — |
| **Danger** | Reject, Delete, Disable, Cancel order | White or soft red `#FEE2E2` | Danger `#E02424` bold | 1.5dp danger | **48** | — |
| **Danger solid** | Confirm delete (dialogs) | Danger | White | none | **48** | — |
| **Icon** | Like, share, overflow | Surface | ink/muted | line | **48** | required |

### 7.3 Visual design details

```
Primary:
  radius 14dp
  elevation 2–3dp
  padding H 16 / V 14
  letterSpacing slight
  press: scale 0.97 + brandDark

Secondary:
  radius 14dp
  elevation 0
  border line #E4E5E9 (or brand 30% for emphasis)
  press: softGreen fill flash

Danger outline:
  border danger 40%
  text danger
  never same weight as Approve green/orange
```

### 7.4 Ops pair pattern (moderation / orders)

**Never** two equal secondary buttons for Approve + Reject.

```
┌─────────────────────┬─────────────────────┐
│  ✓ Approve (green)  │  Reject (danger)    │  both 52dp height
│  weight 1           │  weight 1           │  gap 10dp
└─────────────────────┴─────────────────────┘
```

Orders next-step:

```
│  → Confirm / Prepare / … (primary orange or success) │  Cancel (danger outline) │
```

### 7.5 Full-width vs dual

| Context | Layout |
|---------|--------|
| Form submit | One primary full width 52 |
| Two equals importance | 50/50 split gap 10 |
| Three actions | Primary full + row of two secondaries |
| List row actions under thumb row | Full width stacked if narrow; or 50/50 |

### 7.6 Button API in `BaseActivity` (implement)

```kotlin
enum class BtnStyle { PRIMARY, SUCCESS, SECONDARY, SOFT, DANGER, DANGER_SOLID }

fun actionButton(
  label: String,
  style: BtnStyle,
  iconRes: Int? = null,
  heightDp: Int = 52,
  onClick: () -> Unit
): View
```

Deprecate ad-hoc `setTextColor(danger)` on secondary as the only signal — use **DANGER** style.

Migrate:
- Moderation Approve → SUCCESS + icon  
- Reject → DANGER  
- Delete → DANGER  
- Enable → SUCCESS or PRIMARY  
- Disable → DANGER outline  
- Write blog / Rename → SECONDARY  
- Place order / List product → PRIMARY 52  

### 7.7 Loading on buttons
- Disable + label “Working…” or small progress  
- Keep height (no layout jump)  
- α 0.7 while loading  

### 7.8 Admin / vendor screens checklist

| Screen | Button upgrades |
|--------|-----------------|
| Dashboard links | Keep rows; primary CTAs (Add product, Approvals) use **action cards with solid primary** |
| Moderation | Green Approve / Danger Reject 52dp |
| Orders | Next status = PRIMARY; Cancel = DANGER |
| Products | Write blog SECONDARY; Delete DANGER; Enable SUCCESS |
| Vendors | Enable SUCCESS; Disable/Delete DANGER |
| Categories | Add category PRIMARY full; Rename SECONDARY; Hide SOFT |
| Vendor product form | Submit PRIMARY 52 sticky optional |
| Payouts | Any pay/action PRIMARY |
| AI Studio | Generate PRIMARY 52 |

---

## 8. Touch-friendly ops lists + buttons together

List row (already planned) + action footer:

```
#12 [img] Title     [status]
         meta · money
┌──────────────────┬──────────────────┐
│  Primary 52dp    │  Danger 52dp     │
└──────────────────┴──────────────────┘
```

Min vertical space between rows: 10dp.  
Actions never smaller than 48dp even if labels long → allow 2-line label or shorten (“Approve” not “Approve application”).

---

## 9. Accessibility

- contentDescription on icon-only (♥, WA, Share, Back)  
- Contrast: white on brand ≥ 4.5:1; danger text on white OK  
- Don’t rely on color alone: Approve includes “Approve” text + optional check icon  
- Large font: sticky remains usable (price can hide, actions stay)  

---

## 10. Motion (PDP)

| Event | Motion |
|-------|--------|
| Open PDP | Slide from right (existing) |
| Gallery page | Snap horizontal |
| Thumb select | Crossfade main 150ms |
| Add to cart | Sticky primary pulse; cart badge if return to Main |
| Like | Heart scale bounce |
| Sticky appear | Slide up 200ms on first layout |

---

## 11. Implementation roadmap

### Phase P1 — Button system foundation (½ day)
1. `BtnStyle` + `actionButton()` in `BaseActivity`  
2. Refactor `primaryButton` / `secondaryButton` to wrap new API  
3. Apply to Moderation, Orders, AdminProducts, AdminVendors  

### Phase P2 — PDP redesign (1–1.5 days)
4. Gallery CROP + height + swipe + larger thumbs + selected ring  
5. Title block: rating, compareAt, mode chips  
6. How-it-works + trust row  
7. Vendor card with logo + full-width buttons  
8. Sticky: ♥ + WA + full primary 52–56; nav inset  
9. Top bar share; hide or raise AI FAB  
10. Pass rating/compareAt/shipWindow via intent from MainActivity  

### Phase P3 — Polish
11. Related products strip  
12. Sticky dual primary rules exact web parity  
13. Haptic on Approve/Add (optional)  
14. PDP skeleton if remote enrich added  

---

## 12. File touch map

| File | Change |
|------|--------|
| `BaseActivity.kt` | `actionButton`, styles, heights, icons |
| `ProductDetailActivity.kt` | Full PDP layout rewrite |
| `MainActivity.kt` | Intent extras: rating, reviewCount, compareAt, shipWindow |
| `AdminModerationActivity.kt` | SUCCESS/DANGER pairs |
| `OrdersActivity.kt` | PRIMARY/DANGER action row |
| `AdminProductsActivity.kt` / `AdminVendorsActivity.kt` | Semantic buttons |
| `DashboardActivity.kt` | Stronger CTA buttons on action cards |
| Drawables | Optional `ic_check`, reuse cart/WA/heart/star |

---

## 13. Success criteria

| Check | Pass |
|-------|------|
| PDP 3-second scan | User names price + primary action without scrolling |
| Sticky | Primary ≥ 52dp, always visible, above gesture bar |
| Gallery | Photo fills frame; swipe works; thumbs 72dp |
| Rating | ★ or “New” visible when data available |
| Touch | No control under 48dp on PDP or ops actions |
| Approve/Reject | Instantly distinguishable (green vs danger), not two gray twins |
| Admin scan | Any list action readable at arm’s length |
| Parity | PDP sticky labels match website buy-box intent |

---

## 14. Also in scope (user follow-ups)

| Area | Target |
|------|--------|
| **Checkout** | Image line items, trust strip, sticky place-order with logo + total, safe area |
| **Search suggestions** | Dropdown like website: Popular / Products / Stores / Categories; open on focus |
| **Logo visibility** | Larger white-tile logo on header, topBar, Welcome, Checkout, Dashboard brand band |

## 15. Recommended next step

Implement **P1 buttons + checkout + search suggest + logo** first, then full PDP gallery pass.

Say **implement** / **continue** to build it.
