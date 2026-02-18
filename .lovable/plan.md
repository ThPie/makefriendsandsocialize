

## Mobile-First UI/UX Overhaul

### Overview
Four major changes to make the app feel like a native mobile app: fix the auth page layout on mobile, restructure the Ethos cards into a 2x2 grid, fix the Curated Collections cards styling and add horizontal scroll, and apply broader mobile-native UX improvements.

---

### 1. Auth Page -- Remove Mobile Overlay, Match Desktop Layout

**Problem:** On mobile, the auth page (step 1) shows a video background with a dark overlay behind the form. On desktop, the left panel has a solid gradient background (no video). The user wants mobile to look the same as desktop.

**Changes in `src/pages/AuthPage.tsx`:**
- Remove the mobile-only video background block (lines 648-661: the `<div className="absolute inset-0 lg:hidden">` with video + overlay)
- Change the left-side form panel from `hidden lg:block` to always visible for the gradient background
- Make the gradient background (`from-[hsl(180,45%,8%)] via-[hsl(180,50%,12%)] to-[hsl(180,55%,15%)]`) show on all screen sizes (remove `hidden lg:block` from line 671)
- On mobile, the form takes full width (already `w-full lg:w-1/2`)
- The right-side video panel stays `hidden lg:flex` (desktop only) -- no change needed there
- Remove the mobile-only FloatingParticles block and keep just the desktop one visible on all screens

Result: On mobile, users see the same solid dark gradient background with the glassmorphism form card, identical to the desktop left panel.

---

### 2. Ethos Section -- 2x2 Grid on Mobile with Centered Icons

**Changes in `src/components/home/WhyChooseSection.tsx`:**
- Change the card grid from `grid-cols-1 sm:grid-cols-2` to `grid-cols-2` so the 4 cards always show in a 2x2 layout even on small screens
- Center-align card content: change `items-start` to `items-center text-center` on each card
- Center the icon container by adding `mx-auto` or wrapping appropriately
- Reduce padding slightly on mobile for tighter cards (e.g., `p-4 sm:p-6`)
- Keep description text centered

---

### 3. Curated Collections -- Less Rounded Cards + Horizontal Scroll on Mobile

**Changes in `src/components/home/ClubShowcaseSection.tsx`:**
- Change card border radius from `rounded-[2rem]` to `rounded-2xl` (matching other cards in the app which use `rounded-2xl`)
- On mobile, replace the vertical stacked grid with a horizontal scrollable row:
  - Change grid to `flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar md:grid md:grid-cols-3` on mobile
  - Each card gets `min-w-[280px] snap-center` on mobile, normal grid behavior on desktop
  - Remove the `md:col-span-*` / `md:row-span-*` classes from mobile (keep them for `md:` grid)
  - Set fixed height for mobile cards (e.g., `h-[300px] md:h-auto`)
- Add `scroll-padding` and smooth scrolling for native feel

---

### 4. General Mobile-Native UX Improvements

**Hero Section (`src/components/home/Hero.tsx`):**
- Make the hero CTA card stack vertically on very small screens: the pill with avatars + "Join X members" + Apply button should wrap gracefully
- Ensure text sizes are optimized for mobile readability

**Homepage (`src/pages/HomePage.tsx`):**
- Reduce vertical padding on mobile for sections (`py-12 md:py-24` instead of `py-16 md:py-24`) to make content feel tighter and more app-like

**Global Mobile Styles (`src/index.css`):**
- Add `.no-scrollbar` utility if not already present (for hiding scrollbars on horizontal scroll areas)
- Ensure section headings have mobile-optimized font sizes

**Header (`src/components/layout/Header.tsx`):**
- No structural changes needed, but ensure the hamburger menu panel feels snappy (already uses spring animation)

---

### Files Modified
- `src/pages/AuthPage.tsx` -- Remove mobile video overlay, show solid gradient on all screens
- `src/components/home/WhyChooseSection.tsx` -- 2x2 grid always, centered icons and text
- `src/components/home/ClubShowcaseSection.tsx` -- Less rounded cards, horizontal scroll on mobile
- `src/components/home/Hero.tsx` -- Better mobile CTA wrapping
- `src/index.css` -- Ensure no-scrollbar utility exists

