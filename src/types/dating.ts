/**
 * Shared dating/matchmaking type definitions.
 * Used by PortalSlowDating, PortalMatchDetail, MatchDecision, MatchChat, etc.
 */

export interface DatingProfile {
    id: string;
    user_id: string;
    display_name: string;
    age: number;
    gender: string;
    target_gender: string;
    age_range_min: number;
    age_range_max: number;
    location: string | null;
    occupation: string | null;
    bio: string | null;
    photos: string[];
    dating_status: string;
    social_verification_status: string | null;
    created_at: string;
    updated_at: string;
}

export interface DatingMatch {
    id: string;
    profile_a_id: string;
    profile_b_id: string;
    status: 'pending' | 'mutual_yes' | 'no_match' | 'expired';
    compatibility_score: number | null;
    compatibility_reasons: string[] | null;
    matched_at: string | null;
    created_at: string;
}

export interface MatchMessage {
    id: string;
    match_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export type DatingProfileStatus = 'active' | 'paused' | 'pending_review' | 'rejected';
export type MatchStatus = 'pending' | 'mutual_yes' | 'no_match' | 'expired';
