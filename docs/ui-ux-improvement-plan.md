# SuperTech UI/UX Improvement Plan

## Product direction

SuperTech should feel like a trustworthy, fast local marketplace: product-first, easy to scan, and clear about seller verification, ordering, and support. The orange brand color should guide attention rather than cover every surface.

## Phase 1: Homepage visual pass

Status: implemented in this pass.

- Establish a clear first viewport with product imagery, price, trust context, and two shopping paths.
- Replace the decorative hero type with the core product typography.
- Remove duplicate mobile category discovery and use one responsive horizontal browser.
- Move the page canvas from warm promotional tones to a neutral retail background.
- Reserve strong color for flash sales, primary actions, and small category cues.
- Keep product cards compact while making price, discount, seller, and actions easy to scan.
- Preserve keyboard focus and reduced-motion behavior.

## Phase 2: Shopping journey

- Align catalog filters, sorting, result counts, and empty states across desktop and mobile.
- Add persistent filter/sort controls on mobile and retain state when returning from a product.
- Improve product detail hierarchy: gallery, price, seller, fulfillment, primary action, then supporting details.
- Clarify cart and request flows with step labels, inline validation, and visible order totals.
- Standardize loading, error, empty, and success states across public routes.

## Phase 3: Trust and conversion

- Make delivery coverage, payment methods, returns, and buyer protection visible at decision points.
- Standardize verified-seller treatment and link it to a short explanation.
- Add delivery estimates and stock confidence near purchase actions when data supports them.
- Measure hero CTA use, category selection, product-card actions, checkout starts, and completion.

## Phase 4: System consistency

- Consolidate buttons, inputs, badges, cards, tables, and page headers into shared UI primitives.
- Reduce one-off colors and spacing values in favor of semantic design tokens.
- Audit all routes at 360, 768, 1024, and 1440 pixels.
- Run accessibility checks for landmarks, heading order, labels, focus order, contrast, and motion.

## Success measures

- Faster path from homepage entry to a product or category.
- Higher product-card and primary CTA engagement.
- Lower checkout or product-request abandonment.
- Fewer layout shifts and horizontal-overflow defects on mobile.
- Consistent component behavior across marketplace and dashboard routes.
