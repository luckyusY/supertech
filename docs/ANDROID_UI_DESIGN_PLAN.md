# SuperTech Android (Kotlin) — UI redesign plan to match the website

**Scope:** Native Kotlin marketplace app under `mobile/android`  
**Goal:** Bring the app in line with the current SuperTech website (Adorama-style hero, Photo Factory mobile chrome, visual categories, Browse sheet, product cards / PDP density).  
**Status:** Plan only — no implementation in this document.

---

## 1. Project understanding

### 1.1 Location and stack

| Item | Detail |
|------|--------|
| Path | `C:\Users\HP\3D Objects\supertech\mobile\android` |
| Package | `africa.supertech.marketplace` |
| App ID | `africa.supertech.marketplace` |
| Version | 2.4.2 (versionCode 30) |
| UI approach | **Programmatic Kotlin views** (LinearLayout / FrameLayout / ScrollView) — almost no screen XML layouts |
| Shared shell | Capacitor is present, but the **primary UX is native Kotlin**, not a WebView home |
| Networking | `Net.kt` → `https://supertech.africa` with HMAC session cookie parity with the website |
| Min SDK / compile | From project `ext` (AppCompat, no Jetpack Compose in dependencies today) |

### 1.2 App architecture (current)

```
WelcomeActivity (launcher)
    → MainActivity (marketplace shell: 5 bottom tabs)
    → ProductDetailActivity / CheckoutActivity / SignIn / SignUp / …
    → DashboardActivity + Admin* / Vendor* activities
    → WebActivity / AiSupportActivity (secondary)
```

**Core files**

| File | Role |
|------|------|
| `MainActivity.kt` (~1.9k lines) | Home, Shop, Vendors, Cart, Menu; hero; product grid; bottom tabs |
| `BaseActivity.kt` | Shared design tokens, scaffold, buttons, cards, image load, AI FAB |
| `Net.kt` | Session cookie + GET/POST to website API |
| `Cart.kt` | Local cart |
| `ProductDetailActivity.kt` | PDP (basic: single image, price, features, CTAs) |
| `WelcomeActivity.kt` / auth screens | Onboarding + Google / email |
| Admin / Vendor activities | Operator and seller workspaces |
| `res/values/colors.xml` | Brand orange `#F68B1E`, gold, teal, muted |

### 1.3 Data flow

- Home / Shop: `GET /api/mobile/marketplace` → products, vendors, categories  
- Search: `POST /api/ai/search` with local fallback  
- Auth: same cookie model as web (`supertech_session`)  
- Images: remote URLs normalized against `Net.BASE`  

### 1.4 Current mobile UX (baseline)

| Area | Current behavior | Website target (already built on web) |
|------|------------------|----------------------------------------|
| Top chrome | Orange status bar; simple logo + title + account | Dark bar: logo \| pill search \| call \| WhatsApp |
| Bottom nav | 5 white tabs: Home / Shop / Vendors / Cart / Menu | Dark 6-tab dock: Home / **Browse** / Request / Stores / Account / Cart |
| Categories | Chip row / grid of labels | Visual tiles with product photos + Browse sheet |
| Hero | Gradient slides, ~196dp, white CTA | Adorama dark cinematic hero, gold accents, feature chips, lifestyle image |
| Product cards | Decent 2-col grid | Website card hierarchy (image, badge, price, single primary CTA) |
| PDP | Single image, basic sections | Thumbs + swipe + zoom, sticky CTA, vendor block |
| Dashboards | Functional lists | Website denser tables / sidebar chrome (later phase) |

---

## 2. Design source of truth (website)

Use the **live SuperTech website patterns** as the visual and interaction contract:

1. **Mobile header (Photo Factory)**  
   - Promo strip (compact)  
   - Dark primary row: logo · search pill · phone · WhatsApp  
   - No hamburger / no cart in header  

2. **Bottom dock + Browse sheet**  
   - Dark dock, gold active state  
   - **Browse** opens full sheet with tabs (Categories / Vendors / Tools / Deals)  
   - Category rows = product image + label + chevron  

3. **Hero (Adorama)**  
   - Full-bleed dark slide  
   - Brand line + gold accent word  
   - Body + gold primary CTA  
   - Feature chips / 2×2 benefit cards  
   - Dots + arrows (arrows optional on phone)  

4. **Category strip**  
   - Blue gradient horizontal product stills under hero  

5. **Product / catalog density**  
   - Image-first cards, clear price, soft borders, verified signals  

6. **Tokens**

| Token | Value | Use |
|-------|-------|-----|
| Brand / accent | `#E8770A` / `#F68B1E` | Primary CTAs, highlights |
| Gold | `#F5A62A` / `#F9B54C` | Hero accent word, gold CTA, dock active |
| Background strong | `#0A0F1A` / near black | Header, dock, hero |
| Page | `#F1F1F2` | App background |
| Ink | `#313133` | Body text |
| Line | `#DCDDE1` | Borders |
| Blue strip | `#0B3D91` → `#1565C0` | Category rail under hero |

---

## 3. Implementation strategy

### 3.1 Recommended approach: **evolve current Kotlin UI (not full Compose rewrite)**

**Why**

- App already has full marketplace + admin native surfaces.  
- Compose migration would delay visual parity by months.  
- `BaseActivity` + `MainActivity` builders can absorb a design system refresh.  
- Same API layer (`Net`) stays intact.

**Optional later:** introduce Compose only for new screens once the design system is stable.

### 3.2 Engineering principles

1. **Centralize tokens** — one `DesignTokens` / expanded `colors.xml` used by all activities.  
2. **Extract UI building blocks** from `MainActivity` into reusable helpers (`UiHeader`, `UiHero`, `UiProductCard`, `UiBottomDock`, `UiBrowseSheet`).  
3. **Match website structure first**, polish motion second.  
4. **Reuse website assets** (`/banners/hero-*.jpg`, logo) via remote URL or bundled `res/drawable`.  
5. **Do not break admin/vendor flows** while redesigning shopper chrome.  

---

## 4. Phased delivery plan

### Phase 0 — Foundation (1–2 days)

**Goal:** Shared design system that matches the website.

| Task | Detail |
|------|--------|
| Expand `colors.xml` | Add `backgroundStrong`, `gold`, `heroBlueStart/End`, `accentSoft`, `success`, etc. |
| Update `BaseActivity` tokens | Align `brand`, `gold`, `page`, button styles with website |
| Shared typography helpers | Title / subtitle / overline / price sizes matching web |
| Shared components | `darkHeader()`, `pillSearch()`, `goldButton()`, `dockIcon()`, `sectionHeader()` |
| Status / nav bar | Dark status bar on shopper shell; light content on dashboards |

**Exit criteria:** Welcome + Sign-in visually on-token; no functional regression.

---

### Phase 1 — Shopper chrome: header + bottom dock + Browse (3–4 days)

**Goal:** Photo Factory mobile chrome on `MainActivity`.

#### 1A. Top header (replace `appHeader` + free-floating search on Home)

Structure (fixed above content or sticky top of home):

```
[ promo strip: Verified sellers · Request · Track ]
[ logo | pill Search | phone | WhatsApp ]
```

- Search: white pill, 32–36dp height (website `h-8`)  
- Phone / WhatsApp: open `tel:` / `wa.me` (use same support number as web)  
- Remove account from header (Account lives in dock)  
- Status bar color = `backgroundStrong`

#### 1B. Bottom dock (replace 5 white tabs)

6 tabs matching web:

| Tab | Label | Action |
|-----|-------|--------|
| 1 | Home | `Tab.Home` |
| 2 | Browse | Open **Browse bottom sheet** |
| 3 | Request | `RequestProductActivity` |
| 4 | Stores | `Tab.Vendors` (or vendors list) |
| 5 | Account | `openAccount()` / sign-in |
| 6 | Cart | `Tab.Cart` + badge count |

Visual: dark background, gold top border on active Browse, gold text when selected.

#### 1C. Browse sheet (new)

Bottom sheet / dialog full-screen-ish (like web `sheet-panel`):

- Tabs: **Categories | Vendors | Tools | Deals**  
- Categories: rows with product `heroImage`, name, chevron → filter Shop or open category  
- Vendors: list from marketplace payload  
- Tools: Request, Track, Sell, Official stores  
- Deals: flash / beauty / gadgets deep links  
- Shortcut pills under Categories tab  
- Body scroll lock while open  

**Data:** reuse in-memory marketplace JSON already loaded in `MainActivity`; no new API required for v1.

**Exit criteria:** User can browse all categories from dock without a hamburger menu; header matches website screenshot density.

---

### Phase 2 — Home hero + category rail (2–3 days)

**Goal:** Adorama-style home top section.

#### 2A. Hero carousel rewrite (`heroCarousel` / `heroSlide`)

Per slide:

- Full width, taller height (~280–320dp)  
- Dark overlay + right-weighted product/lifestyle image (load remote banner when available)  
- Title: brand line + **gold accent word**  
- Subtitle + gold primary CTA  
- Horizontal feature chips (4 max) under title on mobile  
- Page dots (white / gold active)  
- Optional auto-advance (5–7s)  

Slide content map (align with website):

1. VIP / Rewards — flash sale  
2. Glow / Essentials — beauty  
3. Smart / Gadgets — mobile  
4. Request / Track — tools  

Fallback: keep gradient if image fails.

#### 2B. Blue category product rail

Immediately under hero:

- Horizontal scroll of category product stills on blue gradient  
- Tap → Shop filtered by category  
- Replace current plain `categoryLauncher` on Home (or keep a denser grid below for “See all”)  

#### 2C. Home section order (match website scan path)

1. Dark header  
2. Hero carousel  
3. Blue category rail  
4. Trust strip (compact)  
5. Flash / featured products  
6. Category shelves (optional)  
7. Vendors  
8. Quick actions (Request / Track / Sell)  

**Exit criteria:** Home top third looks recognizably like the website mobile home.

---

### Phase 3 — Shop + product cards + PDP (3–4 days)

#### 3A. Shop tab

- Sticky category chip rail with images optional  
- 2-column product grid with refined cards  
- Empty / error states with Request CTA  

#### 3B. Product card component

Unify `gridProductCard` / `productCard` / `featuredCard`:

- Square image, soft border  
- Single badge (discount / stock)  
- Vendor + rating line  
- Price large; compare-at if present  
- One primary CTA (Add / Request / Enquire by mode if product rules exist)  
- Optional WhatsApp icon secondary  

#### 3C. Product detail

- Image gallery: thumbs + main image swipe (website `ProductGallery`)  
- Sticky bottom bar: price + primary CTA (above dock)  
- Vendor card + verified  
- About / features sections  

**API:** if full gallery not in marketplace payload, extend `/api/mobile/marketplace` or product detail endpoint to include `gallery[]`.

---

### Phase 4 — Auth, cart, request, track (2 days)

| Screen | Changes |
|--------|---------|
| Welcome | Logo, gold/primary CTAs, benefit cards like web trust |
| Sign-in / Sign-up | Dark promo band or brand mark; form density |
| Cart | Card list, sticky checkout bar |
| Request product | Form styling + category picker |
| Track order | Status timeline styled like web |

---

### Phase 5 — Dashboards (admin / vendor) (3–5 days, lower priority)

- Sidebar-style top app bar with logo  
- Dense list / “table” rows with internal scroll  
- Badge counts for approvals / orders  
- Align colors with website admin console  

Do **after** shopper UX is solid.

---

### Phase 6 — Polish & release (1–2 days)

- Motion: tab cross-fade already exists; add hero autoplay, sheet enter animation  
- Image caching (optional DiskLru / Coil if dependency allowed)  
- Accessibility: content descriptions on dock icons  
- Offline empty states  
- Bump versionName / versionCode  
- Play Store screenshots update  

---

## 5. Suggested code structure (refactor map)

```
marketplace/
  ui/
    DesignTokens.kt          // colors, radii, type scale
    Components.kt            // buttons, cards, chips, section headers
    HeaderBar.kt             // dark logo|search|phone|WA
    BottomDock.kt            // 6-tab dock
    BrowseSheet.kt           // categories sheet
    HeroCarousel.kt          // Adorama hero
    CategoryRail.kt          // blue product strip
    ProductCardViews.kt      // grid + featured cards
  MainActivity.kt            // thinner: orchestration only
  BaseActivity.kt            // uses DesignTokens
  Net.kt                     // unchanged API surface
  ...
```

**Rule:** no business logic in view helpers; only layout + styling.

---

## 6. Website ↔ app screen mapping

| Website route | Android surface |
|---------------|-----------------|
| `/` mobile home | `MainActivity` Tab.Home |
| Browse sheet | New `BrowseSheet` from dock |
| `/catalog` | Tab.Shop |
| `/products/[slug]` | `ProductDetailActivity` |
| `/vendors` | Tab.Vendors |
| `/cart` | Tab.Cart |
| `/request-product` | `RequestProductActivity` |
| `/track-order` | `TrackOrderActivity` |
| `/account` | Menu / profile + `DashboardActivity` |
| `/dashboard/admin/*` | `Admin*` activities |
| `/dashboard/vendor/*` | Vendor activities |

---

## 7. API / asset needs

| Need | Action |
|------|--------|
| Hero banners | Bundle `hero-*.jpg` in `res/drawable` **or** load from `https://supertech.africa/banners/...` |
| Category images | First product `heroImage` per category (already in marketplace payload) |
| Support phone / WA | Constants matching website (`+250783998231`) |
| Product gallery | Optional API extension for multi-image PDP |
| Product mode rules | Port simplified buy-box rules (shop vs motors/property) for CTAs |

---

## 8. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| `MainActivity` size / merge conflicts | Extract UI modules before large visual changes |
| Image load jank | Keep thread pool; down-sample bitmaps; limit concurrent loads |
| Dock height vs FAB / sticky PDP bar | Standardize bottom insets (`dockHeight + safe`) |
| Capacitor vs native dual UX | Keep WebActivity only for rare pages; do not regress native home |
| Scope creep (Compose rewrite) | Stay on View system for this redesign |

---

## 9. Success criteria

1. Side-by-side with website mobile home: header, hero, category rail, and dock feel like the same product.  
2. Browse sheet opens categories with images in ≤1s after marketplace load.  
3. Product list and PDP remain fully usable offline-cache of last load (best effort).  
4. No regression in sign-in, cart checkout, admin/vendor entry points.  
5. Version shipped with updated Play screenshots for home + browse + PDP.

---

## 10. Recommended execution order (summary)

| Order | Phase | Focus | Est. |
|------:|-------|-------|------|
| 1 | Phase 0 | Tokens + shared components | 1–2d |
| 2 | Phase 1 | Header + dock + Browse sheet | 3–4d |
| 3 | Phase 2 | Hero + blue category rail + home order | 2–3d |
| 4 | Phase 3 | Cards + Shop + PDP gallery | 3–4d |
| 5 | Phase 4 | Auth / cart / request / track polish | 2d |
| 6 | Phase 5 | Dashboards (optional next) | 3–5d |
| 7 | Phase 6 | QA + store assets | 1–2d |

**Total for shopper parity (Phases 0–4 + 6):** roughly **2–3 weeks** of focused Android work.

---

## 11. Next step after approval

Implement **Phase 0 + Phase 1** first (visible chrome win), then Phase 2 (hero) so the home screen matches the website top-to-bottom without waiting on PDP/gallery API work.

When you say **go ahead**, start with Phase 0–1 in `mobile/android`.
