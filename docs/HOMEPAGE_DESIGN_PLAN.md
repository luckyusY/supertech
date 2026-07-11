# Homepage UI Design Plan

**Role:** Senior product / visual design  
**Goal:** Make the SuperTech homepage scan like a premium African marketplace — clear hierarchy, trust first, products easy to compare, zero visual noise.

---

## Current-state audit

| Section | What works | What’s weak |
|---------|------------|-------------|
| **Hero triad** | Familiar marketplace layout | Category rail feels flat; promo + tools compete; heights uneven on desktop |
| **Trust strip** | Good placement under hero | Dense; stats + links feel like two widgets stacked |
| **Mobile chips / shortcuts** | Entry points exist | Duplicates categories + shortcuts; grid of 10 tiles is busy |
| **Campaign banners** | Visual energy | Too many mid-page carousels interrupt product scanning |
| **Product shelves** | Color headers by lane | Headers oversized; description block wastes space; cards cramped; 2-col grid on mobile is fine but gaps are tight |
| **Product cards** | Mode-aware CTAs | Visual hierarchy is inverted (actions loud, price competes with badges); dual CTAs crowd; type scale is small/uneven; feels utilitarian not retail-premium |
| **Vendor shelf** | Clear cover + logo | Cards generic; weak verified signal |
| **Sell CTA** | Clear conversion | OK; can feel more intentional |

### Design principles for this pass

1. **Price and product first** — shoppers decide on image + price + title.  
2. **One primary action per card** — chat is secondary (icon).  
3. **Rhythm over rainbow** — keep shelf colors but quieter headers.  
4. **Fewer competing entry points** — chips on mobile, shortcuts refined.  
5. **White space with intent** — denser product grids, calmer chrome.  
6. **Touch-friendly without chunky** — 40px targets, not 48px everywhere.

---

## Section plan

### 1. Product card (highest impact)
- Clean white card, soft border, radius-md, lift on hover  
- Image: square, badges only discount (or mode) + optional single badge  
- Wishlist: smaller, less chrome  
- Meta: vendor · rating on one line  
- Title: 2 lines, medium weight, good contrast  
- Price block: large price, compare-at, save% as chip  
- CTA: full-width primary (Add / Request / Enquire) + icon WhatsApp  
- Reduce motion stagger delay for dense grids  

### 2. Hero triad
- Category rail: active-style hover, thinner rows, sticky-feel header  
- Deal of day: stronger price + “Shop” cue  
- Tools card: icon row instead of three stacked buttons  

### 3. Trust strip
- Single row: 3 stats + subtle verified line (no dual bands if possible)  

### 4. Quick entry
- Mobile: keep chips only (remove duplicate shortcut grid on small screens)  
- Desktop: compact icon rail (8 max), not 10 heavy cards  

### 5. Shelves
- Unified header height; kicker + title + See all; drop bulky description band  
- Product grid: better gap/padding; 2 / 3 / 4 / 5 cols  
- Flash sale: **horizontal snap-scroll on mobile** (fixed card width ~11.5rem), grid from `sm+`; trailing “See all deals” snap tile on mobile only  

### 6. Vendors + sell CTA
- Vendor cards: verified chip, cleaner typography  
- Sell CTA: gradient accent edge or clearer two-column layout  

---

## Success criteria
- Cards readable at a glance on 360px  
- Homepage feels calmer and more premium  
- Same data/IA — visual and interaction quality only  
