// Stripe product and price mapping for the membership system
// This file contains all the Stripe IDs for products and prices

export const STRIPE_PRODUCTS = {
  MEMBER_MONTHLY: {
    product_id: 'prod_TllHNmpI2mcUc2',
    price_id: 'price_1SoDkp00I3YCY0DeDrniU1d6',
    price: 59,
    interval: 'month' as const,
  },
  MEMBER_ANNUAL: {
    product_id: 'prod_TllHEULxPojYHI',
    price_id: 'price_1SoDl700I3YCY0DezLxSxVBL',
    price: 499,
    interval: 'year' as const,
  },
  FELLOW_MONTHLY: {
    product_id: 'prod_TllIG7YVUIoMZT',
    price_id: 'price_1SoDli00I3YCY0DeVOlNtHl7',
    price: 139,
    interval: 'month' as const,
  },
  FELLOW_ANNUAL: {
    product_id: 'prod_TllIZTrST3Zu37',
    price_id: 'price_1SoDlv00I3YCY0De33VrYzjX',
    price: 1199,
    interval: 'year' as const,
  },
  SINGLE_REVEAL: {
    product_id: 'prod_TllI9VgR5LCokX',
    price_id: 'price_1SoDmA00I3YCY0De2l1K4gAA',
    price: 10,
  },
  PACK_3_REVEAL: {
    product_id: 'prod_TllJ6UmnGAgyv3',
    price_id: 'price_1SoDmP00I3YCY0De8ZVDSdOu',
    price: 25,
  },
} as const;

// UI tier names mapped to database tier values
// Database: patron = Explorer (free), fellow = Member ($59), founder = Fellow ($139)
export const TIER_MAPPING = {
  UI_TO_DB: {
    explorer: 'patron',
    member: 'fellow',
    fellow: 'founder',
  },
  DB_TO_UI: {
    patron: 'explorer',
    fellow: 'member',
    founder: 'fellow',
  },
} as const;

export type UITier = 'explorer' | 'member' | 'fellow';
export type DBTier = 'patron' | 'fellow' | 'founder';

export const TIER_BENEFITS = {
  explorer: {
    name: 'Explorer',
    description: 'Free forever',
    price: 0,
    features: [
      'Browse all events',
      'Purchase event tickets',
      'Create dating profile',
      'Get matched by AI',
      'Pay-per-reveal matches ($10/each)',
    ],
    limitations: [
      'No event discounts',
      'No members-only events',
      'No Connected Circle access',
    ],
  },
  member: {
    name: 'Member',
    description: 'For serious connectors',
    monthlyPrice: 59,
    annualPrice: 499,
    annualSavings: '30%',
    features: [
      'Unlimited match reveals',
      '20% off all paid events',
      'Free Members-only events',
      'Connected Circle access',
      'Member badge',
      'Priority support',
    ],
    highlight: true,
    trialDays: 7,
  },
  fellow: {
    name: 'Fellow',
    description: 'The ultimate experience',
    monthlyPrice: 139,
    annualPrice: 1199,
    annualSavings: '28%',
    features: [
      'Everything in Member',
      '30% off all paid events',
      '+1 guest for ALL events',
      'List your business in Circle',
      'Featured in newsletter',
      'Priority matching',
      'Exclusive Fellow dinners',
      'Skip event waitlists',
    ],
    trialDays: 7,
  },
} as const;
