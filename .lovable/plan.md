

# "What Our Members Say" — Testimonials Section Redesign

## Overview

A new split-layout testimonials section placed directly above the footer on the homepage. It will display real Meetup reviews scraped via a new edge function, stored in the existing `testimonials` table, and rendered in a paginated 2-column card grid.

---

## Technical Details

### 1. Database — No Migration Needed

The existing `testimonials` table already has the right columns: `name`, `quote`, `rating`, `image_url`, `source`, `is_approved`. We'll insert Meetup reviews with `source = 'meetup'` and `is_approved = true`.

### 2. New Edge Function: `sync-meetup-reviews`

The Meetup feedback page (`/feedback-overview/`) requires authentication, so Firecrawl may not be able to access it directly. The edge function will:

- Attempt to scrape `https://www.meetup.com/makefriendsandsocialize/feedback-overview/` using Firecrawl with extract mode
- Extract reviewer name, rating (1–5), review text, and profile photo URL
- Filter to only reviews with 4+ stars
- Upsert into `testimonials` table with `source = 'meetup'`, `is_approved = true`
- If scraping fails (auth wall), the function will return an error indicating manual seeding is needed

**Fallback approach:** If the Meetup feedback page cannot be scraped (login required), we will seed the testimonials table with the reviews manually. The user can trigger the sync function from the admin panel to try again later.

### 3. Rewrite `TestimonialsSection.tsx` — Split Layout

**Left column (~35%):**
- Gold section label: "MEMBER REVIEWS" (section-label class)
- Title: "What Our Members Say" in Cormorant Garamond italic, ~36px
- Muted subtitle: "Genuine experiences from real members of our community."
- Overlapping circular avatar cluster from reviewer photos (max 6, with "+X" gold badge)
- Overall star rating in gold (e.g. "★ 4.9 / 5") + total review count in muted text

**Right column (~65%):**
- 2-column grid of review cards (1 column on mobile)
- Each card: gold `"` quote mark top-left, review text (3 lines max, truncated), reviewer avatar + "FirstName L." + gold star rating at bottom
- Card background: `bg-card` with `border-border` border
- Hover: gold border highlight (`border-[hsl(var(--accent-gold))]`)
- Prev/next gold outline arrow buttons bottom-right to paginate (4 cards per page)

**Responsive:**
- Desktop: side-by-side 35/65 split
- Tablet: left stacks on top, cards below in 2-col grid
- Mobile: fully stacked, 1-col cards, avatars centered

**Colors — all from existing tokens:**
- `hsl(var(--accent-gold))` for quote marks, stars, hover borders, badges
- `text-foreground` for review body
- `text-muted-foreground` for names, subtitle
- `bg-card` / `border-border` for cards
- Avatar fallback: `bg-[#0D2415]` with gold initials

### 4. Update `HomePage.tsx`

Move `TestimonialsSection` to be the last section before the footer (after FAQ/Contact or whichever is currently last). The section queries the `testimonials` table for all approved reviews with `rating >= 4`, ordered by `created_at` descending.

### 5. Update Query in `TestimonialsSection.tsx`

Change from fetching 1 testimonial to fetching all approved testimonials with rating >= 4. Remove the "hide if empty" behavior — show the section always (but with a graceful empty state if no reviews yet).

---

## Files

| File | Action |
|---|---|
| `supabase/functions/sync-meetup-reviews/index.ts` | **Create** — Firecrawl-based scraper for Meetup feedback page |
| `src/components/home/TestimonialsSection.tsx` | **Rewrite** — Split layout with avatar cluster, paginated card grid |
| `src/pages/HomePage.tsx` | **Edit** — Move TestimonialsSection to last position (above footer) |

