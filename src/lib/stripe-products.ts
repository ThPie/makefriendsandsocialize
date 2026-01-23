// Stripe product and price mapping for the membership system
// This file contains all the Stripe IDs for products and prices
// Updated: January 2026 - Competitive pricing overhaul

export const STRIPE_PRODUCTS = {
  MEMBER_MONTHLY: {
    product_id: 'prod_TqU60tCgmumAue',
    price_id: 'price_1Ssn8f00I3YCY0DeeE6nnMri',
    price: 49,
    interval: 'month' as const,
  },
  MEMBER_ANNUAL: {
    product_id: 'prod_TqU7b2DETbd3iZ',
    price_id: 'price_1Ssn9f00I3YCY0DeLZZloqCJ',
    price: 399,
    interval: 'year' as const,
  },
  FELLOW_MONTHLY: {
    product_id: 'prod_TqU84lfZCDFCWG',
    price_id: 'price_1Ssn9u00I3YCY0DeF6IQ05fB',
    price: 79,
    interval: 'month' as const,
  },
  FELLOW_ANNUAL: {
    product_id: 'prod_TqU8huV2JTgzHV',
    price_id: 'price_1SsnAL00I3YCY0Def32T8PTg',
    price: 699,
    interval: 'year' as const,
  },
  SINGLE_REVEAL: {
    product_id: 'prod_TqU5DsuaEeLmKf',
    price_id: 'price_1Ssn7X00I3YCY0DeIiMAOwSF',
    price: 19,
  },
  PACK_3_REVEAL: {
    product_id: 'prod_TqU6reEEQMGRr4',
    price_id: 'price_1Ssn7v00I3YCY0DeELElTXPV',
    price: 49,
  },
  PACK_5_REVEAL: {
    product_id: 'prod_TqU6hiX76tBzic',
    price_id: 'price_1Ssn8F00I3YCY0DeCCUvX7ZX',
    price: 69,
  },
} as const;

// UI tier names mapped to database tier values
// Database: patron = Explorer (free), fellow = Member ($49), founder = Fellow ($79)
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
      '$19 per connection reveal',
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
    monthlyPrice: 49,
    annualPrice: 399,
    annualSavings: '32%',
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
    monthlyPrice: 79,
    annualPrice: 699,
    annualSavings: '27%',
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

// Reveal pack options for purchase UI
export const REVEAL_PACKS = {
  single: {
    name: 'Single Reveal',
    price: 19,
    reveals: 1,
    pricePerReveal: 19,
    description: 'Reveal this match only',
  },
  pack_3: {
    name: '3-Pack Reveals',
    price: 49,
    reveals: 3,
    pricePerReveal: 16.33,
    savings: '14%',
    description: '$16.33 per reveal • Valid 90 days',
  },
  pack_5: {
    name: '5-Pack Reveals',
    price: 69,
    reveals: 5,
    pricePerReveal: 13.80,
    savings: '27%',
    description: '$13.80 per reveal • Valid 90 days',
    bestValue: true,
  },
} as const;
