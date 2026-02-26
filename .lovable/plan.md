

## Plan: Homepage Redesign — 8 Changes

### 1. Replace Hero Video
Copy the uploaded `hero-background-20mb.mp4` to `public/videos/hero-bg-new.mp4`, replacing the existing file. The Hero component already references this path, so no code change needed for the source.

### 2. Update Hero Content
In `src/components/home/Hero.tsx`:
- Remove the subheadline paragraph ("Curated connections and exclusive gatherings...")
- Change "Apply for Membership" button text to "Become Member"

### 3. Center Circles Section Header + Add Description
In `src/components/home/ClubShowcaseSection.tsx`:
- Center-align the "Curated Collections / Our Circles" header block (text-center, remove the flex justify-between layout that places arrows next to the title)
- Add a short description paragraph below the heading (e.g., "Discover our curated communities, each designed for a unique way to connect")
- Move desktop scroll arrows below or beside the carousel instead of next to the title

### 4. Increase Mobile Circle Card Size
In `src/components/home/ClubShowcaseSection.tsx`:
- Change mobile card width from `min-w-[220px] w-[220px]` to approximately `w-[85vw]` so the first card fills most of the screen with just a peek of the second card visible for scroll affordance

### 5. Add Mobile Hamburger Menu
Create a new component (or modify `Header.tsx`) to add a modern hamburger menu on mobile, inspired by the second screenshot (slide-out panel with menu items). The header currently has no mobile menu — just a logo, Apply button, and theme toggle. The new menu will:
- Show a hamburger icon (3-line) on mobile, hidden on desktop
- Open a full-screen or slide-in overlay with navigation links (Home, Events, Circles, Membership, Sign In)
- Use the existing color palette and typography
- Include the brand logo at top and a close button

### 6. Ethos Section — Add Title + Mobile Cards
In `src/components/home/EthosSection.tsx`:
- Add a section title above the pillars (e.g., eyebrow "Our Values" + heading "What We *Stand For*" with "Stand For" in gold italic)
- On mobile, replace the horizontal scroll with stacked cards (bordered, rounded, with padding) instead of the current inline scroll strips

### 7. Testimonials — Uniform Card Height on Mobile
In `src/components/home/TestimonialsSection.tsx`:
- Add a fixed height or `line-clamp` to the quote text on mobile so all cards are the same height
- Currently cards use `min-h-[200px]` but varying quote lengths make them uneven
- Apply `line-clamp-4` on mobile and ensure all cards share a consistent fixed height

### 8. Gold Styling for All Eyebrow Text + Second-Word Gold Pattern
Across all homepage sections, ensure:
- All eyebrow/section-label text uses `text-[hsl(var(--accent-gold))]` (most already do, will audit)
- Section headings follow the "second word in gold italic" pattern consistently:
  - Hero: Already fine (no two-word section title)
  - Circles: "Our *Circles*" ✓
  - Events: "Upcoming *Gatherings*" ✓
  - Gallery: "A Glimpse *Inside*" ✓
  - How It Works: "Three Simple *Steps*" → ensure "Steps" is gold
  - Pricing: "Invest in *Connection*" → ensure "Connection" is gold
  - Testimonials: "What Our Members *Say*" → ensure "Say" is gold
  - Ethos (new title): "What We *Stand For*" → gold

### Files to be modified:
- `public/videos/hero-bg-new.mp4` — replaced with uploaded video
- `src/components/home/Hero.tsx` — remove subheadline, rename CTA
- `src/components/home/ClubShowcaseSection.tsx` — center header, add description, bigger mobile cards
- `src/components/home/EthosSection.tsx` — add title, mobile cards layout
- `src/components/home/TestimonialsSection.tsx` — uniform card height
- `src/components/layout/Header.tsx` — add mobile hamburger menu
- `src/components/home/WhyChooseSection.tsx` — gold on "Steps"
- `src/components/home/PricingSection.tsx` — gold on "Connection"

