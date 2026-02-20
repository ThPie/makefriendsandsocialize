
## UI Refinements: Ethos Cards, Curated Collections, Patron Plan, Availability Section & Footer

### Summary of Changes

Six targeted fixes across five files:

1. **EthosSection** — Center-align all card content; replace "Global Access" with a new value prop
2. **ClubShowcaseSection** — Switch from 5-column to 3+3 grid (2 rows of 3), making cards larger
3. **PricingSection (homepage)** — Remove "Join Waitlist" from Patron; use "Start Free Trial" with the correct action
4. **AvailabilitySection** — Remove the entire section from the homepage
5. **Footer** — Remove the large "MAKE FRIENDS & SOCIALIZE" heading text
6. **Alignment** — Ensure both Ethos and Curated Collections share the same horizontal container padding so their left edges align

---

### Change 1 — EthosSection (`src/components/home/EthosSection.tsx`)

**Current issues:**
- Cards use `items-start` (left-aligned content), but the screenshot shows the user expects centered layout
- "Global Access" does not match the club's current local/NYC focus

**Fix:**
- Change `flex-col items-start` → `flex flex-col items-center text-center` on each card
- Replace the `Globe` icon import with `Users` (or `Handshake`) since it's about the community
- Change the "Global Access" item to **"Trusted Community"** with description *"A vetted network of like-minded individuals."*
- Keep the 4-column desktop grid but add `text-center` to the heading and description

**Before (card inner layout):**
```tsx
<div className="... flex flex-col items-start gap-3">
  <div className="p-2 rounded-full ..."> <item.icon /> </div>
  <h4 ...>{item.title}</h4>
  <p ...>{item.description}</p>
</div>
```

**After:**
```tsx
<div className="... flex flex-col items-center text-center gap-3">
  <div className="p-3 rounded-full ..."> <item.icon /> </div>
  <h4 ...>{item.title}</h4>
  <p ...>{item.description}</p>
</div>
```

---

### Change 2 — ClubShowcaseSection (`src/components/home/ClubShowcaseSection.tsx`)

**Current issues:**
- Desktop shows 5 narrow columns (5-col `grid-cols-5`) which makes each card small
- Cards are `h-[360px]` which is short and cramped at 5 columns
- The user wants 3 on top + 3 on bottom (2 rows of 3), making each card much wider and taller

**Fix:**
- On desktop (`lg+`), change from `grid-cols-5` → `grid-cols-3`
- Increase card height: `h-[360px]` → `h-[420px] lg:h-[480px]`
- The 5th club (Slow Dating → "Intentional Connections") becomes the 6th slot, but we only have 5 clubs. The 5th card will span naturally — to fill the 2×3 grid evenly with 5 items, make the last card `lg:col-span-3` (span full row) or add a 6th club entry. 

**Best approach:** Add a 6th placeholder/circle entry ("The Singles" or "Coming Soon") to complete the 3+3 grid, OR make the 5th card span the remaining space. The cleanest solution without adding fake content: keep 5 clubs and use `grid-cols-3` where the 5th card auto-flows to position 5, leaving position 6 empty. This looks slightly off.

**Better approach:** Change from `grid-cols-5` on desktop to `grid-cols-3` and make the **last item span a full row** (`lg:col-span-3` with a different aspect-ratio landscape card), or simply show the 5 items as a `grid-cols-3` where the last row has 2 items centered.

**Implementation:** Use CSS grid with `grid-cols-3` and for the last item (5th), add `lg:col-start-2` to center it in the last row. This creates a diamond/pyramid finish: row 1 = 3 cards, row 2 = 2 cards centered.

Actually the cleanest visual with 5 items in a "3+2" is:
- `grid-cols-3` on lg
- Last 2 items: wrap naturally into 2nd row positions 1 and 2, with the row itself centered via `justify-center` but that conflicts with grid

**Simplest clean option:** Use `grid-cols-3` for the grid, the 5th card gets `lg:col-start-2` so the second row is `_ [4] [5] _` centering them. This is a clean layout.

- Card height → `h-[420px]` on desktop for better visual impact

---

### Change 3 — PricingSection homepage (`src/components/home/PricingSection.tsx`)

**Current issue:** Patron tier has `cta: 'Join Waitlist'` and `href: '/membership'` — the user wants this replaced with "Start Free Trial" just like Insider.

**Fix:** In the `tiers` array, change the patron entry:
```tsx
// Before:
{ id: 'patron', cta: 'Join Waitlist', href: '/membership', variant: 'secondary' }
// After:
{ id: 'patron', cta: 'Start Free Trial', href: '/membership', variant: 'secondary', trial: '30-day free trial' }
```

Note: The homepage `PricingSection` doesn't wire up Stripe checkout (it just links to `/membership`), so this is a label change only. The actual checkout is handled in `MembershipPage.tsx` which already calls `handleStartTrial`.

---

### Change 4 — Remove AvailabilitySection (`src/pages/HomePage.tsx`)

**Fix:** Simply remove the `<Suspense>` block that renders `<AvailabilitySection />` from `HomePage.tsx`. Also remove the lazy import at the top.

The `AvailabilitySection.tsx` file itself can remain (no-delete needed) — it's just not rendered.

---

### Change 5 — Footer heading (`src/components/layout/Footer.tsx`)

**Current:** The footer has a large centered `<h2>` that reads "MAKE FRIENDS & SOCIALIZE" in bold uppercase as a decorative header.

**Fix:** Remove the entire "Main Header" div block:
```tsx
{/* Remove this: */}
<div className="text-center mb-16 md:mb-24 space-y-6">
  <h2 className="font-display font-bold text-3xl md:text-5xl tracking-widest uppercase">
    MAKE FRIENDS & SOCIALIZE
  </h2>
</div>
```

Replace it with the **logo image** instead (using `<BrandLogo>` or the existing `currentLogo` img tag) to keep the footer branded but not text-heavy. This matches standard footer design patterns.

---

### Change 6 — Alignment Between Sections

**Issue:** The "Our Ethos" section header starts at `px-6` inside `max-w-6xl`, while "Curated Collections" header is `px-6 max-w-7xl`. The cards themselves also have different max-widths, so their left edges don't align visually.

**Fix:** Standardize both sections to use the same container: `max-w-7xl mx-auto px-6`. This means:
- `EthosSection`: change inner container from `max-w-6xl` → `max-w-7xl`
- `ClubShowcaseSection`: already uses `max-w-7xl` for the header — just ensure the grid container also uses `max-w-7xl px-6 mx-auto`

---

### Files to Modify

| File | Change |
|---|---|
| `src/components/home/EthosSection.tsx` | Center-align cards, replace Globe/Global Access with Users/Trusted Community, expand container to `max-w-7xl` |
| `src/components/home/ClubShowcaseSection.tsx` | Switch desktop grid to `grid-cols-3`, increase card height, ensure `max-w-7xl` alignment |
| `src/components/home/PricingSection.tsx` | Change Patron CTA from "Join Waitlist" to "Start Free Trial" |
| `src/pages/HomePage.tsx` | Remove `AvailabilitySection` import and render block |
| `src/components/layout/Footer.tsx` | Remove the large "MAKE FRIENDS & SOCIALIZE" h2 heading, replace with logo image |

### No database or backend changes required — all purely frontend/UI changes.
