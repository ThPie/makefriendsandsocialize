

## Plan: Mobile Grid Layouts, Quote Styling, TikTok Icon & Newsletter

### 1. Value Highlights — 2x2 grid on mobile
**File:** `src/pages/MembershipPage.tsx` (lines 298-316)

Change the horizontal scroll container to a `grid grid-cols-2` on mobile. The 3 items will show as 2 on top, 1 on bottom (centered).

### 2. Process Steps — 2+1 grid on mobile
**File:** `src/pages/MembershipPage.tsx` (lines 548-572)

Replace the horizontal scroll with `grid grid-cols-2` on mobile. The 3 steps will display as 2 on top, 1 centered on bottom.

### 3. Daily Quote — gold text with quotation marks
**File:** `src/components/common/DailyQuote.tsx`

- Change quote text color to `text-[hsl(var(--accent-gold))]`
- Wrap quote text in `"` `"` (curly quotation marks)
- Apply same gold styling in the mobile menu quote section (`MobileMenu.tsx`, line 210-211)

### 4. TikTok icon — add to Footer & MobileMenu
**Files:** `src/components/layout/Footer.tsx`, `src/components/layout/MobileMenu.tsx`

Lucide doesn't have a TikTok icon. Create a small inline SVG component for the TikTok logo. Add it to:
- Footer social links (line 133-143)
- MobileMenu social links array (line 34-38)

### 5. Newsletter subscription in Footer
**File:** `src/components/layout/Footer.tsx`

Add a newsletter section with:
- Email input + "Subscribe" button
- Inserts into the existing `newsletter_subscribers` table (columns: `email`, `source: 'footer'`, `is_active: true`)
- Duplicate email handling (show friendly message)
- Success toast on subscribe
- Placed above the Daily Quote section, visible on both mobile and desktop

### Technical details

- The `newsletter_subscribers` table already exists with the right schema — no DB migration needed
- TikTok SVG will be a minimal `<svg>` component (~10 lines), not a new dependency
- Grid changes use standard Tailwind: `grid grid-cols-2 gap-4 md:grid-cols-3`
- For the 2+1 layout, the last item gets `col-span-2 md:col-span-1 max-w-[calc(50%-8px)] mx-auto` on mobile to center it

