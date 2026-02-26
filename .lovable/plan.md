

## Plan: Update Review Cards — Avatars, Layout, and New Review

### 1. Copy Avatar Images to Project

Copy the 7 uploaded photos to `public/images/reviewers/`:
- `IMG_5914.jpg` → `diane.jpg`
- `IMG_5915.jpg` → `martin.jpg`
- `IMG_5916.jpg` → `henriett.jpg`
- `IMG_5920.jpg` → `katherine.jpg`
- `IMG_5913.jpg` → `lisa.jpg`
- `IMG_5917.jpg` → `staci.jpg`
- `IMG_5918.jpg` → `mindy.jpg`

### 2. Database Updates

Update `image_url` for existing testimonials:
- Diane → `/images/reviewers/diane.jpg`
- Martin Irwin → `/images/reviewers/martin.jpg`
- Harriett Friedman → `/images/reviewers/henriett.jpg`
- Katherine → `/images/reviewers/katherine.jpg`
- Lisa Morelock → `/images/reviewers/lisa.jpg`
- Staci → `/images/reviewers/staci.jpg`

Insert Mindy's review (from the screenshot):
- name: "Mindy", quote: "The host is amazing! Great events, great souls!", rating: 3, source: "meetup", is_approved: true, image_url: `/images/reviewers/mindy.jpg`

### 3. Redesign Review Card Layout

**File:** `src/components/home/TestimonialsSection.tsx`

Current card layout (top to bottom): quote mark → review text → [avatar + name | stars]

New card layout (top to bottom):
- **Stars** at the top (gold, left-aligned)
- **Review text** in the middle
- **Avatar** (larger: `w-10 h-10` on mobile, `w-12 h-12` on desktop) + name below

Mobile-specific changes:
- Cards become **portrait-oriented**: taller with more vertical padding (`p-4`, `min-h-[200px]`)
- Remove `line-clamp-3` on mobile to show more text in the taller card
- Keep 2-column grid on mobile

Desktop stays compact as-is but with same reordering (stars top, avatar bottom).

### Technical Details

| Item | Detail |
|------|--------|
| Images | 7 files copied to `public/images/reviewers/` |
| DB | 6 UPDATE + 1 INSERT on `testimonials` table |
| Component | Reorder card internals: stars → quote → avatar+name |
| Mobile | Portrait cards with `aspect-[3/4]` or `min-h-[220px]`, larger avatars |

