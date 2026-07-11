# Canvas · Typography · Dashboard Tables · Admin Vendor Detail

**Status:** Phase A + B **implemented**  
**Date:** 2026-07-11  
**Scope:** Ambient canvas system, type system, admin/vendor data tables (row numbers + pagination), admin vendor profile detail & edit  

### Implementation notes (A+B+C)
- `SiteCanvas` mounted in root layout; zone via `data-canvas` + scroll fade on storefront  
- Type roles: `.text-display|title|subtitle|body|label|caption|overline`, `.font-numeric`  
- `DataTable` + `TablePagination` + `RowNumber`  
- Admin vendors list paginated with #; detail at `/dashboard/admin/vendors/[slug]`  
- Seed vendors: `vendor_overrides` Mongo collection; mongo vendors: `updateMongoVendorProfile`  
- Phase C: products, categories, events stream, admin orders, vendor orders — all with # + pagination

---

## 0. Goals

1. **Canvas** feels intentional, zone-aware, and never competes with product content.  
2. **Typography** is a clear scale (display → caption) with consistent roles.  
3. **Dashboard tables** are scannable ops tools: numbering, pagination, density, empty/loading.  
4. **Admins** can open any vendor, inspect full detail, and update fields (not only disable/delete).

---

## 1. Canvas system (ambient background)

### 1.1 Current state (audit)

| Layer | Implementation | Problem |
|-------|----------------|---------|
| Grain | Fixed SVG noise, `opacity: 0.028` in `layout.tsx` | Nearly invisible; same everywhere |
| Glow | Fixed warm radial top-left, `0.07` orange | Static; no response to scroll/route |
| Page wash | `.marketplace-campaign-bg` on home/catalog only | Inconsistent with account/dashboard |
| Dashboard | Flat `--background` | Correct for ops, but no shared “canvas contract” |

**Design principle:** Canvas is **atmosphere under content**, not decoration on content. Strength should change by **zone** and **scroll depth**.

### 1.2 Target architecture

Replace ad-hoc fixed divs with a single client component:

```
SiteCanvas (client)
├── base fill (token --canvas-base)
├── grain layer (opacity by zone)
├── brand glow A (position/opacity by zone + scroll)
├── brand glow B (optional secondary, cooler teal for balance)
└── depth vignette (very subtle edges on long pages)
```

**File:** `src/components/site-canvas.tsx`  
**Mount:** root layout (replace current two fixed divs)

### 1.3 Zone model (visibility by where the user is)

| Zone | Routes / context | Canvas behavior |
|------|------------------|-----------------|
| **Storefront hero** | `/` top ~0–40% scroll | Stronger warm glow near top; grain medium; optional soft brand haze |
| **Storefront browse** | `/` mid–bottom, `/catalog`, `/products/*`, `/vendors` | Glow dims 30–50%; grain low; white cards dominate |
| **Auth / forms** | `/sign-in`, `/sign-up`, `/become-vendor` | Soft dual glow (brand + teal), calm, no busy grain |
| **App shell** | `/app/*` | Minimal grain; almost solid `--background` for app speed |
| **Dashboard** | `/dashboard/*` | **Near-flat canvas** — grain ≤ 0.02; no brand wash; ops focus |

### 1.4 Scroll-linked visibility (storefront only)

Drive with Lenis scroll position (or `window.scrollY` fallback):

| Scroll progress | Grain opacity | Glow opacity | Notes |
|-----------------|---------------|--------------|-------|
| 0% (top) | 0.035–0.045 | 0.10–0.14 | Visible but tasteful |
| 30% | 0.025 | 0.06 | Content takes over |
| 70%+ | 0.018 | 0.03 | Barely there; footer can darken |

Optional: slight **parallax** of glow center (`y: scroll * 0.08`) via GSAP/Lenis — very subtle.

**Reduced motion:** static zone opacities only; no parallax.

### 1.5 Color tokens (new canvas contract)

Add to `globals.css`:

```css
--canvas-base: #f5f4f0;
--canvas-grain-opacity: 0.035;
--canvas-glow-brand: rgba(232, 119, 10, 0.12);
--canvas-glow-cool: rgba(28, 84, 104, 0.06);
--canvas-vignette: rgba(24, 24, 26, 0.03);
```

Zone classes / data attributes on `<html>` or body:

- `data-canvas="storefront" | "auth" | "app" | "dashboard"`

### 1.6 Acceptance criteria (canvas)

- [ ] On homepage top, grain + glow readable but not muddy  
- [ ] On deep scroll / PDP, canvas recedes; product cards stay primary  
- [ ] Dashboard has no orange “campaign” wash  
- [ ] `prefers-reduced-motion` still works  
- [ ] No paint jank with Lenis (use transform/opacity only)

---

## 2. Typography system

### 2.1 Current state

- Fonts: **Inter** (body) + **Space Grotesk** (display/mix) + **IBM Plex Mono** (meta)  
- Tokens exist for sizes (`--text-display` … `--text-overline`) but **not enforced** in components  
- Mixed weights: `font-black` / `font-bold` / `font-semibold` inconsistently  
- Dashboard tables use ad-hoc `text-sm` without a table type role  

### 2.2 Type roles (contract)

| Role | Font | Size | Weight | Tracking | Use |
|------|------|------|--------|----------|-----|
| **Display** | Space Grotesk | 2–2.5rem | 700 | -0.03em | Hero H1 only |
| **Title** | Space Grotesk / Inter | 1.5–1.75rem | 700 | -0.02em | Page H1, shelf titles |
| **Subtitle** | Inter | 1.125rem | 600 | -0.01em | Section H2 |
| **Body** | Inter | 0.875–1rem | 400–500 | 0 | Descriptions, cells |
| **Label** | Inter | 0.75–0.8125rem | 600 | 0 | Form labels, table headers |
| **Caption** | Inter | 0.75rem | 500 | 0 | Helper, timestamps |
| **Overline** | Inter or Mono | 0.6875rem | 600–700 | 0.12–0.16em | Kickers, eyebrows |
| **Numeric** | Inter tabular-nums | inherits | 600–700 | -0.02em | Prices, counts, # columns |

### 2.3 Implementation plan

1. Expand `@theme` / utility classes in `globals.css`:

```css
.text-display { font-family: var(--font-space-grotesk); font-size: var(--text-display); ... }
.text-title { ... }
.font-numeric { font-variant-numeric: tabular-nums; }
```

2. Apply systematically (priority order):
   - Homepage shelves / hero  
   - Product card  
   - Admin page headers + tables  
   - Auth pages  

3. **Rule:** Never use `font-black` on body UI; max **bold (700)** for titles. Reserve black for rare marketing moments.

4. Line length: body copy max ~65ch in long-form; tables stay dense.

### 2.4 Acceptance criteria (type)

- [ ] One H1 per page, title role  
- [ ] Table headers use Label role  
- [ ] Prices always tabular-nums  
- [ ] Kickers use Overline role, not random tracking  

---

## 3. Dashboard tables (admin + vendor)

### 3.1 Current state

| Surface | Table? | Pagination | Row # |
|---------|--------|------------|-------|
| Admin vendors | Yes | No | No |
| Admin products | Yes | No | No |
| Admin orders | Dense expandable | Client filter, limit 50 | No |
| Admin events | Yes | Limit 50 | No |
| Admin categories | Yes | No | No |
| Vendor orders | Dense expandable | Limit 50 | No |
| Vendor products | List + “load more” | `PAGE_SIZE=12` only | No |

Problems: long lists unusable; no stable row identity for ops talk; inconsistent density.

### 3.2 Shared `DataTable` pattern

**New components:**

| Component | Responsibility |
|-----------|----------------|
| `ui/data-table.tsx` | Thead/tbody shell, zebra optional, sticky header |
| `ui/table-pagination.tsx` | Page size, prev/next, “Showing X–Y of Z” |
| `ui/row-number.tsx` | Computed `#` from `(page-1)*pageSize + index + 1` |

**Default pagination**

- Page sizes: **10 / 25 / 50**  
- Default: **25** (ops), **10** on mobile  
- URL sync optional later: `?page=2&pageSize=25`  
- Server tables: prefer server-side paging when list > 50  
- Client tables (orders): slice after filter  

### 3.3 Column contract

Every ops table:

1. **#** (narrow, muted, tabular)  
2. Primary identity (name / request ID)  
3. Status  
4. Key metrics  
5. Updated / created  
6. Actions  

Mobile: collapse to **card rows** with same fields (or horizontal scroll + sticky first column).

### 3.4 Rollout order

1. Admin **Vendors** (pairs with vendor detail work)  
2. Admin **Products**  
3. Admin **Orders** queue  
4. Vendor **Orders** + **Products**  
5. Events / analytics / categories  

### 3.5 Acceptance criteria (tables)

- [ ] Row numbers correct across pages  
- [ ] Pagination never shows empty last page incorrectly  
- [ ] Filter + page reset to page 1  
- [ ] Keyboard: focusable page controls  
- [ ] Empty state when 0 rows  

---

## 4. Admin: individual vendor detail & update

### 4.1 Current state

- List only: View (public storefront), Disable (seed), Delete (mongo)  
- **No** admin detail page  
- `updateMongoVendorProfile` exists in `mongodb-vendors.ts` for seller self-service — can be reused for admin  

### 4.2 Product requirements

**Route:** `/dashboard/admin/vendors/[slug]`

**Views / sections**

| Section | Fields / content | Editable? |
|---------|------------------|-----------|
| Header | Name, status (active/disabled), seed badge, public link | Status toggle |
| Profile | name, headline, location, categories, whatsapp, responseTime | Yes |
| Media | logoMark, coverImage, accent | Yes (URL or Cloudinary later) |
| Payments | momoMerchantCode, momoBusinessName | Yes (admin override) |
| Stats | products count, rating, fulfillment, joined | Read-only |
| Related | recent products, open orders (counts + links) | Links |
| Danger zone | Disable / Enable / Delete | Confirm |

### 4.3 Permissions

- Admin only (`requirePageSession roles: ["admin"]`)  
- Seed vendors: edit display fields in “override” layer **or** only allow disable + note; prefer **edit where data lives**  
  - Seed: updates via hidden-item metadata or a `vendor_overrides` collection if seed is immutable  
  - Mongo vendors: `updateMongoVendorProfile` + extended fields  

**Recommended:** extend `updateMongoVendorProfile` for admin; for seed vendors, store overrides in Mongo `vendor_overrides` keyed by slug (merge in `getAdminVendors` / public getters).

### 4.4 UX flow

```
Vendors table → row click or “Manage” → Detail page
  → Edit form (inline save)
  → Toast success
  → Revalidate public storefront + list
```

Optional v2: slide-over drawer instead of full page (faster ops).

### 4.5 API / actions

```
POST/PATCH /api/admin/vendors/[slug]   // or server actions
GET  /dashboard/admin/vendors/[slug]
updateAdminVendorAction(slug, payload)
toggleVendorAction (existing)
deleteVendorAction (existing)
```

### 4.6 Acceptance criteria (vendor detail)

- [ ] Admin can open any vendor by slug  
- [ ] Can update name, location, whatsapp, headline, categories  
- [ ] Can update MoMo fields  
- [ ] Disable/enable persists  
- [ ] Public storefront reflects edits after save  
- [ ] Audit: `updatedAt` + `updatedBy` (admin email)  

---

## 5. Phased execution plan

### Phase A — Foundations (1–2 days)
1. `SiteCanvas` + zone detection + scroll opacity  
2. Typography utility classes + apply to homepage + dashboards headers  
3. `DataTable` + `TablePagination` primitives  

### Phase B — Vendor admin (2–3 days)
1. Vendor detail page  
2. Admin update API/actions  
3. Vendors list: #, pagination, link to detail  
4. Seed override strategy if needed  

### Phase C — All ops tables (2 days)
1. Products, orders (admin + vendor), categories, events  
2. Shared pageSize persistence (localStorage optional)  

### Phase D — Polish
1. Canvas QA on mobile + Lenis  
2. Type audit pass  
3. Empty/loading states consistency  

---

## 6. Risks & decisions

| Risk | Mitigation |
|------|------------|
| Canvas animation jank with Lenis | Only opacity/transform; throttle scroll handler rAF |
| Seed vendors hard to edit | `vendor_overrides` collection |
| Double font loading | Keep 3 families; limit weights Inter 400/500/600/700, Grotesk 500/700 |
| Server vs client pagination | Start client for existing APIs; migrate large collections later |

---

## 7. Success metrics

- Admin time-to-edit-vendor: &lt; 30s from list  
- Table: find vendor in list of 100 without browser find  
- Canvas: no support tickets about “page looks dirty/busy”  
- Type: consistent H1/H2 across storefront + admin  

---

## 8. Out of scope (this plan)

- Full CMS for canvas themes  
- Real-time multi-admin conflict editing  
- Bulk vendor CSV import  

---

## 9. Key files to touch

| Area | Files |
|------|-------|
| Canvas | `layout.tsx`, new `site-canvas.tsx`, `globals.css`, `site-chrome.tsx` (zone) |
| Type | `globals.css`, homepage, product-card, admin-page-header |
| Tables | new `ui/data-table.tsx`, `ui/table-pagination.tsx`, all dashboard table pages |
| Vendor detail | `dashboard/admin/vendors/[slug]/page.tsx`, `actions.ts`, `mongodb-vendors.ts`, `api/admin/vendors/*` |

---

## 10. Recommended next step

**Execute Phase A + B first** (canvas + type foundations + vendor detail/edit + paginated vendors table). That unlocks the highest ops value and makes canvas/type improvements visible site-wide.
