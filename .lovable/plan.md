

# Fix Build Error + Visual Refinements

## 1. Build Error Fix

**`src/components/home/TestimonialsSection.tsx`** — Line 31 has `TS2589: Type instantiation is excessively deep`. This is caused by the `.from('testimonials').select('*')` call where the Supabase type system recurses too deeply. Fix by explicitly typing the query result or using `.returns<Testimonial[]>()`.

## 2. Hero Section — Soho House Style (Screenshot 1)

The user wants the hero to look like the Soho House screenshot: full-bleed background image with text positioned at the **bottom-left**, much smaller and cleaner. Key changes to `Hero.tsx`:

- Remove the split-layout concept — go back to full-bleed image with overlay
- Headline much smaller: ~36px mobile / 48px desktop (like "New bedroom arrivals" in the screenshot)
- Single line headline in Cormorant Italic, not two massive lines
- Subheadline: 15px Inter 300, 2-3 lines max
- Small white pill CTA button ("Apply now" style, like "Shop now")
- Remove the member avatars row and matchmaking button — keep it minimal
- Content anchored bottom-left with generous padding
- Dark gradient overlay from bottom-left corner only

## 3. Events Section — 3-Card Grid (Screenshot 2)

The user's screenshot shows the events displayed as 3 equal cards in a row (not the editorial split panel). Each card has:

- Image on top (~50% height)
- Title in Cormorant below
- Date + time with calendar icon
- Location with map pin icon
- Attendee count with users icon
- "View Details →" gold text link at bottom
- Cards have `--surface` background with `--border` borders
- Centered "View All Events →" gold link below

Changes to `EventSection.tsx`: Replace the editorial panel layout with a simple 3-column card grid.

## 4. Section Color Differentiation (Screenshot 3)

The user wants alternating section backgrounds — some sections use a slightly different shade to create visual separation. Looking at the screenshot, the events section uses the base `--background` while the next section uses a slightly lighter/different surface tone. This creates visual rhythm.

Changes:
- Alternate sections between `bg-background` and `bg-card` (which maps to `--surface`)
- This creates the subtle color banding visible in the screenshot
- Apply to `HomePage.tsx` by wrapping sections or updating individual section backgrounds

## 5. Responsiveness — Content Container Width (Screenshot 4)

The user sees excessive side spacing on different screen sizes. The current `content-container` uses `max-w-[1600px]` with generous padding. This creates too much whitespace on mid-sized screens.

Fix in `src/index.css`:
- Change `content-container` from `max-w-[1600px]` to `max-w-[1400px]` 
- Reduce padding: `px-6 md:px-8 lg:px-16` instead of `px-6 md:px-12 lg:px-24`
- This ensures content fills more of the viewport on all screen sizes

## 6. Font Consistency

The CSS currently references `Playfair Display` for `.font-display` headings (line 239) but the design system specifies `Cormorant Garamond`. Fix this in `index.css` to use `'Cormorant Garamond'` instead of `'Playfair Display'`.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/home/TestimonialsSection.tsx` | Fix TS2589 build error with `.returns<>()` |
| `src/components/home/Hero.tsx` | Soho House style: smaller text, bottom-left, full-bleed image, minimal CTA |
| `src/components/home/EventSection.tsx` | 3-card grid layout with image/title/date/location/attendees |
| `src/index.css` | Fix `.font-display` to Cormorant Garamond; update `content-container` max-width and padding |
| `src/components/home/EthosSection.tsx` | Add `bg-card` for alternating section color |
| `src/components/home/PhotoGallerySection.tsx` | Replace hardcoded `bg-[#050B08]` with `bg-card` token |
| `src/components/home/ClubShowcaseSection.tsx` | Minor: reduce `duration-700` transitions, ensure responsive |
| `src/pages/HomePage.tsx` | No structural changes needed (section ordering stays) |

