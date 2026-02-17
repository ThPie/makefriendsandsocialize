/**
 * Centralized tier naming utilities.
 *
 * Canonical naming system:
 *   Database (source of truth) │ UI (user-facing)  │ Stripe product key
 *   ──────────────────────────────────────────────────────────────────
 *   patron                     │ Socialite          │ N/A (free)
 *   fellow                     │ Insider            │ MEMBER_*
 *   founder                    │ Patron             │ FELLOW_*
 *
 * All internal code should use the DB tier names: 'patron' | 'fellow' | 'founder'.
 * Use getTierDisplayName() whenever showing a tier name to the user.
 */

export type DBTier = 'patron' | 'fellow' | 'founder';

/** Maps DB tier → user-facing display name */
const TIER_DISPLAY_NAMES: Record<DBTier, string> = {
    patron: 'Socialite',
    fellow: 'Insider',
    founder: 'Patron',
};

/** Maps DB tier → Stripe checkout tier param (used by create-subscription-checkout) */
const TIER_STRIPE_CHECKOUT: Record<string, string> = {
    fellow: 'member',
    founder: 'fellow',
};

/**
 * Get the user-facing display name for a DB tier.
 * Returns the display name or a capitalised fallback for unknown tiers.
 *
 * @example getTierDisplayName('patron')  // "Socialite"
 * @example getTierDisplayName('fellow')  // "Insider"
 * @example getTierDisplayName('founder') // "Patron"
 */
export function getTierDisplayName(dbTier: string | null | undefined): string {
    if (!dbTier) return 'Socialite';
    return TIER_DISPLAY_NAMES[dbTier as DBTier] ?? dbTier.charAt(0).toUpperCase() + dbTier.slice(1);
}

/**
 * Check whether a DB tier is at least the given minimum level.
 * Tier order: patron (0) < fellow (1) < founder (2)
 */
export function isTierAtLeast(currentTier: string | null | undefined, minimumTier: DBTier): boolean {
    const order: Record<string, number> = { patron: 0, fellow: 1, founder: 2 };
    return (order[currentTier ?? 'patron'] ?? 0) >= (order[minimumTier] ?? 0);
}

/**
 * Convert a DB tier to the Stripe checkout tier parameter.
 * Only 'fellow' and 'founder' have paid Stripe tiers.
 */
export function toStripeCheckoutTier(dbTier: DBTier): 'member' | 'fellow' | null {
    return (TIER_STRIPE_CHECKOUT[dbTier] as 'member' | 'fellow') ?? null;
}
