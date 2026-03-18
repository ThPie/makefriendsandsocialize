// Square product and pricing configuration for the membership system
// Replaces stripe-products.ts — all payments now go through Square

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
      '3 match reveals per month',
      'Access to all circles',
      'Slow Dating access — matchmaking & curated dating events',
      '20% off all paid events',
      'Invitation-only member gatherings',
      'Discounts at partner businesses & Club members',
      'Connected Circle access — browse verified local businesses',
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
    trialDays: 14,
  },
  patron: {
    name: 'Patron',
    description: 'The ultimate experience',
    monthlyPrice: 79,
    annualPrice: 758,
    annualSavings: '20%',
    features: [
      '4 match reveals per month',
      'Access to all circles',
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
    trialDays: 14,
    exclusivityNote: 'Patron membership is limited and subject to availability.',
  },
} as const;

// Single reveal for non-members (Socialite tier)
export const REVEAL_PURCHASE = {
  name: 'Connection Reveal',
  price: 30,
  description: 'Reveal this match\'s full profile (includes concierge support)',
} as const;
