

## Plan: Align Gentlemen Vision + Remove Circle-Specific Applications & Pricing

### 1. Redesign The Gentlemen Page to Match Ladies Society Vision
**File: `src/pages/circles/TheGentlemenPage.tsx`** — Full rewrite to mirror The Ladies Society structure:
- **Hero**: Replace the image-based hero with a centered text hero (like Ladies Society) with subtle animated background orbs, tagline badge, and "Apply Now" CTA
- **Mission Section**: Change from "presence and conversation" to empowerment-focused: "A private space for men who seek growth, accountability, and brotherhood — without ego or competition. Just men lifting each other higher."
- **Benefits Grid**: Replace the 4-item "expectations" with a 6-item benefits grid matching Ladies Society format (Monthly Gatherings, Growth Conversations, Networking, Wellness, Priority Access, Annual Dinner — adapted for men)
- **Remove**: Dress code commitment checkbox, style preference dropdown, membership tier selector, and all Gentlemen-specific pricing

### 2. Remove Circle-Specific Applications from All Circle Pages
Replace the full application forms on these pages with a simple CTA that directs users to the main membership application:
- **`TheGentlemenPage.tsx`**: Remove the application form section entirely. Replace with a "Join the Club" CTA that links to `/membership` or `/auth`
- **`TheLadiesSocietyPage.tsx`**: Remove the application form + pricing sections. Replace with a CTA
- **`ThePartnersPage.tsx`**: Remove the application form. Replace with a CTA
- **`LesAmisPage.tsx`**: Remove the application form. Replace with a CTA
- **`ThePursuitsPage.tsx`**: Remove the application form. Replace with a CTA

Each page will instead show a simple section: "Your membership gives you access to this circle. Not a member yet?" with a "Become Member" button linking to the membership page.

### 3. Remove Circle-Specific Pricing from Ladies Society
**File: `src/pages/circles/TheLadiesSocietyPage.tsx`**:
- Remove the entire "Membership Pricing" section (the $29/mo and $249/yr cards)
- Remove the `pricingAnimation` scroll animation ref
- Keep the Mission section, Benefits grid, and the new simplified CTA

### Files to modify:
- `src/pages/circles/TheGentlemenPage.tsx` — full vision rewrite + remove form
- `src/pages/circles/TheLadiesSocietyPage.tsx` — remove pricing section + remove form
- `src/pages/circles/ThePartnersPage.tsx` — remove form, add membership CTA
- `src/pages/circles/LesAmisPage.tsx` — remove form, add membership CTA
- `src/pages/circles/ThePursuitsPage.tsx` — remove form, add membership CTA

