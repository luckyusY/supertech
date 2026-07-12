# SuperTech Android — Detailed UI/UX Plan (Senior Product + Engineering)

**Audience:** product + Android  
**App:** `mobile/android` · `africa.supertech.marketplace`  
**Reference:** SuperTech website (Photo Factory mobile chrome + Adorama hero + assisted commerce)

---

## 1. Product north star

> A **trusted African marketplace app** that feels as premium as the website: fast to browse, obvious how to buy/request/track, never “lost” in a modal or dead-end.

### Experience pillars

| Pillar | Meaning in the app |
|--------|--------------------|
| **Clarity** | One primary action per screen; dock always tells you where you are |
| **Trust** | Verified sellers, clear prices (RWF), status labels, contact paths |
| **Speed** | Search + Browse sheet get you to products in ≤2 taps |
| **Safety** | Modals never trap; dock stays usable; back always works |
| **Parity** | Same mental model as website mobile (header, Browse, hero, cards) |

---

## 2. Current architecture (what we ship today)

```
Welcome → MainActivity (shell)
            ├─ Dark header (logo | search | phone | WA)
            ├─ Scroll content (Home / Shop / Stores / Cart)
            ├─ Dark 6-tab dock
            └─ AI FAB
Browse → Dialog sheet over content
PDP / Request / Track / Auth / Dashboards → separate activities
```

**Strengths:** Native performance path, real marketplace data, dock+header foundation, hero/rail started.  
**Weaknesses:** One huge `MainActivity`, sheet UX fragile, header scrolls away, PDP basic, FAB fights dock, no system back for Browse.

---

## 3. Component-by-component audit

### 3.1 System chrome (status bar / nav bar)

| Issue | Severity | Fix |
|-------|----------|-----|
| Status bar dark OK on home; other activities still mixed | Med | Standardize `backgroundStrong` on shopper; brand on auth optional |
| Gesture/nav bar color = dark; content may sit under it | High | `WindowInsets` + padding on dock and sheet |
| No edge-to-edge handling | Med | Enable edge-to-edge + inset consumers |

### 3.2 Promo strip + dark header

| Element | Now | Problems | Target |
|---------|-----|----------|--------|
| Promo | Static text | Not tappable; no hierarchy | Tap “Sell” → BecomeVendor; “Request” → Request |
| Logo | 34dp | OK | Keep; tap → Home |
| Search pill | Works on keyboard action | Icon not clickable; no clear; no recent | Icon submits; clear “×”; optional recent chips |
| Phone / WA | Works | Sparkle ≠ WhatsApp icon | Dedicated WA glyph or label |
| Scroll | Header inside content | **Header disappears on scroll** | Pin header above `SwipeRefresh` |

**Product rule:** Header is **persistent chrome**, not content.

### 3.3 Bottom dock (6 tabs)

| Tab | Now | Issues | Target |
|-----|-----|--------|--------|
| Home | Content tab | OK | Active gold underline + icon |
| Browse | Opens dialog | Opening doesn’t toggle close; dock can feel “under” sheet | **Toggle**; sheet always sits **above** dock; dock remains fully visible |
| Request | Launches activity | No active state when returning | Optional subtle “recent” |
| Stores | Vendors list | Label “Stores” vs web “Vendors” | Keep Stores (clearer for shoppers) |
| Account | openAccount | No visual active | Highlight when on dashboard/auth |
| Cart | Badge | OK | Pulse only once; 9+ badge |

**Critical product bug (your report):**  
When Browse is open, **closing is unclear / navigation may feel hidden**. Root causes:

1. Sheet is a **fullscreen Dialog** — activity dock is *behind* the dialog window, not interactive.  
2. Close relies on tiny X or tapping dimmed area — easy to miss.  
3. Bottom margin `68dp` is approximate; on some devices sheet still crowds the dock visually.  
4. Tapping **Browse again does not close** the sheet.

**Target pattern (website + best practice):**

```
┌─────────────────────────────┐
│ Dimmed content              │
│ ┌─────────────────────────┐ │
│ │ Handle                  │ │
│ │ Sheet content (scroll)  │ │
│ │ [Done] sticky footer    │ │
│ └─────────────────────────┘ │
│ ══════ DOCK ALWAYS VISIBLE ═│  ← part of activity, clickable
└─────────────────────────────┘
```

**Implementation choice:** Prefer **in-activity overlay** (FrameLayout over content, *above* swipe, *sibling under dock*) over `Dialog`, so the real dock stays interactive and Browse acts as a toggle.

### 3.4 Browse sheet content

| Area | Now | Issues | Target |
|------|-----|--------|--------|
| Tabs | Categories / Vendors / Tools / Deals | Horizontal squeeze on small phones | Scrollable tabs; optional icons |
| Category rows | Image + label | Long names wrap poorly; empty cats | 2-line clamp; empty state |
| Loading | Silent empty list | Looks broken while marketplace loads | Skeletons or “Loading…” |
| Tools | Hardcoded intents | OK | Match website tools |
| Deals | Weak links | “Flash picks” same as Shop | Deep-link filters |
| A11y | Limited | No contentDescription on rows | Full labels |
| Motion | None | Abrupt | Slide-up + fade (200–280ms) |
| Back | System back may exit app | Bad | `OnBackPressed` closes sheet first |

### 3.5 Home — Hero (Adorama)

| Issue | Severity | Fix |
|-------|----------|-----|
| Height 300dp OK | — | Keep 280–320dp range |
| Banner load may fail | Med | Gradient fallback always underneath |
| Feature chips compete with dots | Low | More bottom padding under chips |
| Autoplay missing | Low | Optional 6s auto-advance |
| No accessibility for pages | Med | Announce page changes |

### 3.6 Home — Blue category rail

| Issue | Severity | Fix |
|-------|----------|-----|
| Good visual | — | Keep |
| No “See all” | Low | End tile → Browse Categories |
| Duplicate of Browse | OK | Rail = discovery; Browse = full IA |

### 3.7 Trust strip / sections / featured / fresh

| Issue | Severity | Fix |
|-------|----------|-----|
| Trust strip generic | Med | Live counts: products · vendors · fulfillment |
| Featured carousel OK | — | Snap polish |
| Fresh uses list cards not grid | Med | Use 2-col grid for consistency |
| Quick actions 6 tiles busy | Med | Max 4: Request, Track, Sell, AI |

### 3.8 Shop tab

| Issue | Severity | Fix |
|-------|----------|-----|
| No title when opened from search | Low | Subheader “Results for …” |
| Chips only text | Med | Optional image chips for top cats |
| Empty state weak CTA | Med | Request product button |
| Header scrolls away | High | Shared pinned header |

### 3.9 Stores tab

| Issue | Severity | Fix |
|-------|----------|-----|
| Basic list | Med | Card with rating, location, product count |
| Search missing | Med | Filter bar |

### 3.10 Cart

| Issue | Severity | Fix |
|-------|----------|-----|
| Checkout not sticky | Med | Sticky bottom bar |
| No empty illustration | Low | Brand empty state |
| Qty controls (if any) need larger hit targets | Med | 44dp targets |

### 3.11 Product detail

| Issue | Severity | Fix |
|-------|----------|-----|
| Single image | High | Gallery swipe + counter |
| No sticky buy bar | High | Bottom bar: price + Add / Request |
| No vendor block | High | Sold by + visit store |
| No share / WhatsApp | Med | Secondary actions |
| Mode rules (motors/property) missing | High | Port product-rules CTAs |

### 3.12 AI FAB

| Issue | Severity | Fix |
|-------|----------|-----|
| Overlaps dock | Med | Higher margin + hide when sheet open |
| Label “AI Support” wide | Low | Icon-only with badge |

### 3.13 Auth / Welcome / Request / Track / Dashboards

| Area | Priority | Notes |
|------|----------|-------|
| Welcome | P1 | Align logo, gold CTA, benefits |
| Sign-in/up | P1 | Dark top brand band |
| Request / Track | P1 | Same form density as web |
| Admin/Vendor | P2 | Tables with internal scroll; logo sidebar |

---

## 4. Information architecture (final dock model)

```
Home ─── discovery (hero, rail, featured)
Browse ─ temporary sheet (does not change “location”)
Request ─ full-screen activity
Stores ─ vendor directory
Account ─ session / dashboards
Cart ─── checkout prep
```

**Browse is a tool, not a place.** Closing Browse should return you to the same Home/Shop/Stores/Cart you were on.

---

## 5. Interaction rules (non-negotiable)

1. **Dock always visible** when Browse is open.  
2. **Browse tap toggles** open/close.  
3. **Back closes Browse** before leaving activity.  
4. **Tap dimmed area closes Browse.**  
5. **Primary close control:** “Done” bar full width above dock.  
6. **Never** use a Dialog that covers the dock unless it re-implements the dock.  
7. **Safe area:** respect nav bar / gesture inset on all bottom chrome.  
8. **One primary CTA** per commercial card.  
9. **Loading never looks empty** — skeletons within 100ms.  
10. **Errors always offer retry + request path.**

---

## 6. Visual design system (app tokens)

| Token | Value | Use |
|-------|-------|-----|
| `backgroundStrong` | `#0A0F1A` | Header, dock, sheet chrome |
| `brand` | `#E8770A` | Primary CTA, badges |
| `gold` | `#F5A62A` | Hero accent, dock active |
| `page` | `#F1F1F2` | App bg |
| `surface` | `#FFFFFF` | Cards |
| `ink` / `muted` / `line` | existing | Type / borders |
| Radius | 8 / 12 / 16 | controls / cards / sheets |
| Dock height | 56–64 + inset | Fixed |
| Touch min | 44dp | Icons, dock, close |

---

## 7. Prioritized roadmap

### P0 — Critical UX (this sprint, now)

1. **Browse as activity overlay, dock stays live + toggle close**  
2. Done bar + larger close hit target  
3. System back closes sheet  
4. FAB hide while sheet open  
5. Search icon submits  
6. Pin header above scroll (structural)

### P1 — Home & Shop polish (next)

7. Live trust stats  
8. Featured + fresh grid consistency  
9. Empty/loading skeletons for Browse  
10. Hero fallback + autoplay optional  

### P2 — Conversion (PDP + cart)

11. PDP gallery + sticky CTA  
12. Vendor block + mode-aware buttons  
13. Cart sticky checkout  

### P3 — Depth

14. Stores search/filter  
15. Auth redesign  
16. Dashboard table scroll  
17. Extract UI modules from `MainActivity`  

---

## 8. Success metrics

| Metric | Target |
|--------|--------|
| Time to first product from cold open | < 5s on 4G |
| Browse open → category → product | ≤ 3 taps |
| Users stuck on sheet (rage taps) | Near zero (toggle works) |
| Crash-free sessions | > 99.5% |
| Side-by-side visual match vs website home top | Recognizable in 3 seconds |

---

## 9. What we implement immediately after this plan

P0 items 1–5 in `MainActivity`: overlay Browse sheet, dock visibility, toggle, Done bar, back handler, FAB, search submit.
