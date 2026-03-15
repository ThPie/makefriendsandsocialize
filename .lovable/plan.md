

## Plan: Fix Membership Cards, Patron Matches, and Error Page

### Issues to Fix

1. **Patron matches: 5 → 4** in `stripe-products.ts`
2. **Membership cards show "See all benefits" even when all features visible** — redesign the expand/collapse: cards should be **compact by default** (show only first ~4 features), clicking "See all benefits" on any card expands ALL cards and shows missing features in grayscale
3. **Homepage PricingSection** — same expand/collapse behavior already works correctly (global toggle), but trial text says "30-day" — fix to "14-day"
4. **Error page from screenshot** — this is the ErrorBoundary catching a runtime crash. The error itself is likely from stale cache (already addressed with skipWaiting). The error page UI itself is working as designed.

### Changes

**File 1: `src/lib/stripe-products.ts`**
- Line 126: Change `'5 match reveals per month'` → `'4 match reveals per month'`

**File 2: `src/pages/MembershipPage.tsx`**
- Remove per-card `expandedTiers` state, replace with single `showAllFeatures` boolean (like PricingSection)
- Cards show only first 4 features by default
- When collapsed: show 4 features + "See all benefits" button
- When expanded: show ALL features for every card + missing features in grayscale (muted color, line-through, faded check icon) — same pattern as PricingSection
- Single toggle expands/collapses all cards simultaneously
- Button text: "See all benefits" / "Hide details"

**File 3: `src/components/home/PricingSection.tsx`**
- Line 30: Change `'30-day free trial'` → `'14-day free trial'`
- Line 39: Same change

### Technical Details

Membership card feature list structure (collapsed):
```tsx
{features.slice(0, 4).map(...)}  // Always visible
<div className={showAllFeatures ? "max-h-[800px]" : "max-h-0"}>
  {features.slice(4).map(...)}   // Remaining features
  {missingFeatures.map(...)}     // Grayscale, line-through
</div>
<button onClick={() => setShowAllFeatures(!showAllFeatures)}>
  {showAllFeatures ? "Hide details" : "See all benefits"}
</button>
```

