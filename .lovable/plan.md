

# Modernize All Emails — Unified Premium Design

## Current State

Your project has **two separate email systems** with inconsistent designs:

1. **Auth emails** (10 React Email templates — signup, recovery, magic-link, etc.)
   - Plain white background, logo at top, minimal styling
   - No header background image, no branded footer with logo
   - Look "basic" compared to the transactional emails

2. **Transactional emails** (19 Edge Functions using `buildBrandedEmail()`)
   - Richer: header background image, cream card (#F2F1EE), dark footer with white logo
   - But the layout is missing a heading inside the header, the header overlay is just a subheading label
   - Some functions use different Resend import patterns (mixed `esm.sh` and `npm:`)

3. **One outlier** — `welcome.tsx` uses completely different colors (#1a1a1a black buttons, generic fonts, wrong brand name "MakeFriends Social Club")

## The Plan

### Step 1: Redesign `buildBrandedEmail()` layout (the shared template for all 19 transactional emails)

Upgrade the HTML layout to a modern, premium design:
- **Header**: Background image with darker overlay, the heading text rendered large with Cormorant Garamond italic, subheading below it — both inside the header
- **Body**: Clean cream card with more generous spacing, refined typography
- **CTA button**: Pill-shaped with subtle shadow, gold gradient
- **Footer**: Keep the dark forest-green footer with white logo, add social icons placeholder, refine spacing
- **Mobile-responsive**: Add media query fallbacks for smaller screens

### Step 2: Redesign all 10 auth email templates to match

Rebuild each auth template (signup, recovery, magic-link, invite, email-change, reauthentication) to use the same visual language:
- Add the header background image section with overlay
- Match the cream card body, gold CTA buttons, dark footer with white logo
- Use Cormorant Garamond for headings, Inter for body — matching the transactional layout
- Fix `welcome.tsx` to use correct brand colors, name, and fonts

Also update: `event-confirmation.tsx`, `payment-failed.tsx`, `subscription-renewed.tsx`

### Step 3: Deploy updated auth-email-hook

Deploy the updated templates so auth emails start using the new design.

## What Changes

| Component | Before | After |
|-----------|--------|-------|
| Auth emails | Plain white, logo-only header | Header image + overlay, cream card, branded footer |
| Transactional layout | Heading not in header, basic overlay | Heading rendered in header with elegant typography |
| `welcome.tsx` | Wrong brand name, black buttons | Correct brand, gold buttons, matching design |
| All emails | Two different visual styles | One unified premium look |

## Files Modified
- `supabase/functions/_shared/email-layout.ts` — redesigned layout
- All 10 files in `supabase/functions/_shared/email-templates/` — redesigned auth templates
- Deploy `auth-email-hook` after changes

