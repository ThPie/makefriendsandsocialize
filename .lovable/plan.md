

## Plan: Form Redesign, Terminology Updates, Navigation Changes, and Circle Links

### 1. Redesign Matchmaking Intake Form (Inspired by Reference Screenshot)
**File: `src/components/dating/intake/IntakeWizard.tsx`**
- Restructure to a **split-screen layout on desktop**: left panel (dark green/brand color) shows the step sidebar with progress, right panel shows the form content
- Left panel: brand logo at top, vertical step list with completed/active/pending states (checkmarks, dots, connecting lines), "Go back" and "Need help?" at bottom
- Right panel: step title, description, form fields, Back/Continue buttons at bottom
- Mobile: collapse left panel, show step title + dots + progress bar (similar to current mobile layout)

**File: `src/components/dating/intake/IntakeProgress.tsx`**
- Refactor into a **vertical sidebar progress** component for desktop (matching the reference's left panel style)
- Keep mobile dots/progress bar as-is

### 2. Replace "Intentional Connections" → "Slow Dating" (8 files)
- `src/components/home/ClubShowcaseSection.tsx` — title + description
- `src/components/layout/CirclesMegamenu.tsx` — menu item label
- `src/components/layout/Footer.tsx` — footer link label
- `src/components/portal/PortalLayout.tsx` — sidebar item title
- `src/components/portal/PortalBreadcrumb.tsx` — breadcrumb label
- `src/pages/portal/PortalSlowDating.tsx` — page headings
- `src/pages/SlowDatingLandingPage.tsx` — any remaining references
- `src/pages/HomePage.tsx` — SEO description

### 3. Replace "Curated" with Varied Alternatives (avoid repetition)
Across all files, replace each instance of "curated" with contextually appropriate alternatives:
- "handpicked", "tailored", "exclusive", "thoughtfully designed", "personally selected", "bespoke", "refined"
- No two adjacent sections should use the same word

### 4. Replace "Journal" → "Blog" (6 files)
- `src/components/layout/MobileMenu.tsx` — nav link label
- `src/components/layout/Footer.tsx` — footer link label  
- `src/pages/JournalPage.tsx` — page title/headings (display text only)
- `src/pages/JournalPostPage.tsx` — breadcrumb and back button text
- `src/types/index.ts` — type union values
- Routes stay at `/journal` to avoid breaking links

### 5. Replace "The Partners Circle" → "Couple's Circle" (4 files)
- `src/components/layout/CirclesMegamenu.tsx`
- `src/components/layout/Footer.tsx`
- `src/pages/circles/ThePartnersPage.tsx` — all page content references

### 6. Replace "The Pursuits Club" → "Active & Outdoor" (4 files)
- `src/components/layout/CirclesMegamenu.tsx`
- `src/components/layout/Footer.tsx`
- `src/pages/circles/ThePursuitsPage.tsx` — all page content references

### 7. Make Circle Cards Link to Their Pages
**File: `src/components/home/ClubShowcaseSection.tsx`**
- Update `clubs` array: change `link` for Ladies Society from `/circles` to `/circles/the-ladies-society`
- Change Business Circle link from `/circles` to an appropriate page or keep as-is

### 8. Remove "Explore" from Navbar, Add Events/Membership/Blog
**File: `src/components/layout/Header.tsx`**
- Remove the "Explore" gold pill button entirely
- Add desktop nav links: "Events" → `/events`, "Membership" → `/membership`, "Blog" → `/journal`

**File: `src/components/layout/MobileMenu.tsx`**
- Remove "Explore" from `navLinks` array
- Ensure Events, Membership, Blog are present (they already are minus Blog rename)

### Files to modify:
- `src/components/dating/intake/IntakeWizard.tsx` — split-screen form layout
- `src/components/dating/intake/IntakeProgress.tsx` — vertical sidebar progress
- `src/components/home/ClubShowcaseSection.tsx` — terminology + circle links
- `src/components/layout/Header.tsx` — remove Explore, add nav links
- `src/components/layout/MobileMenu.tsx` — remove Explore, rename Journal
- `src/components/layout/Footer.tsx` — all terminology updates
- `src/components/layout/CirclesMegamenu.tsx` — terminology updates
- `src/components/portal/PortalLayout.tsx` — Slow Dating rename
- `src/components/portal/PortalBreadcrumb.tsx` — Slow Dating rename
- `src/pages/portal/PortalSlowDating.tsx` — Slow Dating rename
- `src/pages/SlowDatingLandingPage.tsx` — terminology updates
- `src/pages/circles/ThePartnersPage.tsx` — Couple's Circle rename
- `src/pages/circles/ThePursuitsPage.tsx` — Active & Outdoor rename
- `src/pages/JournalPage.tsx` — Blog rename
- `src/pages/JournalPostPage.tsx` — Blog rename
- `src/pages/HomePage.tsx` — SEO text update
- `src/pages/MembershipPage.tsx` — curated replacement
- `src/pages/AboutPage.tsx` — curated replacement
- `src/types/index.ts` — type updates

