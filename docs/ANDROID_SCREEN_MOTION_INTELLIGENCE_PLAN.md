# SuperTech Android — Screen Design · Motion · Loading · Intelligence Plan

**Role:** Senior Kotlin app designer / Android product engineer  
**Audience:** product + native Android  
**App:** `mobile/android` · `africa.supertech.marketplace`  
**Companion:** `ANDROID_APP_UI_UX_PRO_PLAN.md` (visual tokens, canvas, cards)  
**Date:** 2026-07-12  
**Status:** Design contract — implement after Phase A polish  

---

## 0. North star (how the app should *feel*)

> Every screen should answer one question instantly:  
> **“What can I do here, and what’s next?”**  
> Loading never looks like a dead end. Motion never feels random.  
> Each page carries **role intelligence** — shopper vs vendor vs admin get different density, CTAs, and empty states.

### Design principles (non‑negotiable)

| # | Principle | Meaning in SuperTech |
|---|-----------|----------------------|
| 1 | **One job per screen** | Home discovers; PDP converts; Dashboard directs; Orders fulfill |
| 2 | **Chrome vs content** | Header/dock/sticky bars are chrome (stable); content animates |
| 3 | **Skeleton > spinner** | Layout shape appears in ≤100ms; real data replaces it |
| 4 | **Motion has meaning** | Forward = enter from right/bottom; back = reverse; success = settle |
| 5 | **Intelligence is quiet** | Prefill, remember, prioritize — never surprise or trap |
| 6 | **Fail forward** | Error always offers Retry + alternate path (Request / Support) |
| 7 | **Role-aware density** | Shopper = retail calm; vendor = store ops; admin = command center |

---

## 1. Current state (honest audit)

| Area | Today | Gap |
|------|-------|-----|
| **Screen entry** | Default activity open (system) | No shared enter/exit choreography |
| **In-screen** | Tab fade+rise (~220ms); `animateIn` stagger on lists | Inconsistent; many screens only show “Loading…” text |
| **Loading** | Text spinner language; Home has some skeletons | Most admin/vendor screens: blank text only |
| **Transitions** | Instant activity jumps | No shared element (image → PDP); no slide stack language |
| **Intelligence** | Cart in memory; wishlist local; session cookie | No last-tab memory, no smart empty CTAs, weak prefetch |
| **Back behavior** | System back; Browse sheet handled | Inconsistent “unsaved form” guards |
| **Success moments** | Toast only | No confirmation choreography after checkout / submit |

---

## 2. Information architecture (screen map)

```
LAUNCH
  └─ Welcome (auth gate / visitor)
        ├─ Sign in ──┐
        ├─ Sign up ──┼─► Dashboard (role-aware hub)
        └─ Visitor ──┘
                      │
                      ▼
              MainActivity SHELL (singleTask)
              ┌─────────────────────────────────────┐
              │ Header (pinned)                     │
              │ Content: Home | Shop | Stores | Cart│
              │ Browse overlay (tool, not a place)  │
              │ Dock: Home Browse Request Stores    │
              │       Account Cart                  │
              └─────────────────────────────────────┘
                      │
        ┌─────────────┼──────────────┬──────────────┐
        ▼             ▼              ▼              ▼
   ProductDetail   Request/Track   Checkout      AI Support
        │             │              │
        └─────────────┴──────────────┴──► success → Home/Track/Orders

DASHBOARD BRANCH (role)
  Admin  → Moderation, Products, Vendors, Orders, Analytics, Payouts, …
  Vendor → Products, Orders, Payouts, Storefront, Blogs, AI Studio
  Customer → Track, Request, Browse marketplace
```

**Mental model:**  
- **Shell screens** live inside `MainActivity` (tabs) — they *crossfade*, they don’t stack.  
- **Flow screens** (PDP, Request, Checkout, Auth) *stack* with directional motion.  
- **Ops screens** (Dashboard children) *push* with a slightly flatter, faster transition (work mode).

---

## 3. Motion language (Kotlin system)

### 3.1 Global timing tokens

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `motion.instant` | 0–80ms | — | Press scale, icon toggle |
| `motion.fast` | 160–200ms | Decelerate | Tab content, chip select |
| `motion.base` | 240–280ms | Decelerate / emphasized | Activity enter, sheet open |
| `motion.slow` | 320–400ms | Emphasized | Hero autoplay, success settle |
| `motion.stagger` | 40–50ms × max 6 | — | List item cascade (cap for perf) |

**Reduced motion:** If animator scale = 0 → skip stagger, use crossfade only (≤120ms).

### 3.2 Transition types (when to use what)

| Type | Pattern | Screens |
|------|---------|---------|
| **A. Shell crossfade** | Content α 0→1 + 8dp rise; chrome fixed | Home ↔ Shop ↔ Stores ↔ Cart |
| **B. Push stack** | Enter from right 12–20%; exit slight left fade | Main → PDP, Request, Track, Auth |
| **C. Modal sheet** | Slide up + dim; dock stays | Browse |
| **D. Ops push** | Faster push (200ms), less parallax | Dashboard → Orders / Products / … |
| **E. Shared element (P1)** | Product image bounds morph | Grid card → PDP gallery |
| **F. Success settle** | Scale spring on checkmark + hold 600ms | Checkout done, product submitted |
| **G. Destructive exit** | Slide right + fade (already on moderation reject) | Approve/reject cards |

### 3.3 Implementation approach (senior, pragmatic)

**Phase 1 (no Fragment rewrite):**  
- `Activity` theme: `windowAnimationStyle` → shared `Anim` XML (`slide_in_right`, `slide_out_left`, `fade`).  
- Override `overridePendingTransition` in `BaseActivity.startSmart()` helper.  
- In-shell: keep current `render()` fade (tune to 200ms).  
- Sheets: Browse already overlay — polish with `translationY` + dim α.

**Phase 2 (optional):**  
- `ActivityOptionsCompat.makeSceneTransitionAnimation` for product image.  
- Or migrate shell to single-activity + Navigation Component later (big bang — not required for quality).

### 3.4 Press & micro-interaction catalog

| Control | Motion |
|---------|--------|
| Card / row | Scale 0.97 on press (existing `pressable`) |
| Dock tab | Icon scale 1.0→1.08 + gold underline grow width |
| Like heart | 0.8 → 1.12 → 1.0 + color fill (done) |
| Add to cart | Button pulse; cart badge scale bounce once |
| Primary CTA disable | α 0.5, no press motion |
| Pull refresh | Brand orange spinner only (no full-page wipe) |

---

## 4. Loading system (how pages “arrive”)

### 4.1 Three loading modes

```
┌──────────────────────────────────────────────────────────┐
│ MODE SKELETON  — first paint of list/detail screens      │
│  Shimmer blocks matching final layout (cards, KPIs, rows)│
│  Never empty white + "Loading…" alone as primary UI      │
├──────────────────────────────────────────────────────────┤
│ MODE PROGRESSIVE — Home / Marketplace                    │
│  1) Chrome immediate  2) Hero local  3) Categories       │
│  4) Products when API returns  5) Images fade-in         │
├──────────────────────────────────────────────────────────┤
│ MODE INLINE — forms / buttons                            │
│  Button shows spinner + label “Submitting…”              │
│  Form fields stay visible (never blank whole screen)     │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Shared components to build

| Component | Role |
|-----------|------|
| `SkeletonBlock(w,h,radius)` | Rounded gray pulse |
| `SkeletonProductCard` | Grid card placeholder |
| `SkeletonKpiRow` | 2×2 dashboard stats |
| `SkeletonTableRows(n)` | Ops lists |
| `LoadingOverlay` | Rare full-block (auth only) |
| `EmptyState(icon, title, body, cta)` | Structured empty |
| `ErrorState(message, retry, alt)` | Retry + Request/AI |

### 4.3 Loading intelligence rules

1. **Cache last marketplace payload** (memory + optional disk) → Home paints instantly on return visits, then soft-refresh.  
2. **Minimum skeleton time** 200ms only if response faster — avoid flash (optional).  
3. **Timeout UX** at 12s: “Still loading… Check connection” + Retry.  
4. **Partial failure:** products OK / vendors fail → show products + vendors error strip (don’t nuke whole Home).  
5. **Image load:** fade 200ms; keep color placeholder until bitmap (already partial).  
6. **Stale-while-revalidate:** show cached shop while swipe-refresh runs.

### 4.4 Per-screen loading recipe

| Screen | First paint | Loading | Success | Error |
|--------|-------------|---------|---------|-------|
| Home | Header+dock+hero frame | Skeleton grid under hero | Stagger cards max 6 | Banner + Retry |
| Shop | Chips + title | Skeleton grid | Grid fade | Empty + Request CTA |
| Stores | Title | Skeleton vendor cards | List | Empty |
| Cart | Instant (local) | None | Lines | Empty → Shop CTA |
| PDP | Sticky shell + image box | Skeleton meta | Content rise | Offline card |
| Dashboard | Role header | KPI skeletons | Tables populate | Retry |
| Orders | Title | Table skeletons | Rows | Empty |
| Checkout | Form visible | Button spinner only | Success screen | Inline field errors |
| Auth | Form visible | Button spinner | Navigate | Inline error |
| AI chat | Thread | Typing dots | Bubble animate | Retry last message |

---

## 5. Intelligence layer (smart behavior by role)

### 5.1 Cross-app intelligence

| Intelligence | Behavior |
|--------------|----------|
| **Session-aware chrome** | Account dock → Dashboard if logged in, else Sign in |
| **Last shell tab** | Remember Home/Shop/Stores/Cart in prefs; restore on cold start (optional default Home) |
| **Mode-aware commerce** | shop → cart; motors/property → enquire (already) |
| **Wishlist memory** | Heart state global (done) |
| **Cart badge** | Live count; pulse only on increment |
| **Deep links later** | Product slug → PDP; order id → Track |
| **Network awareness** | Offline banner sticky under header when `!Net` |
| **Prefetch** | On Home idle, warm top 8 product images |
| **Form memory** | Request/Checkout: restore draft if back pressed mid-form |

### 5.2 Shopper intelligence

| Moment | Smart default |
|--------|----------------|
| Empty search | Suggest top categories + Request product |
| Empty cart | “Popular now” 2-product strip (from cache) |
| PDP return | If added to cart, show lightweight sticky “View cart” 3s |
| Track order | Prefill last requestId from prefs if any |
| Browse close | Return to same tab + scroll position (save `scrollY` per tab) |

### 5.3 Vendor intelligence

| Moment | Smart default |
|--------|----------------|
| Dashboard open | Surface **In review** count as first priority card if > 0 |
| Empty products | Giant “Add product” — not a sad empty list only |
| Order list | Default sort: actionable first (pending > completed) |
| Product form | Prefill category from last submission |
| After submit | Success → “What next?” Add another | View list |

### 5.4 Admin intelligence

| Moment | Smart default |
|--------|----------------|
| Dashboard | **Pending approvals** is hero KPI if queue > 0 (red/amber pulse once) |
| Moderation | Oldest pending first; swipe/approve animations confirm action |
| Orders | Next-status button only (already) — disable double-tap during PATCH |
| Analytics | Compact numbers (RWF 2.4M) on small screens |

---

## 6. Screen-by-screen design intelligence

Each screen: **Purpose · Layout · Enter · Load · Smart · Exit**

---

### 6.1 WelcomeActivity

| | |
|--|--|
| **Purpose** | Brand trust + path choice (Google / email / visitor) |
| **Layout** | Auth canvas · logo · H1 · 3 benefit rows · CTAs stacked |
| **Enter** | Fade + slight scale 0.98→1 (first launch only) |
| **Load** | Instant (no network required for UI) |
| **Smart** | Skip if session or `welcome_complete`; force_show for re-auth |
| **Exit** | → Main (visitor) or Sign-in flow |

**Intelligence:** Never trap returning users. Visitor path must be one tap.

---

### 6.2 SignIn / SignUp / PasswordRecovery

| | |
|--|--|
| **Purpose** | Credential exchange with minimal friction |
| **Layout** | Auth canvas · title · form card · primary CTA sticky-ish at bottom of scroll |
| **Enter** | Push from right |
| **Load** | Inline button spinner; disable double submit |
| **Smart** | Prefill email from last successful login; password fields show/hide; keyboard action = submit |
| **Exit** | Success → Dashboard (role path); failure → shake field + message under |

**Motion:** On error, horizontal micro-shake on form card (6dp, 2 cycles).

---

### 6.3 MainActivity — Home

| | |
|--|--|
| **Purpose** | Discovery: hero → categories → featured → fresh → vendors → tools |
| **Layout** | Pinned header · scroll · dock · FAB · canvas storefront |
| **Enter** | Shell (no full activity anim if already Main) |
| **Load** | Progressive: hero frame → skeleton grid → data; pull-to-refresh soft |
| **Smart** | Live trust counts; dim canvas on scroll; remember scrollY; prefetch images |
| **Motion** | Hero pager snap; section headers sticky optional later; card stagger ≤6 |

**Intelligence:**  
- If marketplace fails but cache exists → show cache + “Offline copy” chip.  
- Featured empty → fall back to first N products without empty hole.

---

### 6.4 MainActivity — Shop

| | |
|--|--|
| **Purpose** | Filtered catalog browse |
| **Layout** | Title · chips · count · 2-col grid |
| **Enter** | Crossfade from Home |
| **Load** | Skeleton grid while filtering heavy lists (local filter = instant) |
| **Smart** | Chip “All” default; search from header lands here with query subtitle; empty → Request CTA |
| **Motion** | Chip selected: fill brand + scale; grid replace crossfade 160ms |

---

### 6.5 MainActivity — Browse (overlay)

| | |
|--|--|
| **Purpose** | IA tool (categories / vendors / tools / deals) — not a destination |
| **Layout** | Dim + sheet above dock; Done bar; tabs |
| **Enter** | Slide up 240ms; dim 0→0.45 |
| **Load** | Category skeletons if marketplace still loading |
| **Smart** | Toggle open/close on dock Browse; back closes first; restore previous tab |
| **Exit** | Slide down; dock Browse inactive |

---

### 6.6 MainActivity — Stores

| | |
|--|--|
| **Purpose** | Vendor directory / trust |
| **Layout** | Title · vendor cards (rating, location, count) |
| **Load** | Skeleton cards |
| **Smart** | Sort by rating then active products; search filter (P1) |
| **Motion** | Card stagger; tap → VendorProfile push |

---

### 6.7 MainActivity — Cart

| | |
|--|--|
| **Purpose** | Review quantities → checkout |
| **Layout** | Lines · sticky checkout bar (when not empty) |
| **Load** | Instant (local Cart object) |
| **Smart** | Empty state with 2 recommended products; qty steppers 44dp; sticky total always visible when items > 0 |
| **Motion** | Qty change: number crossfade; remove: swipe-out optional (P2) |
| **Exit** | Checkout push |

---

### 6.8 ProductDetailActivity (PDP)

| | |
|--|--|
| **Purpose** | Decide: buy / enquire / save / message seller |
| **Layout** | Gallery · meta · vendor · about · features · sticky CTA+like |
| **Enter** | Push; ideally shared element image (P1) |
| **Load** | Image box + skeleton lines; sticky bar shows price ASAP from intent extras (already passed — **zero wait for meta**) |
| **Smart** | Mode CTAs; gallery counter; out-of-stock plan; prefill Request with name/category |
| **Motion** | Thumb select fades main image; sticky bar slides up 200ms after first layout |
| **Exit** | Back reverse; if cart add → optional snackbar |

**Intelligence gold:** PDP should work **offline for content already in intent** — never block UI on re-fetch unless “load more gallery”.

---

### 6.9 RequestProductActivity / TrackOrderActivity

| | |
|--|--|
| **Purpose** | Assisted commerce loop (source / follow) |
| **Layout** | Form card steps; primary submit |
| **Enter** | Push |
| **Load** | Inline submit only |
| **Smart** | Prefill product from PDP; category spinner live; Track restores last ID; success copy includes next step |
| **Motion** | Success: check icon settle → auto navigate Track or Home after 1.2s optional |

---

### 6.10 CheckoutActivity

| | |
|--|--|
| **Purpose** | Convert cart → order request |
| **Layout** | Summary · contact · payment preference · submit |
| **Load** | Button spinner; keep summary visible |
| **Smart** | Prefill name/phone/email from session; block empty cart; validate phone RW format soft |
| **Success screen** | Dedicated intermediate state (not just toast): order id + Track CTA + Home |
| **Motion** | Success settle F pattern |

---

### 6.11 AiSupportActivity

| | |
|--|--|
| **Purpose** | Conversational help without leaving app |
| **Layout** | Thread · composer sticky · keyboard resize |
| **Enter** | Modal-ish push from bottom optional (or standard push) |
| **Load** | Typing indicator bubble (3 dots pulse) |
| **Smart** | Starter chips (“Track order”, “Become vendor”); context pass product slug if opened from PDP later |
| **Motion** | New bubbles rise 10dp + fade (exists) |

---

### 6.12 DashboardActivity (role hub)

| | |
|--|--|
| **Purpose** | Role command center — **not** a long dumping ground |
| **Layout** | Identity band · KPI grid · priority action · recent tables · manage links |
| **Enter** | Ops push from Account |
| **Load** | KPI skeletons → data; don’t wait all APIs if one is slow (admin: show analytics KPIs even if applications lag) |
| **Smart** | **Priority card first** if pending work; role-specific manage list; sign out clears task stack to Main |
| **Motion** | KPI count-up optional (P2); links press scale |

**Admin intelligence order:** Approvals → KPIs → Vendor performance → Manage  
**Vendor intelligence order:** In-review alert → KPIs → Add product → Recent products/orders → Manage  
**Customer order:** Track · Request · Browse

---

### 6.13 OrdersActivity (admin/vendor)

| | |
|--|--|
| **Purpose** | Operational queue — scan status, act |
| **Layout** | Near-flat canvas · filter chips (All / Actionable / Done) · table rows |
| **Load** | Skeleton rows |
| **Smart** | Default “Actionable”; admin next-status single path; prevent double PATCH; after update, animate row status chip morph |
| **Motion** | Status chip color crossfade; list refresh soft not full wipe |

---

### 6.14 VendorProductActivity / Admin product & moderation

| | |
|--|--|
| **Purpose** | Create/edit listing or approve queue |
| **Layout** | Form sections (Basics · Price · Media · Features) or queue cards |
| **Load** | Edit: prefill from intent (instant); network save = button spinner |
| **Smart** | Dirty-form back dialog; image URL validate; moderation cards exit G animation |
| **Motion** | Section expand optional; success settle → back with result |

---

### 6.15 Analytics / Payouts / Vendors / Categories / Blogs / Recovery

| | |
|--|--|
| **Purpose** | Specialized ops tools |
| **Shared pattern** | Title · optional KPI strip · **table or card list** · empty/error |
| **Load** | Skeleton matching density |
| **Smart** | Pagination mindset (even if client-side first 25); money tabular; row # for ops talk |
| **Motion** | D ops push; row tap push to detail where exists |

---

### 6.16 VendorProfileActivity / Blog / Privacy / WebActivity

| | |
|--|--|
| **Purpose** | Content / legal / rare web fallback |
| **Smart** | WebActivity only when native missing; show native chrome top bar always |
| **Motion** | Standard push; Web: progress bar under top bar (not full spinner page) |

---

## 7. Page appearance contract (visual structure)

Every screen uses one of three **frames**:

### Frame R — Retail shell
```
[ Navy header / pinned ]
[ Canvas + scroll content ]
[ Optional sticky commerce bar ]
[ Navy dock ]
```
Used by: Main tabs, conceptually PDP (no dock but sticky).

### Frame F — Flow form
```
[ Navy topBar + back + title ]
[ Canvas + padded scroll ]
[ Primary CTA in content or bottom sticky ]
```
Used by: Auth, Request, Track, Checkout, forms.

### Frame O — Ops
```
[ Navy topBar ]
[ Near-flat canvas ]
[ KPI optional ]
[ Dense list/table ]
[ FAB optional (AI) — hide if clashes ]
```
Used by: Dashboard tree.

**Spacing rhythm:** 16dp screen · 12–14 card pad · 20–24 section gap · 8 between dense rows.

---

## 8. Navigation intelligence

### 8.1 Back stack rules

| From | Back goes to |
|------|----------------|
| PDP | Previous (Main) |
| Checkout | Cart tab (prefer) not random |
| Dashboard child | Dashboard |
| Dashboard | Main (clear if signed out) |
| Browse open | Close sheet first |
| Dirty form | Confirm discard dialog |

### 8.2 Dock intelligence

| Tab | Active when |
|-----|-------------|
| Home | `currentTab == Home` |
| Browse | Sheet open (tool highlight) |
| Request | — (activity; no sticky active unless return flag) |
| Stores | Stores tab |
| Account | On Dashboard/Auth stack |
| Cart | Cart tab; badge = count |

### 8.3 Deep navigation helpers (code)

```kotlin
// BaseActivity
fun navigateForward(intent: Intent, style: TransitionStyle = PUSH)
fun navigateUpToMain(tab: Tab? = null)
fun navigateToProduct(product: ProductParcel) // shared element ready
```

---

## 9. State machine (every list screen)

```
IDLE → LOADING_SKELETON → CONTENT
         ↓                  ↓
       ERROR ←──────── REFRESHING
         ↓
    EMPTY (subset of CONTENT with empty component)
```

**Rules:**  
- REFRESHING never removes CONTENT (swipe overlay only).  
- ERROR from empty first load shows ErrorState full.  
- ERROR from refresh shows snackbar, keep CONTENT.

---

## 10. Performance & intelligence budget

| Budget | Target |
|--------|--------|
| Cold start → interactive Home chrome | < 1.5s mid device |
| Marketplace API paint after cache | < 300ms perceived |
| Tab switch | < 200ms animation complete |
| List stagger | Max 6 items, then instant |
| Image threads | Pool 3 (exists); disk cache later |
| Canvas draw | Opacity/radials only; no per-frame alloc |

---

## 11. Accessibility & motion respect

- All icon buttons: `contentDescription`  
- Motion: honor animator duration scale  
- Focus order: top bar → content → sticky CTA  
- Don’t auto-advance hero if reduced motion  
- Status not color-only (text in chip)

---

## 12. Implementation roadmap

### Phase M1 — Motion foundation (1 session)
1. `res/anim/*` + `styles` activity transitions  
2. `BaseActivity.navigateForward / finishWithSlide`  
3. Unify enter fade helper  
4. Browse sheet polish (dim + translate)

### Phase M2 — Loading foundation (1–2 sessions)
5. `Skeleton*` builders in BaseActivity  
6. Replace “Loading…” text on Dashboard, Orders, Admin*, Vendor lists  
7. Home progressive + marketplace memory cache  
8. Shared `EmptyState` / `ErrorState`

### Phase M3 — Screen intelligence (2 sessions)
9. Last tab + scroll position prefs  
10. Cart empty recommendations  
11. Checkout success screen  
12. Dashboard priority card by role queue  
13. Form dirty back guard  
14. Track last order id pref  
15. Offline banner under header  

### Phase M4 — Delight (optional)
16. Shared element PDP  
17. KPI count-up  
18. Cart remove swipe  
19. Hero autoplay with pause on touch  

---

## 13. File / module map

| New / updated | Responsibility |
|---------------|----------------|
| `res/anim/slide_in_right.xml` etc. | Activity transitions |
| `res/values/styles.xml` | `AppTheme.NoActionBar` windowAnimationStyle |
| `BaseActivity.kt` | navigate helpers, skeletons, empty/error, dirty dialog |
| `MarketplaceCache.kt` | Last products/vendors JSON memory+prefs |
| `MainActivity.kt` | Progressive home, tab memory, scroll restore |
| `CheckoutActivity.kt` | Success frame |
| `DashboardActivity.kt` | Priority intelligence + skeletons |
| `OrdersActivity.kt` | Filter chips + skeletons + soft refresh |
| All list activities | State machine CONTENT/ERROR/EMPTY |

---

## 14. Success criteria (senior bar)

| Check | Pass |
|-------|------|
| **Page appearance** | You can screenshot any screen and name its Frame (R/F/O) in 2s |
| **Loading** | No screen shows only gray text “Loading…” as the UI |
| **Motion** | Forward/back feel directional and reversible |
| **Intelligence** | Empty cart, empty vendor products, admin pending queue each suggest the right next action |
| **Shell** | Header/dock never jump when content reloads |
| **PDP** | Price/CTA visible immediately from intent |
| **Checkout** | Success is a screen, not only a toast |
| **Perf** | Tab switch and list open feel instant on SM-A31 class |

---

## 15. What we deliberately don’t do yet

- Full Navigation Component rewrite  
- Jetpack Compose migration (can adopt screen-by-screen later)  
- Complex hero shared-element on all paths day one  
- Lottie everywhere (prefer system animators + vectors)

---

## 16. Recommended next step

Implement **Phase M1 + M2** next:  
**shared motion + skeleton loading system**, then wire **Dashboard / Orders / Home** as reference screens.  

Say **implement motion** or **implement loading** (or both) to start coding.
