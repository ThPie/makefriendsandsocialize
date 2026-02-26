

## Plan: Redesign Gallery Page to Match Reference

The reference screenshot shows a clean, minimal masonry gallery from piedigit.com with these characteristics:

- **No hero section** — no large background image, no "Photo Gallery" badge, no title/subtitle
- **No category filters or layout toggle** — just photos
- **2-column staggered masonry** with very tight gaps (2-3px)
- Photos fill the full width edge-to-edge (minimal side padding)
- Each photo has natural aspect ratios (some tall, some shorter) creating an organic Pinterest-style flow
- Dark background matching the site theme
- No text overlays on photos by default — clean, immersive

### Changes to `src/pages/GalleryPage.tsx`

1. **Remove the hero section entirely** (lines 130-180) — the large background image, "Photo Gallery" badge, title, and subtitle
2. **Remove the category filter bar and layout toggle** (lines 182-226) — no filter chips, no grid/masonry toggle
3. **Replace with a simple page header** — just the page title "Gallery" or "Our Moments" styled in the brand font with gold accent, consistent with other page headers
4. **Default to masonry-only layout** — remove the grid layout option entirely, remove `layoutMode` state
5. **Tighten the masonry grid**:
   - Use `columns-2 md:columns-3 lg:columns-4` with `gap-1` (4px gaps) instead of `gap-4`
   - Use `mb-1` instead of `mb-4` between items
   - Reduce side padding to `px-1 md:px-2`
6. **Remove hover overlays with titles** — keep photos clean without text overlays (the lightbox already shows captions when clicked)
7. **Keep**: infinite scroll, lightbox on click, loading skeletons
8. **Color alignment**: ensure background uses `bg-background`, rounded corners on photos reduced to `rounded-sm` or `rounded-none` for the tight-packed look

### Technical Details

- Remove imports: `LayoutGrid`, `Columns`, `Sparkles`, `Button`, `useScrollAnimation`
- Remove state: `layoutMode`, `activeCategory`, `heroAnimation`, `galleryAnimation`
- Simplify the query to always fetch all categories (no filter)
- Keep `useInfiniteQuery` and intersection observer for infinite scroll
- Reduce motion variants to subtle fade-in only (no scale/translate)

