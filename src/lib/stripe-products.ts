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
    description: 'Start your journey',
    price: 0,
    features: [
      'Browse all events',
      'Purchase event tickets',
      'Create a Connection Profile',
      'AI-assisted curated introductions',
      '$10 per connection reveal',
      'Free access to Les Amis French circle',
    ],
    limitations: [
      'No event discounts',
      'No members-only events',
      'No Connected Circle access',
    ],
  },
  member: {
    name: 'Member',
    description: 'For intentional connectors',
    monthlyPrice: 59,
    annualPrice: 499,
    annualSavings: '30%',
    features: [
      'Unlimited connection reveals',
      '20% off paid events',
      'Complimentary members-only gatherings',
      'Connected Circle access',
      'Les Amis + apply to The Gentlemen (approval required)',
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
      '30% off paid events',
      'Bring one guest to all events',
      'List your business in the Circle',
      'Priority consideration for The Gentlemen',
      'Invitation-only Circle experiences',
      'Featured in the community newsletter',
      'Priority introductions',
    ],
    trialDays: 7,
    exclusivityNote: 'Fellow membership is limited and subject to availability.',
  },
} as const;
