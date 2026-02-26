

## Plan: 5 Fixes — Event Cards, Section Order, Circle Sizing, Review Grid, Footer Dropdowns

---

### 1. Event Cards — Match Reference Screenshot (Desktop)

**File:** `src/components/home/EventSection.tsx`

The reference screenshot shows a card-based layout where the image sits on top and the event details (title, date+time, venue+city, attendees, "View Details" gold link) sit below in a card body — not overlaid on the image.

**Changes:**
- Redesign `EventCard` to use a **stacked layout**: image on top (aspect ~16/10, `object-cover object-top`, rounded top corners), then a card body below with `bg-card border border-border rounded-2xl`.
- Card body content order: title (font-display, ~text-lg), then date+time row (Calendar icon + formatted date + time), then venue+city row (MapPin icon), then attendees row (Users icon + "X attending"), then a gold "View Details →" text link at the bottom.
- Remove the gradient overlay and absolute-positioned text from the current implementation.
- Keep mobile horizontal scroll behavior unchanged — same `snap-x overflow-x-auto` container, just the card design changes to the stacked layout.
- Aspect ratio changes from `2/3` (portrait) to a vertical card with image ~16/10 and body padding below.

### 2. Move Ethos Section After Events on Mobile Only

**File:** `src/pages/HomePage.tsx`

Currently the order is: Hero → Ethos → Clubs → Events. On mobile, the user wants Events to appear before Ethos.

**Changes:**
- Use CSS `order` classes to reorder on mobile only.
- Wrap each section in a div with order classes:
  - Hero: `order-1`
  - Ethos: `order-3 md:order-2` (pushed down on mobile)
  - ClubShowcase: `order-2 md:order-3` (stays same position relative to events)
  - Events: `order-2 md:order-4` — actually, the user wants Events right after Hero on mobile.
  
  Simpler approach: On mobile, Ethos gets `order-4` and Events gets `order-2`:
  - Hero: `order-1`
  - Ethos: `order-4 md:order-2`
  - Clubs: `order-3 md:order-3`
  - Events: `order-2 md:order-4`
  
  This puts mobile order as: Hero → Events → Clubs → Ethos → Gallery → ...
  
  Wait, re-reading: "move our ethos section after events section on mobile only." Current order: Hero, Ethos, Clubs, Events. They want: Hero, Clubs, Events, Ethos on mobile. Or simply Hero, Events, Ethos on mobile?

  Most likely they want: Hero → Events → Ethos on mobile (events before ethos). The simplest read: swap Ethos and Events on mobile.

  Current desktop order should stay: Hero → Ethos → Clubs → Events.
  Mobile order wanted: Hero → Clubs → Events → Ethos (or Hero → Events → Ethos → Clubs).

  Given "move ethos after events" — mobile order: Hero → Clubs → Events → Ethos → rest.

  Using flexbox order:
  - Hero: `order-1`
  - Ethos wrapper: `order-4 md:order-2`
  - Clubs wrapper: `order-2 md:order-3`
  - Events wrapper: `order-3 md:order-4`
  - Rest stays sequential with higher order values.

  The parent `<main>` already has `flex flex-col`, so order classes will work.

### 3. Reduce Founders & Gentlemen Card Height on Desktop

**File:** `src/components/home/ClubShowcaseSection.tsx`

Currently the first two cards (Founders, Gentlemen) span `col-span-3` each in a 6-column grid and use `aspect-ratio: 3/4`. At `col-span-3` on a wide screen, 3/4 makes them very tall.

**Change:** Override the aspect ratio for the first two cards on desktop to something shorter like `4/5` or `2/3` — or better, apply a `max-h-[480px]` on desktop. Simplest fix: change `style={{ aspectRatio: '3/4' }}` to use a shorter ratio for desktop cards. Since mobile uses horizontal scroll with its own sizing, this only affects desktop.

- Add a prop or conditional: for `col-span-3` cards, use `aspect-[3/4] md:aspect-[4/5]` or just reduce to `aspect-[2/3]` via className instead of inline style.

### 4. Testimonials — 2x2 Grid (4 Cards) on Mobile

**File:** `src/components/home/TestimonialsSection.tsx`

Currently uses `grid-cols-1 sm:grid-cols-2` — on small mobile it shows 1 column. The user wants 2 columns on mobile too, showing 4 cards (2 rows × 2 cols) on the first screen.

**Change:** Update grid to `grid-cols-2` (always 2 columns). Reduce padding/text sizes on mobile to fit 2 cards side by side on small screens. The cards need to be compact enough: smaller font, less padding, shorter `line-clamp`.

### 5. Footer — Collapsible Dropdowns on Mobile

**File:** `src/components/layout/Footer.tsx`

Currently shows all 4 link sections in a 2x2 grid on mobile. The user wants:
- Logo centered + tagline centered + visible on mobile
- The 4 link sections collapsed into accordion/dropdown items (tap title to expand)
- Desktop stays the same

**Changes:**
- Import `Collapsible, CollapsibleTrigger, CollapsibleContent` from Radix (already installed: `@radix-ui/react-collapsible`)
- On mobile (`md:hidden`): center the logo and tagline, then render each footer section as a collapsible with the title as trigger and links as content
- On desktop (`hidden md:grid`): keep current 4-column grid layout
- Add a ChevronDown icon that rotates on open

---

### Technical Summary

| # | File | Change |
|---|------|--------|
| 1 | `EventSection.tsx` | Redesign EventCard to stacked layout (image top, details below in card body) with "View Details →" gold link |
| 2 | `HomePage.tsx` | Add CSS `order` classes to swap Ethos below Events on mobile |
| 3 | `ClubShowcaseSection.tsx` | Reduce aspect ratio of first 2 desktop cards from 3/4 to ~2/3 |
| 4 | `TestimonialsSection.tsx` | Change mobile grid from 1-col to 2-col, compact card styling |
| 5 | `Footer.tsx` | Mobile: center logo/tagline, convert link sections to collapsible dropdowns; desktop unchanged |

