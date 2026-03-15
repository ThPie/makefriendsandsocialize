

## Plan: Update Membership Page Content & Pricing

### Changes Summary

**1. Remove "Value Highlights" section** (lines 278-301 in MembershipPage.tsx)
Remove the 3-card grid with "Slow Dating / Handpicked matchmaking", "Partner Perks / Exclusive discounts", and "Business Leads".

**2. Update trial from 30 days → 14 days** across both files:
- `stripe-products.ts`: Change `trialDays: 30` → `trialDays: 14` for both insider and patron
- `MembershipPage.tsx`: 
  - Hero eyebrow: "Start Your 14-Day Free Trial"
  - Process step 2: "Try Insider or Patron free for 14 days. Cancel anytime."
  - Section text: "Start with a 14-day free trial"

**3. Update annual pricing to reflect 20% off monthly**
- Insider: $49/mo × 12 × 0.8 = **$470/yr** (already correct)
- Patron: $79/mo × 12 × 0.8 = **$758/yr** (already correct)
- Annual savings badge in billing toggle: change "Save up to 32%" → "Save 20%"

**4. Patron CTA: "Start Free Trial" instead of "Join Waitlist"**
- In `getCtaLabel()` (line 135): change the fallback from `'Join Waitlist'` to `'Start Free Trial'`
- Update the Patron button handler (lines 500-505) to call `handleStartTrial` instead of `handleSubscribe`

**5. Update reveal/match features**
- `stripe-products.ts` Socialite features: Change `'$19 per connection reveal'` → `'$30 per connection reveal'`
- Insider features: Change `'Unlimited connection reveals'` → `'3 match reveals per month'`
- Patron features: Add `'5 match reveals per month'` (replace "Everything in Insider" line or add separately)

**6. Add "Access to all circles" to both paid tiers**
- Add `'Access to all circles'` to insider and patron features in `stripe-products.ts`

**7. Update `REVEAL_PACKS` pricing** in stripe-products.ts:
- Single reveal: $19 → $30

**8. Update PricingSection.tsx** (homepage pricing) — same content changes propagate automatically since it reads from `TIER_BENEFITS`

### Files to Edit
1. `src/lib/stripe-products.ts` — tier benefits, trial days, reveal pricing
2. `src/pages/MembershipPage.tsx` — remove value highlights section, update trial text, fix Patron CTA
3. `src/components/home/PricingSection.tsx` — update trial text reference if hardcoded

