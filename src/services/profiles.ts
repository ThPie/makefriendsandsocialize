/**
 * Profile service — centralized Supabase queries for user profiles.
 * Replaces direct `.from('profiles')` calls scattered across 22+ files.
 */
import { supabase } from '@/integrations/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    avatar_urls: string[] | null;
    interests: string[] | null;
    industry: string | null;
    job_title: string | null;
    city: string | null;
    country: string | null;
    is_visible: boolean | null;
    onboarding_completed: boolean | null;
    referral_code: string | null;
    signature_style: string | null;
    favorite_brands: string[] | null;
    values_in_partner: string | null;
    terms_accepted_at: string | null;
    created_at: string;
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get the current user's profile. Returns null if not found.
 */
export async function getMyProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
}

/**
 * Get a specific profile field set (faster than full select).
 */
export async function getProfileFields<T extends keyof Profile>(
    userId: string,
    fields: T[],
) {
    const { data, error } = await supabase
        .from('profiles')
        .select(fields.join(','))
        .eq('id', userId)
        .maybeSingle();

    if (error) throw error;
    return data as Pick<Profile, T> | null;
}

/**
 * Update a profile. Accepts partial fields.
 */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}

/**
 * Check if onboarding is completed.
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
    const profile = await getProfileFields(userId, ['onboarding_completed']);
    return profile?.onboarding_completed ?? false;
}

/**
 * Lookup referrer by referral code.
 */
export async function lookupReferrer(referralCode: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('referral_code', referralCode)
        .single();

    if (error) return null;
    return data?.first_name ?? null;
}
