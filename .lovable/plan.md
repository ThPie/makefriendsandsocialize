

# Complete Visual Redesign — Phase 2: Navigation, Landing Page, Auth, and All Sections

This plan covers the full implementation of the redesigned navigation, landing page sections, and auth page. Phase 1 (design tokens) is already complete. This phase transforms every visible component.

---

## Part A: Navigation Overhaul

### A1. `src/components/layout/Header.tsx` — Complete Rewrite

Current state: Hamburger menu with full-screen slide-out panel, daily quote, mega menu for Circles, framer-motion animations.

New design:
- Remove ALL hamburger menu code (button, slide-out panel, portal, AnimatePresence, backdrop)
- Remove daily quote fetch and display
- Remove mega menu for Circles
- Remove framer-motion import entirely
- Remove all circle hero images (foundersImg, gentlemenImg, womenImg, lesAmisImg)

New structure:
- Height: 68px desktop, 60px mobile
- Transparent on homepage load, frosted glass on scroll (`background: rgba(7,26,15,0.85)`, `backdrop-filter: blur(24px)`)
- Desktop: Logo far left, center nav links (Events, Circles, Membership) as plain text links in Inter 400 14px, right side: "Sign In" text link (no border, no button styling) + "Apply" gold pill button (999px radius, `--gold` background)
- Mobile: Logo left, single "Apply" gold pill button right. No hamburger. No nav links.
- If user is authenticated: show avatar instead of Sign In/Apply
- Remove ThemeToggle from header (move to portal sidebar only)

### A2. `src/components/layout/Footer.tsx` — Minimal Cleanup

Current state: Already has 4-column grid + accordion. Has AppStoreBadges.

Changes:
- Remove `AppStoreBadges` import and usage
- Section titles: apply `section-label` class (11px uppercase, 0.2em spacing, `--text-muted`)
- Keep logo at top, social icons at bottom
- Ensure background is `--bg` (no contrasting block)
- Social icons: set to `--text-muted`, hover to `--gold`

### A3. `src/components/layout/Layout.tsx` — Update Padding

- Change `pt-[81px]` to `pt-[68px]` to match new header height

### A4. `src/components/portal/PortalLayout.tsx` — Sidebar Redesign

Current state: Has sidebar with "Back to Website" link, profile section with bg-muted, standard active state highlighting.

Changes:
- Remove "Back to Website" link from sidebar header
- Sidebar width: 260px expanded, 72px collapsed (icon-only rail)
- Background: `--surface`, right border: `1px solid --border`
- Active nav item: replace `bg-primary/10` highlight with left gold bar (3px wide, `--gold` color, absolute positioned)
- Nav labels: 14px Inter 400, icons: 24px stroke `--text-secondary`, active: `--text-primary`
- Bottom of sidebar: member avatar (48px) + name + tier badge when expanded, just avatar when collapsed
- Admin section: add `-- ADMIN --` separator label (11px uppercase `--text-muted`) before admin link
- Top bar height: change from `h-20` to 64px (`h-16`)
- Mobile header: keep current pattern but update colors to tokens

### A5. `src/components/portal/PortalBottomNav.tsx` — Update to Spec

Current state: 4 tabs (Home, Events, Network, Profile), glassmorphic background.

Changes:
- 5 tabs: Home, Events, Circles, Connect, Profile (update icons accordingly)
- Height: 64px + safe area (`h-16`)
- Background: solid `--surface` (remove glassmorphic `bg-background/85` and `backdrop-blur-xl`)
- Top border: `1px solid --border` (remove `border-border/40`)
- Active icon: filled style, `--gold` color. Inactive: outline style, `--text-muted`
- Show label only under active tab, hide labels for inactive tabs

### A6. `src/components/layout/BottomNav.tsx` — Remove

This file duplicates PortalBottomNav. Remove it or make it a thin re-export. Check if it's imported anywhere first.

---

## Part B: Landing Page Redesign

### B1. `src/pages/HomePage.tsx`

- Change `bg-[#0a0f0a]` to `bg-background`
- Update section order per spec: Hero, Ethos, Collections, Events, SlowDating (How It Works), PhotoGallery (Moments), Pricing, Testimonials, FAQ, Contact
- Remove `BusinessEventsSection` from homepage (fold its concepts into Events or remove entirely)

### B2. `src/components/home/Hero.tsx` — Full Rewrite

Current state: Full-bleed video with gradient overlay, rounded bottom corners, bottom-left aligned content.

New layout — Split composition:
- Desktop: Left 55% is `--bg` colored text area, right 45% is full-bleed photo (hard vertical cut, no gradient blend)
- Use a static image instead of video for cleaner feel (or keep video on left with dark overlay)
- Left side content (vertically centered):
  - Eyebrow: "PRIVATE MEMBERSHIP" — `section-label` class
  - Headline line 1: "Meaningful" — 80px Cormorant Garamond Regular, `--text-primary`
  - Headline line 2: "Connection." — 80px Cormorant Garamond Italic, `--gold`
  - Sub: 18px Inter 300, `--text-secondary`, max-width 380px
  - CTA: Gold filled button "Apply for Membership" + secondary "Sign In" text link
  - Members row: stacked avatars + "1,000+ members" in 13px `--text-muted`
- Remove `rounded-b-[2.5rem]` and `shadow-2xl`
- Remove `variant="luxury"` button — use flat gold
- Mobile: photo becomes full-bleed background with dark gradient, content centered in bottom third

### B3. `src/components/home/EthosSection.tsx` — Numbered List Layout

Current state: 2x2/4-col grid of cards with icon circles, `premium-card` class, gradient background.

New layout — Horizontal numbered rows:
- Remove grid, card backgrounds, icon circles
- Remove `bg-gradient-to-b from-transparent to-[#0a0f0a]` background
- Each pillar is a full-width horizontal row:
  - Left: step number "01" in `mono-accent` class, `--gold` color
  - Center: title in 22px Cormorant + 14px Inter body below
  - Right: thin gold horizontal line (40px, `--gold`)
  - Each row separated by `1px solid --border`
- Section eyebrow: "OUR ETHOS" using `section-label` class above a Cormorant headline
- Mobile: vertical stacked list, same pattern

### B4. `src/components/home/ClubShowcaseSection.tsx` — Asymmetric Bento Grid

Current state: 3-col grid on desktop, horizontal scroll on mobile.

New layout — Editorial asymmetric bento:
- Desktop grid:
  - Row 1: 1 card spanning 7 cols + 1 card spanning 5 cols
  - Row 2: 1 card spanning 5 cols + 1 card spanning 7 cols
  - Row 3: 3 equal cards
- Each card: tall image, gradient overlay darkening bottom 50%, category badge top-left (11px uppercase pill, `--gold` border), title bottom-left in Cormorant Italic 28px white, descriptor 13px Inter 300
- Hover: `transform: scale(1.03)` on image inside card (overflow hidden), gold border appears (1px solid `--gold` at 60% opacity)
- Section eyebrow: "COLLECTIONS" using `section-label` class
- Mobile: single column vertical scroll
- Remove scroll arrows
- Update `duration-700` to `duration-200` on transitions

### B5. `src/components/home/EventSection.tsx` — Editorial Feature Panel

Current state: Grid of event cards with hardcoded dark colors.

New layout:
- Featured event: large editorial panel
  - Left 60%: event cover image in 16:9 container, 16px radius
  - Right 40%: eyebrow category, title in Cormorant 32px, venue + date in 14px Inter, description, "View Details" gold link, attendee avatar stack
- Below: horizontal scroll strip of smaller upcoming event chips (date block left, title + venue right, 80px height, `--surface` card)
- "View all events" right-aligned text link in `--gold` (not a button)
- Replace all hardcoded colors (`#141f17`, `#0a0f0a`, `#d4af37`) with token classes
- Section eyebrow: "CALENDAR" using `section-label`

### B6. `src/components/home/SlowDatingSection.tsx` — Horizontal Timeline

Current state: 2-column layout with steps timeline on right, image on left.

New layout for desktop:
- 3 large numbered steps in a row, connected by thin gold dashed line
- Each step: large Cormorant 96px number as background texture (20% opacity, `--gold`), title 20px Inter 300, description 14px `--text-secondary`
- Mobile: vertical numbered list with left-side gold timeline bar
- Remove the large image card — photography is secondary here
- Section eyebrow: "HOW IT WORKS" using `section-label`

### B7. `src/components/home/PhotoGallerySection.tsx` — Masonry Wall

Current state: Horizontal scroll gallery with auto-scroll on hover.

New layout:
- Full-bleed masonry photo wall: 4 columns desktop, 2 mobile, 4px gutter
- Remove auto-scroll behavior entirely
- On hover: dark vignette overlay + caption in Cormorant Italic white
- Section eyebrow: "MOMENTS FROM THE CIRCLE" using `section-label`
- Below: centered "Access Member Gallery" gold text link
- Remove the "Hover to scroll" hint text

### B8. `src/components/home/PricingSection.tsx` — Differentiated Height Cards

Current state: 3 equal-height cards, "Most Popular" badge, green toggle.

Changes:
- Cards have DIFFERENT heights: Insider is tallest, elevated 24px above others (using negative `margin-top` or `transform: translateY(-24px)`)
- Socialite: `--surface`, no special border
- Insider: `--surface-raised`, gold border (`1px solid --gold`), slightly wider, "MOST POPULAR" badge rotated -2deg in top-right
- Patron: `--surface`, gold-tinted subtle inner glow on border
- Monthly/Yearly toggle: single pill toggle, active state uses `--gold` (not green `bg-primary`)
- Price number: Cormorant 56px + "/mo" in 16px Inter inline
- Feature checkmarks: thin strokes in `--gold`, unavailable features in `--text-muted` with strikethrough
- Section eyebrow: "MEMBERSHIP" using `section-label`
- Remove mobile tab switcher (show all 3 cards stacked on mobile with Insider first)

### B9. `src/components/home/TestimonialsSection.tsx` — Single Spotlight

Current state: 3-col grid of testimonial cards with review submission form.

Changes:
- If no testimonials: hide section entirely (do not show "Be the first" empty state)
- When populated: single full-width testimonial spotlight
  - Large open-quote glyph in Cormorant, `--gold`, ~120px
  - Quote text in Cormorant Italic 28px, `--text-primary`, max 80 chars per line
  - Attribution: avatar (48px) + name + tier badge below quote
- Remove the "Leave a Review" form from the homepage section (move to portal only)
- Remove hardcoded colors (`#141f17`, `#d4af37`)

### B10. `src/components/home/FAQSection.tsx` — Minor Cleanup

- Replace centered heading with left-aligned section eyebrow "FAQ" using `section-label`
- Keep accordion layout (already clean)
- Remove grid 2-col layout, use single column max-width 720px

### B11. `src/components/home/ContactFormSection.tsx` — Minor Cleanup

- Already has split layout. Keep it.
- Replace hardcoded colors with token classes
- Ensure form inputs use token-based styling

### B12. `src/components/home/BusinessEventsSection.tsx` — Remove from Homepage

- Remove from `HomePage.tsx` lazy import and rendering
- Keep the component file for potential use on a dedicated business page

---

## Part C: Auth Page Redesign

### `src/pages/AuthPage.tsx` — Major Layout Rework

Current state: 1276-line file with multi-step signup, floating particles, member avatars.

Changes:
- Flip split layout: image LEFT 55%, form RIGHT 45% (currently opposite)
- Image panel: full-bleed luxury photo + centered Cormorant overlay text: "Where exceptional people find their circle." + member count card anchored bottom-left
- Form panel: `--surface-raised` background, 64px padding, centered form block
  - Small logo at top-left (32px height)
  - "Member Access" eyebrow (11px uppercase `--text-muted`)
  - "Welcome back." headline in Cormorant 40px
  - Google/Apple social buttons: side-by-side 50/50, outlined, icon + name
  - "or continue with email" divider in 12px `--text-muted`
  - Email/Phone: underline tabs only (no pill background)
  - Sign In button: full-width, `--gold` fill, 48px height
  - "Don't have an account? Apply" — "Apply" in `--gold`
- Remove `FloatingParticles` import and usage
- Remove `MemberAvatars` from form area (keep in image panel as social proof)
- Mobile: single full-screen form, no image panel, logo centered top
- Keep all auth logic intact (rate limiting, captcha, validation)

---

## Summary of Files

| File | Action | Scope |
|---|---|---|
| `src/components/layout/Header.tsx` | Rewrite | Remove hamburger, add minimal top bar |
| `src/components/layout/Footer.tsx` | Edit | Remove AppStoreBadges, update labels |
| `src/components/layout/Layout.tsx` | Edit | Update padding |
| `src/components/layout/BottomNav.tsx` | Remove/Redirect | Consolidate with PortalBottomNav |
| `src/components/portal/PortalLayout.tsx` | Edit | Sidebar gold bar, admin separator, sizing |
| `src/components/portal/PortalBottomNav.tsx` | Edit | 5 tabs, solid bg, active-only labels |
| `src/pages/HomePage.tsx` | Edit | Token bg, reorder sections, remove BusinessEvents |
| `src/components/home/Hero.tsx` | Rewrite | Split layout, remove video/rounded corners |
| `src/components/home/EthosSection.tsx` | Rewrite | Numbered horizontal rows |
| `src/components/home/ClubShowcaseSection.tsx` | Rewrite | Asymmetric bento grid |
| `src/components/home/EventSection.tsx` | Rewrite | Editorial feature panel |
| `src/components/home/SlowDatingSection.tsx` | Rewrite | Horizontal timeline steps |
| `src/components/home/PhotoGallerySection.tsx` | Rewrite | Masonry wall |
| `src/components/home/PricingSection.tsx` | Edit | Differentiated heights, gold toggle |
| `src/components/home/TestimonialsSection.tsx` | Rewrite | Single spotlight or hide |
| `src/components/home/FAQSection.tsx` | Edit | Left-aligned eyebrow, single column |
| `src/components/home/ContactFormSection.tsx` | Edit | Token colors |
| `src/components/home/BusinessEventsSection.tsx` | No change | Remove from homepage only |
| `src/pages/AuthPage.tsx` | Major edit | Flip layout, remove particles, minimal chrome |

---

## Implementation Order

Given the scope, implementation will proceed in this order within this phase:

1. Header (most visible, unlocks removal of hamburger)
2. Footer + Layout padding
3. Hero section
4. Ethos section
5. ClubShowcase (bento grid)
6. EventSection (editorial)
7. SlowDating (timeline)
8. PhotoGallery (masonry)
9. Pricing
10. Testimonials
11. FAQ + Contact + HomePage order
12. PortalLayout + PortalBottomNav
13. AuthPage

Each file will be implemented respecting existing business logic and only changing visual/layout concerns.

