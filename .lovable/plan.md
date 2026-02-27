

## Plan: Gallery Redesign, Circle Updates, and Matchmaking CTA

### 1. Redesign Photo Gallery on Desktop (Inspired by Reference)
In `src/components/home/PhotoGallerySection.tsx`:
- Replace the 2-column masonry grid on desktop with a **single horizontal strip** of tall portrait images (`aspect-[3/4]`) arranged edge-to-edge with **zero gap** (gap-0)
- Images fill the full viewport width, no container padding on desktop
- On hover over the left half of the strip, auto-scroll left; hover over right half, auto-scroll right (using `requestAnimationFrame` + mouse position detection)
- Keep mobile layout as-is (2-column masonry) or adapt to horizontal scroll
- Remove rounded corners on desktop for the seamless edge-to-edge look
- Keep lightbox on click

### 2. Replace Gentlemen and Les Amis Images
In `src/components/home/ClubShowcaseSection.tsx`:
- Replace `gentlemenImg` with a stock image URL of men in suits (from Unsplash)
- Replace `lesAmisImg` with a stock image URL of a French social gathering (from Unsplash)

### 3. Update Les Amis Description
In `src/components/home/ClubShowcaseSection.tsx`:
- Change description to something like: "A circle for French speakers in Utah. Since there aren't many of us here, we created this space to gather, share our culture, and build lasting friendships through curated Francophone events."

### 4. Dating Card CTA: "Apply MatchMaking" with Auth Redirect
In `src/components/home/ClubShowcaseSection.tsx`:
- Change the dating card button text from "Read more" to "Apply MatchMaking"
- Change the `Link` destination: if user is logged in, navigate to `/dating/apply`; if not, navigate to `/auth` with a redirect parameter back to `/dating/apply`
- This requires importing `useAuth` and using `useNavigate` instead of a plain `Link` for the dating card, or wrapping the button click handler with auth check logic

### Files to modify:
- `src/components/home/PhotoGallerySection.tsx` — full desktop redesign with auto-scroll on hover
- `src/components/home/ClubShowcaseSection.tsx` — replace images, update Les Amis description, dating CTA

