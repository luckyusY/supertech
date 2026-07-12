# SuperTech Android — Professional UI/UX Overhaul Plan

**Role:** Senior product designer + Android UX engineer  
**Scope:** App canvas (ambient background), shopper homepage, hero, product cards, actions (like / cart / CTAs), vendor + admin dashboards  
**App:** `mobile/android` · package `africa.supertech.marketplace`  
**Web parity:** Website `SiteCanvas` (`src/components/site-canvas.tsx`) + `docs/CANVAS_TYPOGRAPHY_DASHBOARD_PLAN.md`  
**Date:** 2026-07-12  
**Status:** Ready to implement in phases

---

## 0. North star

> SuperTech should feel like a **premium African marketplace you trust in 3 seconds**: intentional **app canvas** atmosphere under content, dark chrome, orange/gold energy, white product surfaces, readable RWF prices, and dashboards that feel like a real ops console — not a stack of gray cards.

### Experience pillars

| Pillar | Shopper meaning | Dashboard meaning |
|--------|-----------------|-------------------|
| **Canvas** | Warm brand glow under home; recedes when browsing products | Near-flat ops canvas — no campaign wash |
| **Clarity** | Image → price → one CTA | KPI → table → one action |
| **Visibility** | High contrast, never gray-on-gray | Status colors that scan at arm’s length |
| **Trust** | Verified sellers, stock labels | Role header, approval queues, audit-friendly rows |
| **Speed** | Hero swipe + Browse ≤ 2 taps | Filter + sticky table header |
| **Delight** | Like heart, smooth pager, lift on press | Empty states that guide next step |

---

## 1. Current-state audit (honest)

### What already works
- Pinned dark header + dock (good chrome foundation)
- Adorama-inspired hero structure (copy, gold CTA, blue category rail)
- 2-column product grid on Shop / Fresh
- Mode-aware PDP (shop vs motors vs property)
- Role-aware native dashboard (admin / vendor / customer)
- Brand tokens exist: orange `#E8770A`, gold `#F5A62A`, ink `#313133`, page `#F1F1F2`, dark `#0A0F1A`

### What’s broken or weak

| Area | Severity | Reality today |
|------|----------|---------------|
| **Hero horizontal scroll** | **Critical** | Nested `HorizontalScrollView` inside vertical `ScrollView` + `SwipeRefreshLayout` without touch-disallow; fling left-page bug (`velocityX < -400 → current` not `current - 1`); feature-chip HScroll steals swipes |
| **Homepage rhythm** | High | Sections exist but spacing/type hierarchy uneven; trust strip generic; quick actions can feel busy |
| **Product cards** | High | Image often `CENTER_INSIDE` with heavy padding until load; no wishlist; ＋ button tiny (28dp); price can wrap; no rating/mode cue |
| **Like / secondary actions** | High | **No like/wishlist** in app; only ＋ cart; WhatsApp buried on PDP |
| **Dashboard UI** | High | Flat card lists; no real **tables**; money stats hard to scan; no sticky columns/headers; long lists scroll entire page |
| **Dashboard tables** | High | Orders/products are stacked cards — fine for 5 rows, painful for 50; no column alignment; status chips OK but dense rows not |
| **Color usage** | Med | Orange overused on every chip; success/danger underused; dashboard has little visual “mode” difference admin vs vendor |
| **Typography scale** | Med | Too many 13–14f sizes; hierarchy flat |
| **App canvas** | High | Flat solid `#F1F1F2` only — no grain, no brand glow, no zone awareness; website already has `SiteCanvas`; app feels flatter / less premium than web |

---

## 1B. App Canvas (ambient background — website parity)

**Design principle (same as web):** Canvas is **atmosphere under content**, not decoration on content. Strength changes by **zone** and (on storefront home) **scroll depth**. White cards and tables always win.

### 1B.1 Why the app needs this

| Without canvas | With app canvas |
|----------------|-----------------|
| Flat gray page behind everything | Warm, intentional SuperTech “air” on Home/auth |
| Web feels richer than native | Same mental model as `SiteCanvas` on supertech.africa |
| Dashboards look identical to shop | Dashboard zone goes near-flat for ops focus |
| Hero sits on dead gray | Soft brand + cool glow frame the hero band |

### 1B.2 Architecture (native)

```
AppCanvas (behind all content, non-interactive)
├── base fill          (--canvas-base)
├── grain layer        (subtle noise bitmap / procedural dots, opacity by zone)
├── brand glow A       (warm orange radial, top-start)
├── cool glow B        (teal/navy radial, bottom-end)
└── vignette           (optional soft edge darken)

Content chrome sits ABOVE canvas:
├── pinned header / topBar
├── scroll content (cards, tables — solid surfaces)
├── sticky bars / dock
└── overlays (Browse sheet, dialogs)
```

**Implementation options (pick one in Phase A):**

| Approach | Pros | Cons |
|----------|------|------|
| **A. Shared `AppCanvasView` FrameLayout under root** | One place; zone API; matches web mental model | Slight extra draw cost |
| **B. GradientDrawable page background per activity** | Simple | No grain; weak parity |
| **C. XML layer-list drawables per zone** | Cheap | Harder scroll-linked fade |

**Recommendation:** **Approach A** — `AppCanvasView` (custom `View` or `FrameLayout`) added as first child of activity roots in `MainActivity` and `BaseActivity.scaffold()`.

### 1B.3 Zone model (match website)

Website zones: `storefront | auth | app | dashboard`  
Map native screens the same way:

| Zone | Android screens | Canvas behavior |
|------|-----------------|-----------------|
| **storefront** | `MainActivity` Home / Shop / Stores / Cart / Browse; `ProductDetailActivity`; `VendorProfileActivity`; `Blog*` | Warm glow stronger near top of Home; grain medium; cool glow subtle; **scroll-linked dim** on Home vertical scroll |
| **auth** | `WelcomeActivity`, `SignInActivity`, `SignUpActivity`, `PasswordRecoveryActivity`, `BecomeVendorActivity` | Soft dual glow (brand + cool), calm grain; no busy motion |
| **app** | `RequestProductActivity`, `TrackOrderActivity`, `CheckoutActivity`, `AiSupportActivity`, utility forms | Minimal grain; low glow — speed and form clarity |
| **dashboard** | `DashboardActivity`, `OrdersActivity`, `PayoutsActivity`, all `Admin*`, vendor manage screens | **Near-flat** — grain ≤ 0.02, glow almost off; ops focus; no orange campaign wash |

### 1B.4 Opacity contract (aligned with web `ZONE_BASE`)

| Zone | Grain α | Brand glow α | Cool glow α | Vignette α |
|------|---------|--------------|-------------|------------|
| storefront (top) | 0.035–0.045 | 0.10–0.14 | 0.04 | 0.025 |
| storefront (scrolled) | ~0.018 | ~0.03 | ~0.02 | 0.01 |
| auth | 0.03 | 0.10 | 0.08 | 0.02 |
| app | 0.018 | 0.04 | 0.02 | 0.01 |
| dashboard | 0.014 | 0.02 | 0.015 | 0.008 |

**Scroll-linked (storefront Home only):**
- Listen to main `ScrollView` `scrollY` (or `OnScrollChangeListener`)
- Map progress 0→1 over first ~1.2× screen height (or full content height)
- Interpolate grain/glow toward “scrolled” levels
- Use **opacity only** (GPU-cheap); no layout thrash
- **Reduced motion:** if `Settings.Global.ANIMATOR_DURATION_SCALE == 0` or similar, use static storefront-top levels only (no scroll fade)

### 1B.5 Color tokens (canvas contract)

Add to `colors.xml` + `BaseActivity` / canvas view:

| Token | Value | Notes |
|-------|-------|-------|
| `canvasBase` | `#F5F4F0` | Warm paper (matches web `--canvas-base`) — **not** cold pure gray |
| `canvasBaseDashboard` | `#F3F3F1` | Slightly flatter for ops |
| `canvasGlowBrand` | `rgba(232, 119, 10, 0.55)` at low layer α | Drawn as radial; effective screen α per table above |
| `canvasGlowCool` | `rgba(28, 84, 104, 0.45)` / teal `#1C5468` | Balances orange |
| `canvasVignette` | `rgba(24, 24, 26, 0.55)` at low α | Edge depth only |
| Page surfaces | `#FFFFFF` cards | Always opaque — never translucent product cards over glow |

**Rule:** Product cards, tables, sticky bars, dock stay **fully opaque**. Canvas never shows through UI chrome.

### 1B.6 Layer drawing (Android sketch)

```kotlin
// Pseudocode — AppCanvasView.onDraw
drawColor(canvasBase)                                    // fill
drawRadial(brand, cx=12%w, cy=8%h, r=70% , alpha=glowBrand)
drawRadial(cool,  cx=95%w, cy=90%h, r=55%, alpha=glowCool)
drawBitmap(grainTile, SRC_OVER, alpha=grain)             // or Compose noise
drawRadial(vignette dark, center, alpha=vignette)        // optional
```

Grain: small tiled PNG (64–128px noise) with low α, or a one-time generated soft-noise bitmap cached in memory. Avoid per-frame generation.

### 1B.7 Integration points

| Location | Change |
|----------|--------|
| `MainActivity` root | Behind `shellRoot`: `AppCanvasView(zone=STOREFRONT)`; update scrollT from home ScrollView |
| `BaseActivity.scaffold` | Under column: canvas with zone from subclass (`canvasZone()` open method) |
| `WelcomeActivity` / auth | Zone AUTH |
| `DashboardActivity` + admin/vendor | Zone DASHBOARD; base `#F3F3F1` |
| Browse overlay / dialogs | Dim layer above canvas+content; do not recolor canvas mid-sheet |
| SwipeRefresh | Progress circle on top; canvas stays put |

```kotlin
// BaseActivity
protected open fun canvasZone(): CanvasZone = CanvasZone.APP

// DashboardActivity
override fun canvasZone() = CanvasZone.DASHBOARD
```

### 1B.8 What NOT to do

- Do **not** put orange gradient on full-screen solid backgrounds that replace white cards  
- Do **not** animate glow every frame with object allocation  
- Do **not** use heavy blur live (static radial only)  
- Do **not** use storefront-strength glow on dashboard tables  
- Do **not** make text/icons sit directly on grain without a surface

### 1B.9 Acceptance criteria (app canvas)

- [ ] Home top feels warm/premium (grain + brand glow visible but tasteful)
- [ ] After scrolling product grids, canvas recedes; cards stay primary
- [ ] Auth screens feel calm dual-glow, not flashy
- [ ] Dashboard is near-flat — no “campaign” orange wash behind tables
- [ ] PDP / forms remain readable; no muddy type on canvas
- [ ] Reduced motion: static zone levels, no scroll-linked fade
- [ ] 60fps scroll on mid device (A31-class) with canvas enabled
- [ ] Visual kinship with website `SiteCanvas` when placed side by side

### 1B.10 Relationship to page token

| Old app `page` | New |
|----------------|-----|
| Solid `#F1F1F2` everywhere | `canvasBase` `#F5F4F0` as true background; section padding stays transparent over canvas; cards stay white |

Update “Page” in design tokens: **page = canvas shows through**; **surface = white card**.

---

## 2. Design system (pro tokens — implement once, use everywhere)

### 2.1 Color roles (not just hex values)

| Role | Hex | Use |
|------|-----|-----|
| **Ink** | `#313133` | Titles, table primary text |
| **Ink secondary** | `#5C5C62` | Subtitles (slightly darker than old muted for readability) |
| **Muted** | `#75757A` | Meta, timestamps |
| **Line** | `#E4E5E9` | Card borders (slightly softer) |
| **Page / canvas base** | `#F5F4F0` | Ambient canvas base (warm paper — web parity); not a cold gray fill on content |
| **Canvas base dashboard** | `#F3F3F1` | Near-flat ops zone |
| **Surface** | `#FFFFFF` | Cards, table body (always opaque over canvas) |
| **Surface raised** | `#FFFFFF` + 4–8dp elevation | Product cards, KPI cards |
| **Brand** | `#E8770A` | Primary CTA only (one per view) |
| **Brand pressed** | `#D06A08` | Pressed CTA |
| **Gold** | `#F5A62A` | Hero accent, dock active, “LIVE” badges |
| **Navy** | `#0A0F1A` | Header, dock, dashboard top bar |
| **Navy soft** | `#141B2D` | Dashboard side accents / table header strip |
| **Info blue** | `#1565C0` | Category rail, links |
| **Success** | `#0E9F6E` | Approved, completed, in-stock |
| **Warning** | `#D97706` | In review, pending |
| **Danger** | `#E02424` | Rejected, cancel, out of stock |
| **Like active** | `#E11D48` | Heart filled |
| **Like idle** | `#FFFFFF` @ 90% on image, or `#75757A` off-image |

**Rule:** Brand orange is for **money actions** (Add, Checkout, Approve). Gold is for **promo/energy**. Green/amber/red are for **status only**. Never paint whole rows orange.

### 2.2 Type scale (mobile)

| Token | Size / weight | Use |
|-------|---------------|-----|
| Display | 26–28 sp Bold | Hero brand words |
| H1 | 20–22 sp Bold | Screen titles, product name on PDP |
| H2 | 17 sp Bold | Section headers |
| H3 | 15 sp Bold | Card titles |
| Body | 14 sp Regular | Descriptions |
| Meta | 12 sp Medium | Vendor, category, timestamps |
| Price L | 16–18 sp Bold Brand | Card / sticky bar price |
| Price S | 13–14 sp Bold Brand | Grid card price |
| Caption | 10–11 sp Bold | Badges, LIVE NOW, column headers |

**Contrast:** Body/meta on white must stay ≥ 4.5:1. Prefer `#5C5C62` over light gray for secondary text.

### 2.3 Spacing & radius

| Token | Value |
|-------|-------|
| Screen pad | 16 dp |
| Card pad | 12–14 dp |
| Section gap | 20–24 dp |
| Grid gutter | 10 dp |
| Radius sm | 8 |
| Radius md | 12 |
| Radius lg | 16 |
| Touch min | **44 × 44 dp** |

### 2.4 Elevation language
- Product card: 2–3 dp rest, 6 dp press  
- Sticky bars: 12–16 dp  
- Dashboard KPI: 2 dp  
- Tables: 0 elevation + strong header fill (flat ops look)

---

## 3. Homepage (shopper)

### 3.1 Information architecture (fixed order)

```
┌─ PINNED: dark header (logo · search · phone · WA)
├─ HERO carousel (full-bleed, swipeable)     ← fix scroll first
├─ Blue category rail
├─ Trust strip (live counts)
├─ Featured (horizontal snap cards)
├─ Fresh on the market (2-col grid)
├─ Top vendors (horizontal)
├─ Quick actions (max 4 tiles)
└─ DOCK: Home · Browse · Request · Stores · Account · Cart
```

### 3.2 Homepage visual goals
1. **Hero owns first 40% of first viewport** — bold, not cluttered.
2. **Products appear within one thumb-scroll** after hero + rail.
3. **No more than one horizontal scroller “band” in a row** without a vertical section break.
4. **Section headers:** kicker (muted 11) + title (17 bold) + See all (brand 13 bold).

### 3.3 Trust strip upgrade
- 3 equal KPI cells on white card with thin dividers:
  - `N products` · `N vendors` · `Assisted checkout`
- Subtle verified line under: “Verified sellers · Trackable orders · RWF pricing”
- Use live counts from marketplace API when available.

### 3.4 Quick actions
Keep **only 4** (not 6):
| Tile | Icon | Destination |
|------|------|-------------|
| Request | box | RequestProduct |
| Track | truck | TrackOrder |
| Sell | store | BecomeVendor |
| AI help | sparkle | AiSupport |

---

## 4. Hero — why scrolling fails + exact fix

### 4.1 Root causes (code-level)

1. **Nested scroll conflict**  
   Hero `PagerScrollView` (horizontal) lives inside vertical `ScrollView` inside `SwipeRefreshLayout`. On Android, the parent steals the gesture unless the child calls `parent.requestDisallowInterceptTouchEvent(true)` when horizontal intent is clear.

2. **Fling direction bug** in `PagerScrollView.fling`:
   ```kotlin
   velocityX < -400 -> current   // WRONG — should be current - 1
   ```
   Left swipes often snap back to the same page.

3. **Competing horizontal child**  
   Feature chips use nested `HorizontalScrollView` inside each slide — they fight the pager. Prefer non-scrolling chip row (wrap / ellipsize) or disable chip scroll until edge.

4. **SwipeRefresh** can also intercept short vertical noise during diagonal swipes — disable refresh while finger is on hero, or use nested scrolling correctly.

### 4.2 Target hero behavior

| Gesture | Result |
|---------|--------|
| Horizontal drag on hero | Page snaps; vertical parent does not scroll |
| Fling left / right | Move exactly one page |
| Vertical drag on hero | Page scrolls; pager does not move |
| Autoplay (optional) | Every 6s advance if user not touching |
| Dots | Bottom-center, gold active pill, accessible |

### 4.3 Implementation checklist (P0)

- [ ] Rewrite touch: track `downX/downY`; if `|dx| > |dy| && |dx| > touchSlop` → `requestDisallowInterceptTouchEvent(true)`
- [ ] Fix fling: `velocityX < -400 → current - 1`
- [ ] Call `requestDisallowInterceptTouchEvent(false)` on UP/CANCEL
- [ ] While hero touching: `swipe.isEnabled = false`; restore on UP
- [ ] Remove or freeze feature-chip HScroll (static 2–3 chips max)
- [ ] Ensure slide width = exact screen width after layout (not only onCreate)
- [ ] Optional: `ViewPager2` + `RecyclerView` if custom pager remains fragile
- [ ] Content description: “Promo 1 of 3”

### 4.4 Hero visual polish
- Height: **280–300 dp** phones; image `CENTER_CROP` + left gradient always present (even if banner fails)
- LIVE NOW pill: gold fill, navy text OR gold outline + gold text
- CTA: gold fill, navy text, **min height 44**, full-width optional on small screens
- Bottom padding under chips so dots never collide with copy

---

## 5. Product cards (shopper)

### 5.1 Grid card anatomy (2-col)

```
┌─────────────────────┐
│  [IMAGE 1:1-ish]    │  ← CENTER_CROP always after load
│  badge TL   ♥ TR    │  ← stock/mode badge + like
│                     │
├─────────────────────┤
│ Title 2 lines       │
│ by Vendor · ★ 4.8   │  meta 12 muted
│ RWF 125,000    [＋] │  price brand bold + cart circle 36dp
└─────────────────────┘
```

### 5.2 Specs

| Element | Spec |
|---------|------|
| Image height | 140–148 dp (taller than current 124) |
| Image load | `CENTER_CROP`; skeleton shimmer until ready |
| Radius | 14–16 dp card; clip image top corners |
| Like | 36 dp hit target, top-end of image; white circle @ 70% black scrim or soft white disk |
| Badge | Max 1 primary badge (stock OR mode OR sale) |
| Title | 13–14 sp Bold, 2 lines, ink |
| Meta | Vendor if known else category; optional rating |
| Price | Brand, never wrap (ellipsize or compact format) |
| Cart ＋ | **36 dp** min (today 28 is too small); motors/property → open PDP / enquire icon |
| Press | Scale 0.98 + light elevation |

### 5.3 List card (horizontal — cart, search legacy)
Keep horizontal layout but match tokens: 88 dp image, like optional, primary CTA 44 dp.

### 5.4 Mode-aware primary action

| Mode | Card button | Meaning |
|------|-------------|---------|
| shop | ＋ / Add | Add to cart |
| motors | ✉ / Enquire | Open PDP enquire |
| property | ✉ / Enquire | Open PDP enquire |

---

## 6. Like actions & commercial actions

### 6.1 Product interpretation
“Like actions” = **wishlist / save** plus clearer **commercial CTAs** (cart, enquire, WhatsApp).

### 6.2 Wishlist (local-first P1, API later)

**P1 (ship fast):**
- `SharedPreferences` set of product slugs (`wishlist_slugs`)
- Heart on **grid card** + **PDP**
- Toggle with scale animation; toast “Saved” / “Removed”
- Optional “Saved” entry from Account dashboard (customer)

**P2 (parity with web if API exists):**
- Sync to user account when logged in
- `/api/wishlist` if backend adds it

### 6.3 Interaction rules

| Action | Feedback |
|--------|----------|
| Like on | Heart fill rose `#E11D48`, bounce 120ms |
| Like off | Outline / muted, no drama |
| Add to cart | Button pulse + cart badge count + optional sticky “View cart” |
| Enquire | Opens PDP or WA with prefilled product name |
| Disabled OOS | Gray button, “Out of stock”, no like block |

### 6.4 PDP action bar (sticky)

```
[ RWF price          ] [ ♥ ] [ Primary CTA full ]
```

- Primary: Add to cart | Request | Enquire (mode-aware)
- Secondary in scroll: Message seller (WA), Visit store
- Like never competes with primary color — heart is rose, CTA is brand

### 6.5 Microcopy
- “Save” not “Like” in accessibility strings if culture prefers save; visual remains heart (universal in retail apps).
- contentDescription: “Save product” / “Remove from saved”

---

## 7. Vendor & Admin dashboards

### 7.1 Problem
Today dashboards are **vertical card stacks**. That fails when:
- Admin has many vendors / products / orders
- Vendor scans prices, statuses, dates
- Numbers (RWF) need **column alignment**

### 7.2 Dashboard shell (shared)

```
┌─ Navy top bar: Logo · Dashboard · role chip
├─ Identity band (gradient brand): Hi name · role · Sign out
├─ KPI row (2×2 or 3-up cards)
├─ Priority action (Approvals / Add product)
├─ DATA TABLE section (sticky header)
├─ Manage links (grouped)
└─ FAB optional (AI) — hide on dense tables if needed
```

**Admin vs Vendor chrome difference (subtle):**
- Admin: navy header + gold “Admin” chip
- Vendor: navy header + brand “Vendor” chip  
Same layout system, different empty states and KPIs.

### 7.3 KPI cards (visibility first)

```
┌──────────────┐ ┌──────────────┐
│ label muted  │ │ label muted  │
│ 128          │ │ RWF 2.4M     │
│ ↑ optional   │ │              │
└──────────────┘ └──────────────┘
```

- White surface, 1px line, 12 radius  
- Value: **20–22 sp Bold ink** (money can use brand only for “Gross sales” highlight — not all KPIs)  
- 2-column grid; long RWF use compact: `RWF 2.4M` when ≥ 1_000_000  

### 7.4 Data tables (the big upgrade)

Mobile tables cannot be desktop Excel. Use a **hybrid pattern**:

#### Pattern A — Sticky header list (recommended for Orders / Products)

```
┌────────────────────────────────────────┐
│ ID        STATUS      TOTAL     ›      │  ← sticky navy-soft header, caption white
├────────────────────────────────────────┤
│ #A12…     ● Confirmed  45,000   ›      │  ← tappable row
│ Customer · Kigali · 2 items            │  ← secondary line
├────────────────────────────────────────┤
│ #A13…     ● Pending    12,000   ›      │
└────────────────────────────────────────┘
```

Rules:
- Header row: `#141B2D` bg, white 10–11 sp, letter-spacing
- Body rows: white / zebra `#FAFAFB` alternating
- Divider: 1px `#E4E5E9`
- Status: pill with semantic colors (never raw snake_case)
- Primary text left; money **right-aligned** monospace-ish (tabular nums if available)
- Min row height **56 dp**
- Horizontal scroll **only if** ≥ 4 columns needed — prefer 2-line rows over tiny columns

#### Pattern B — True mini-table (Vendor performance / Analytics)

HorizontalScrollView wrapping fixed min-width columns:

| Vendor | Products | Gross | Net | Rate |
|--------|----------|-------|-----|------|
| …      | …        | …     | …   | …    |

- Column min widths fixed so numbers align  
- Header sticky vertically within a max-height panel (`maxHeight ~ 360dp` nested scroll)  
- Export later; not required for P1  

#### Pattern C — Card for “rich” entities only
Keep cards for moderation (approve/reject needs multi-button UI). Tables for scan/browse lists.

### 7.5 Status system (shared)

| Status family | Fill | Text |
|---------------|------|------|
| Success (approved, completed) | `#D1FAE5` | `#065F46` |
| Warning (pending, in review) | `#FEF3C7` | `#92400E` |
| Info (confirmed, preparing) | `#DBEAFE` | `#1E3A8A` |
| Danger (rejected, cancelled) | `#FEE2E2` | `#991B1B` |
| Neutral (draft) | `#F3F4F6` | `#374151` |

### 7.6 Admin dashboard content map

| Block | UI | Notes |
|-------|----|-------|
| Overview KPIs | 2×3 or 3×2 stats | Vendors, Products, Gross, Commission, Net, Pending |
| Approvals CTA | Large action card | Deep link Moderation |
| Vendor performance | Pattern B table | Top N + “View analytics” |
| Manage | Grouped link rows | Orders, Products, Analytics, AI, Payouts, Vendors, Categories, Blogs, Recovery |

### 7.7 Vendor dashboard content map

| Block | UI | Notes |
|-------|----|-------|
| Store KPIs | Products · Approved · In review · Rating | |
| List product | Primary action card | |
| Recent products | Pattern A table | Name · Status · Price · tap edit |
| Recent orders | Pattern A table | ID · Status · Customer · Total |
| Manage | Orders, Payouts, AI, Blogs, Storefront, Profile | |

### 7.8 Empty & loading
- Skeleton KPI rectangles (not spinner alone)
- Empty table: illustration text + primary CTA (“Add product” / “No orders yet”)
- Errors: red-tinted card + Retry

### 7.9 Shared components to extract in `BaseActivity` (or new `Ui.kt`)

```
statCard / kpiGrid
statusChip (semantic)
dataTableHeader(columns)
dataTableRow(...)
sectionHeader(title, action?)
emptyState(title, body, cta?)
moneyText(amount)
roleBanner(session)
```

One implementation → AdminProducts, Orders, Payouts, Dashboard all look family-consistent.

---

## 8. Accessibility & visibility (non-negotiable)

1. Touch targets ≥ 44 dp (like, cart, dock, table rows).  
2. Don’t rely on color alone for status — include text label.  
3. Hero autoplay pauses on touch and prefers-reduced-motion if we add settings later.  
4. Content descriptions on icon-only controls.  
5. Text on brand orange buttons: navy/dark, not white on gold-orange if contrast fails — **test gold CTA**: navy text on gold is correct. White on brand orange is OK for solid brand buttons.  
6. Tables: ensure money contrast remains ink/brand on white.  
7. Support large font: maxLines + ellipsize, don’t clip critical price.

---

## 9. Motion

| Interaction | Motion |
|-------------|--------|
| Tab content change | Fade + 8dp rise, 200ms |
| Like toggle | Scale 0.8→1.1→1.0, 160ms |
| Hero page | Smooth snap 250ms |
| Browse sheet | Slide up 240ms |
| Dashboard rows | Stagger max 6 items, then stop (perf) |

---

## 10. Implementation roadmap

### Phase A — Critical path (1–2 sessions) **DO FIRST**
1. **App canvas foundation** — `AppCanvasView` + zones + tokens (`canvasBase`, glows); wire into `MainActivity` + `BaseActivity.scaffold`
2. **Storefront scroll-linked canvas** on Home (dim grain/glow as user scrolls)
3. **Fix hero horizontal scroll** (disallow intercept + fling bug + refresh conflict)
4. Hero visual polish (padding, chips, dots)
5. Product grid card v2 (taller image, CROP, larger ＋, cleaner type)
6. **Like/wishlist** local + heart on card & PDP

### Phase B — Homepage polish + canvas zones
7. Trust strip live stats  
8. Featured snap polish  
9. Quick actions → 4 tiles  
10. Section header consistency  
11. Auth / app / dashboard **zone-specific** canvas levels (Welcome, Sign-in, Dashboard)

### Phase C — Dashboard UI system
12. Shared KPI + status chip + section header refinements in `BaseActivity`  
13. `dataTable` helpers  
14. Vendor dashboard: products + orders as Pattern A tables  
15. Admin dashboard: vendor performance table + KPI contrast  
16. OrdersActivity / AdminProductsActivity migrate to same table rows  
17. Confirm dashboard canvas stays near-flat (no brand wash)

### Phase D — Depth
18. Wishlist screen in Account  
19. Optional API sync for likes  
20. ViewPager2 migration if pager still flaky  
21. Extract `MainActivity` UI modules  
22. Optional canvas parallax (very subtle) if perf allows

---

## 11. File touch map

| File | Changes |
|------|---------|
| **New: `AppCanvasView.kt`** | Ambient canvas View (base + grain + dual glows + vignette); zone + scrollT API |
| **New: `CanvasZone.kt`** (or enum in AppCanvas) | `STOREFRONT \| AUTH \| APP \| DASHBOARD` |
| `MainActivity.kt` | Canvas under shell; scrollT from ScrollView; hero pager; product cards; wishlist |
| `ProductDetailActivity.kt` | Storefront canvas; sticky like + CTA bar polish |
| `BaseActivity.kt` | `canvasZone()`; mount canvas in scaffold; tokens; table helpers; status chips |
| `WelcomeActivity.kt` / `SignInActivity.kt` / `SignUpActivity.kt` | Auth zone canvas |
| `DashboardActivity.kt` | Dashboard zone + shell polish, KPI, tables |
| `OrdersActivity.kt` | Table-style rows + dashboard canvas |
| `AdminProductsActivity.kt` / `AdminAnalyticsActivity.kt` | Align table/KPI |
| `PayoutsActivity.kt` | Align money table |
| `colors.xml` | Canvas tokens + semantic colors |
| `drawable/canvas_grain.xml` or `canvas_grain.png` | Tiled noise asset |
| New: `Wishlist.kt` | Prefs helper |
| New drawable: `ic_heart.xml` / `ic_heart_fill.xml` | Like icons |

---

## 12. Success criteria (how we know it’s “pro”)

| Check | Pass condition |
|-------|----------------|
| **App canvas** | Home top has warm atmosphere; cards stay opaque white; dashboard near-flat |
| **Canvas zones** | Auth ≠ storefront ≠ dashboard when compared side by side |
| **Canvas scroll** | Glow dims as Home scrolls; no jank on SM-A315N class |
| **Web kinship** | Feels like the same brand “air” as website `SiteCanvas` |
| Hero swipe | User can change slides reliably with thumb; vertical page still scrolls |
| First product | Visible within ~1 scroll after open on mid phone |
| Product card | Image fills frame; price readable; ＋/♥ easy to hit |
| Like | Survives app restart (local); visible filled state |
| Admin scan | Pending counts and money readable without squinting |
| Vendor scan | Product status column scannable in 2 seconds |
| Color | Primary orange reserved for CTAs; status uses green/amber/red |
| Consistency | Dashboard lists share one row language |

---

## 13. Out of scope (this plan)

- Full web feature parity for every admin page  
- Capacitor hybrid UI  
- Dark mode shopper theme  
- Live WebGL/blur canvas (native uses static radials + grain only)  
- Real-time websockets  
- Desktop tablet multi-pane (can follow later)

---

## 14. Recommended next step

**Implement Phase A immediately:**

1. **App canvas** (foundation + storefront + auth/dashboard zones)  
2. **Hero scroll fix**  
3. **Product card v2 + like/wishlist**  

Then Phase C dashboards (tables on near-flat canvas).

When you say **“continue”** or **“implement”**, start with Phase A in code and reinstall on the USB phone.
