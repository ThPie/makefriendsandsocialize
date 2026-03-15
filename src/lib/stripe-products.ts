// Stripe product and price mapping for the membership system
// This file contains all the Stripe IDs for products and prices
// Updated: January 2026 - Elevated tier naming & expanded benefits

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
// Database: patron = Socialite (free), fellow = Insider ($49), founder = Patron ($79)
export const TIER_MAPPING = {
  UI_TO_DB: {
    socialite: 'patron',
    insider: 'fellow',
    patron: 'founder',
  },
  DB_TO_UI: {
    patron: 'socialite',
    fellow: 'insider',
    founder: 'patron',
  },
} as const;

export type UITier = 'socialite' | 'insider' | 'patron';
export type DBTier = 'patron' | 'fellow' | 'founder';

export const TIER_BENEFITS = {
  socialite: {
    name: 'Socialite',
    description: 'Your gateway to the Circle',
    price: 0,
    features: [
      'Browse all public events',
      'Purchase event tickets at standard pricing',
      'Create a Connection Profile',
      'Hand-picked introductions by our team',
      '$30 per connection reveal (includes concierge support)',
      'Access to Les Amis French circle',
      'Community newsletter',
    ],
    missingFeatures: [
      'Unlimited connection reveals',
      'Slow Dating / matchmaking access',
      'Invitation-only member gatherings',
      'Discounts at partner businesses & Club members',
      'Event discounts (up to 30% off)',
      'Bring a guest to all events',
      'List your business & receive leads',
      'Priority introductions',
    ],
    limitations: [],
  },
  insider: {
    name: 'Insider',
    description: 'For those who seek more',
    monthlyPrice: 49,
    annualPrice: 470,
    annualSavings: '20%',
    features: [
      'Unlimited connection reveals',
      'Slow Dating access — matchmaking & curated dating events',
      '20% off all paid events',
      'Invitation-only member gatherings',
      'Discounts at partner businesses & Club members',
      'Connected Circle access — browse verified local businesses',
      'Les Amis + apply to The Gentlemen (approval required)',
      'Insider badge on your profile',
      'Concierge support',
    ],
    missingFeatures: [
      '30% off events (vs 20%)',
      'Bring a guest to all events free',
      'List your business & receive qualified leads',
      'Priority introductions — first access to new matches',
      'Featured in community newsletter',
      'Invitation-only Patron experiences',
    ],
    highlight: true,
    trialDays: 30,
  },
  patron: {
    name: 'Patron',
    description: 'The ultimate experience',
    monthlyPrice: 79,
    annualPrice: 758,
    annualSavings: '20%',
    features: [
      'Everything in Insider',
      '30% off all paid events',
      '+1 guest privileges — bring one guest to all events, free',
      'List your business in the Circle Directory & receive qualified leads',
      'Priority introductions — first access to new member matches',
      'Invitation-only Patron experiences — exclusive dinners, retreats & trips',
      'Featured in community newsletter — showcase your story or business',
      'Concierge support — dedicated assistance for events & reservations',
      'Early access to new features and premium events',
    ],
    missingFeatures: [],
    trialDays: 30,
    exclusivityNote: 'Patron membership is limited and subject to availability.',
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
