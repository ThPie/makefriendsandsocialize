
# Multi-Page Fixes and Enhancements Plan

## Overview
This plan addresses 9 distinct areas of improvement across multiple pages including Contact, Membership, Circles, Founders, Journal, Events, and Homepage. The changes span UI fixes, content updates, feature additions, and a Stripe product update.

---

## 1. Contact Page Enhancements

### 1.1 Common Questions - Add Collapsible Dropdowns
**File:** `src/pages/ContactPage.tsx`

Currently, FAQs are displayed as static cards. Will convert to collapsible Accordion dropdowns matching the site's design system.

**Changes:**
- Import `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` from `@/components/ui/accordion`
- Replace the static FAQ cards with Accordion components
- Maintain the existing icon + question + answer structure

### 1.2 Add Optional Phone Number Field
**File:** `src/pages/ContactPage.tsx`

Add a phone number input field to the contact form, marked as optional.

**Changes:**
- Add phone input between email and inquiry type
- Use `type="tel"` for proper mobile keyboard
- Mark as "(Optional)" in label
- No validation requirement

### 1.3 Social Media Icons - Match Footer
**File:** `src/pages/ContactPage.tsx`

Currently only has Facebook and Instagram. The footer has: TikTok, Facebook, Instagram, LinkedIn.

**Changes:**
- Add TikTok icon (copy from Footer.tsx)
- Add LinkedIn icon (copy from Footer.tsx)
- Update links to match footer URLs
- Match the styling with footer icons (currently using different hover effects)

---

## 2. Membership Page Enhancements

### 2.1 Pricing Cards with Collapsible Details
**File:** `src/pages/MembershipPage.tsx`

Make pricing cards more compact with expandable details.

**Changes:**
- Shorten card descriptions
- Show only first 4 features by default
- Add "See more" / "See less" toggle button (matching homepage PricingSection pattern)
- Add state management for expanded tiers

### 2.2 Remove Hero Section Blur Effect
**File:** `src/pages/MembershipPage.tsx`

Remove the floating blur elements in the hero section background.

**Changes:**
- Remove the `motion.div` elements with blur effects (lines 197-208)
- Keep the background image and gradient overlay

### 2.3 Update Free Trial to 30 Days
**File:** `src/lib/stripe-products.ts`
**Stripe Update Required:** Yes

Currently shows 7-day trial. Update to 30 days.

**Changes:**
- Update `TIER_BENEFITS.insider.trialDays` from 7 to 30
- Update `TIER_BENEFITS.patron.trialDays` from 7 to 30
- Update all UI text referencing "7-day" to "30-day"
- **Note:** Stripe trial period must be updated manually in Stripe Dashboard or via API call

### 2.4 Ensure Consistency with Homepage Pricing
**Files:** `src/pages/MembershipPage.tsx`, `src/components/home/PricingSection.tsx`

Verify both sections show identical pricing and benefits.

---

## 3. Les Amis Page Fixes

### 3.1 Remove "Back to Circles" Button
**File:** `src/pages/circles/LesAmisPage.tsx`

Remove the back navigation link in the hero section.

**Changes:**
- Remove lines 174-180 containing the `<Link to="/circles">` element

### 3.2 Generate Realistic Hero Image with AI
**File:** `src/pages/circles/LesAmisPage.tsx`

Current image is `les-amis-hero.jpg`. Generate a high-quality, realistic image of a French cafe social gathering.

**Changes:**
- Use `google/gemini-3-pro-image-preview` (best quality model) to generate a realistic image
- Save to `src/assets/les-amis-hero-new.webp`
- Update the import to use the new image

---

## 4. Fix Dropdown Colors (Blue Issue)

### 4.1 Fix Native Select Styling
**Files:** Multiple pages using `<select>` elements

The screenshot shows native `<select>` elements with blue highlight. This is browser default behavior.

**Affected Pages:**
- `src/pages/circles/LesAmisPage.tsx` (frenchLevel, membershipTier selects)
- `src/pages/circles/TheGentlemenPage.tsx` (stylePreference, membershipTier selects)
- `src/pages/ContactPage.tsx` (inquiry-type select)
- `src/pages/EventsPage.tsx` (sort select)

**Solution:**
Replace native `<select>` elements with Radix UI `Select` component which uses the site's theme colors (gold accent).

**Changes per file:**
- Import Select components from `@/components/ui/select`
- Replace `<select>` with `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>`
- Maintain form data binding

---

## 5. The Gentlemen Page Fixes

### 5.1 Remove Hero Section Elements
**File:** `src/pages/circles/TheGentlemenPage.tsx`

Remove "Back to Circles" button and "Selective Circle" badge.

**Changes:**
- Remove lines 185-191 (Back to Circles link)
- Remove lines 193-201 (Selective Circle badge)

### 5.2 Generate Realistic Hero Image
**File:** `src/pages/circles/TheGentlemenPage.tsx`

Generate a high-quality, realistic image of a refined gentleman's lounge atmosphere.

**Changes:**
- Use `google/gemini-3-pro-image-preview` model
- Save to `src/assets/gentlemen-hero-new.webp`
- Update the import

---

## 6. Founders Circle Page Fixes

### 6.1 Remove "Founders Networking Reimagined" Badge
**File:** `src/pages/ConnectedCirclePage.tsx`

Remove the badge in the hero section.

**Changes:**
- Remove lines 173-181 containing the badge with "Founders Networking Reimagined"

### 6.2 Remove Hero Section Blur Effect
**File:** `src/pages/ConnectedCirclePage.tsx`

Remove the floating blur decorative element.

**Changes:**
- Remove lines 159-166 (motion.div with blur effect)

### 6.3 Remove Static Stats Section
**File:** `src/pages/ConnectedCirclePage.tsx`

Remove the fake stats (150+ Founder Companies, 50+ Industries, etc.) and prepare for dynamic data.

**Changes:**
- Remove the entire Stats Section (lines 251-274)
- Remove the AnimatedStat component and related state
- Later, when businesses are added, stats will be fetched dynamically from `business_profiles` table

### 6.4 Replace Hero Banner Image
**File:** `src/pages/ConnectedCirclePage.tsx`

Replace with the uploaded founders event image and add overlay.

**Changes:**
- Copy uploaded image to `src/assets/founders/founders-hero-new.webp`
- Update hero image import
- Adjust gradient overlay for better text readability: `from-black/70 via-black/50 to-background`

---

## 7. Journal Page Rename to Blog

### 7.1 Rename to "Blog"
**File:** `src/pages/JournalPage.tsx`

Change all references from "Journal" to "Blog".

**Changes:**
- Update page title from "The Journal" to "Blog"
- Remove "Insights & Stories" badge
- Update meta/SEO if applicable

### 7.2 Remove Fake Blog Posts
**File:** `src/data/blogArticles.ts`

Clear the sample articles to start fresh with real content.

**Changes:**
- Set `blogArticles` to empty array `[]`
- Keep the interface definitions and categories structure
- Update JournalPage to show an empty state message when no articles

---

## 8. Events Page - Dynamic Category Filtering

### 8.1 Auto-Categorize Events
**File:** `src/pages/EventsPage.tsx`

Implement smart category assignment based on event title/description.

**Changes:**
- Create a `categorizeEvent` function that analyzes event title/description
- Keywords mapping:
  - "Business": founder, entrepreneur, networking, business, professional, pitch, startup
  - "Social": mixer, happy hour, social, meetup, gathering, friends
  - "Dining": dinner, brunch, lunch, restaurant, tasting, wine
  - "Art & Culture": art, gallery, museum, culture, exhibition, theatre
  - "Sports": sports, fitness, golf, tennis, run, hike
  - "Music": music, concert, live, jazz, symphony

**Implementation:**
```typescript
const categorizeEvent = (event: Event): string => {
  const text = `${event.title} ${event.description || ''}`.toLowerCase();
  
  if (/founder|entrepreneur|networking|business|professional|pitch|startup/.test(text)) 
    return 'Networking';
  if (/dinner|brunch|lunch|restaurant|tasting|wine|culinary/.test(text)) 
    return 'Dining';
  // ... more categories
  
  return 'Social'; // default
};
```

- Apply categorization in `filteredAndSortedEvents` logic
- Maintain existing category filter UI

---

## 9. Homepage - Business Events Link Fix

### 9.1 Update "Explore Business Events" Link
**File:** `src/components/home/BusinessEventsSection.tsx`

Currently links to `/events`. Should link to `/events?category=business` or scroll to business category.

**Changes:**
- Update Link to: `/events?category=Networking` (since business events = networking)
- Or use hash: `/events#business`

**Also update EventsPage:**
- Read URL query params on mount
- Set `activeCategory` based on `?category=` param

---

## Technical Summary

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/ContactPage.tsx` | FAQ accordions, phone field, social icons |
| `src/pages/MembershipPage.tsx` | Collapsible cards, remove blur, 30-day trial text |
| `src/lib/stripe-products.ts` | Update trialDays to 30 |
| `src/pages/circles/LesAmisPage.tsx` | Remove back button, replace select with Radix, new hero image |
| `src/pages/circles/TheGentlemenPage.tsx` | Remove back button/badge, replace select, new hero image |
| `src/pages/ConnectedCirclePage.tsx` | Remove badge, blur, stats; new hero image with overlay |
| `src/pages/JournalPage.tsx` | Rename to Blog, remove subtitle |
| `src/data/blogArticles.ts` | Clear fake articles |
| `src/pages/EventsPage.tsx` | Smart category filtering, URL param support |
| `src/components/home/BusinessEventsSection.tsx` | Fix link to business category |
| `src/components/home/PricingSection.tsx` | Update to 30-day trial text |

### New Assets Required
| Asset | Source | Format |
|-------|--------|--------|
| Founders hero image | User upload (DSC photo) | WebP |
| Les Amis hero | AI Generation (gemini-3-pro-image-preview) | WebP |
| Gentlemen hero | AI Generation (gemini-3-pro-image-preview) | WebP |

### Stripe Update Required
- Update trial period from 7 days to 30 days for both Insider and Patron subscription products in Stripe Dashboard

---

## Implementation Order

1. **Fix Dropdown Colors** - Global UI fix affecting multiple pages
2. **Contact Page** - Accordions, phone field, social icons
3. **Membership Page** - Collapsible cards, remove blur, 30-day trial
4. **Les Amis Page** - Remove back button, generate new hero image
5. **The Gentlemen Page** - Remove elements, generate new hero image
6. **Founders Page** - Remove elements, add uploaded hero image with overlay
7. **Journal/Blog Page** - Rename, clear fake posts
8. **Events Page** - Smart categorization, URL params
9. **Homepage** - Fix business events link

---

## Notes for User

- **Stripe Trial Update:** The 30-day free trial change requires updating your Stripe subscription products. You can do this in Stripe Dashboard under Products > [Product] > Pricing > Edit > Trial period
- **AI Image Generation:** The Les Amis and Gentlemen hero images will be generated using Google's highest quality image model
- **Dynamic Business Stats:** The Founders page stats will be empty until real businesses are added via the portal. Future enhancement can query `business_profiles` table to show real counts
