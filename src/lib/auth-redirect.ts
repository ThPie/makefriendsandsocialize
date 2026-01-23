/**
 * Centralized authentication redirect logic
 * Determines where users should be redirected after authentication
 */

export type RedirectDestination = 
  | '/portal/onboarding'   // Profile incomplete
  | '/auth/waiting'        // Profile complete, application pending
  | '/portal'              // Approved member
  | '/admin';              // Admin user

interface AuthRedirectParams {
  isAdmin: boolean;
  applicationStatus: 'pending' | 'approved' | 'rejected' | null;
  membershipStatus: 'pending' | 'active' | 'cancelled' | 'expired' | null;
  onboardingCompleted: boolean | null;
  profileCompletionPercentage: number;
}

/**
 * Calculate profile completion percentage based on required fields
 */
export function calculateProfileCompletion(profile: {
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  avatar_urls?: string[] | null;
  interests?: string[] | null;
  industry?: string | null;
  job_title?: string | null;
  city?: string | null;
  country?: string | null;
  date_of_birth?: string | null;
  company?: string | null;
} | null): number {
  if (!profile) return 0;

  const requiredFields = [
    { field: profile.first_name, weight: 15 },
    { field: profile.last_name, weight: 15 },
    { field: profile.bio && profile.bio.length >= 50 ? profile.bio : null, weight: 15 },
    { field: profile.avatar_urls && profile.avatar_urls.length > 0 ? profile.avatar_urls : null, weight: 10 },
    { field: profile.interests && profile.interests.length >= 3 ? profile.interests : null, weight: 10 },
    { field: profile.industry, weight: 10 },
    { field: profile.job_title, weight: 10 },
    { field: profile.city, weight: 5 },
    { field: profile.country, weight: 5 },
    { field: profile.date_of_birth, weight: 5 },
  ];

  const totalWeight = requiredFields.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = requiredFields.reduce((sum, item) => {
    return sum + (item.field ? item.weight : 0);
  }, 0);

  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Determine the appropriate redirect destination for authenticated users
 */
export function getAuthRedirect(params: AuthRedirectParams): RedirectDestination {
  // Admin users always go to admin dashboard
  if (params.isAdmin) {
    return '/admin';
  }

  // Users who haven't completed onboarding go to onboarding
  if (!params.onboardingCompleted || params.profileCompletionPercentage < 80) {
    return '/portal/onboarding';
  }

  // Users with complete profiles but pending applications go to waiting page
  if (params.applicationStatus === 'pending' && params.membershipStatus !== 'active') {
    return '/auth/waiting';
  }

  // Approved/active members go to portal
  if (params.applicationStatus === 'approved' || params.membershipStatus === 'active') {
    return '/portal';
  }

  // Rejected users stay on waiting page (shows rejection message)
  if (params.applicationStatus === 'rejected') {
    return '/auth/waiting';
  }

  // Default fallback: send to onboarding
  return '/portal/onboarding';
}

/**
 * Check if a user can access protected portal features
 */
export function canAccessProtectedFeatures(params: {
  applicationStatus: 'pending' | 'approved' | 'rejected' | null;
  membershipStatus: 'pending' | 'active' | 'cancelled' | 'expired' | null;
}): boolean {
  return params.applicationStatus === 'approved' || params.membershipStatus === 'active';
}

/**
 * Get list of restricted routes for pending members
 */
export function getRestrictedRoutesForPending(): string[] {
  return [
    '/portal/network',
    '/portal/connections',
    '/portal/slow-dating',
  ];
}
