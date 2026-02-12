import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { SubmitReview } from '@/components/portal/SubmitReview';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { BadgeDisplay } from '@/components/portal/BadgeDisplay';
import { FeatureUnlockCard } from '@/components/portal/FeatureUnlockCard';
import { OnboardingWizard } from '@/components/portal/OnboardingWizard';
import { BadgeUnlockModal } from '@/components/portal/BadgeUnlockModal';
import { UpgradePromptCard } from '@/components/portal/UpgradePromptCard';
import { EmailVerificationBanner } from '@/components/portal/EmailVerificationBanner';
import { WidgetErrorBoundary } from '@/components/ui/widget-error-boundary';
import { RelationshipHealthSection } from '@/components/portal/RelationshipHealthSection';
import { DashboardStats } from '@/components/portal/dashboard/DashboardStats';
import { UpcomingSchedule } from '@/components/portal/dashboard/UpcomingSchedule';

export default function PortalDashboard() {
  const { user, profile, refreshProfile, canAccessMatchmaking } = useAuth();
  const { subscription } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<{ badge_type: string; earned_at: string }[]>([]);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string; description: string; features?: string[] } | null>(null);

  // Memoize completion calculation
  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.first_name) score += 15;
    if (profile.last_name) score += 15;
    if (profile.date_of_birth) score += 15;
    if (profile.avatar_urls?.length) score += 15;
    if (profile.bio) score += 10;
    if (profile.job_title) score += 10;
    if (profile.industry) score += 10;
    if (profile.interests?.length >= 2) score += 5;
    if (profile.city) score += 5;
    return score;
  }, [profile]);

  const isProfileComplete = completionPercentage === 100;

  // Fetch badges
  useEffect(() => {
    if (user) {
      supabase
        .from('member_badges')
        .select('badge_type, earned_at')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setEarnedBadges(data);
        });
    }
  }, [user]);

  // Show onboarding for new users
  useEffect(() => {
    if (profile && !profile.onboarding_completed && completionPercentage < 50) {
      setShowOnboarding(true);
    }
  }, [profile, completionPercentage]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await refreshProfile();
  };

  return (
    <div className="space-y-10">
      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Badge Unlock Modal */}
      {newBadge && (
        <BadgeUnlockModal
          isOpen={!!newBadge}
          onClose={() => setNewBadge(null)}
          badgeName={newBadge.name}
          badgeIcon={newBadge.icon}
          badgeDescription={newBadge.description}
          unlockedFeatures={newBadge.features}
        />
      )}

      {/* Welcome Header */}
      <div>
        <h1 className="font-display font-semibold text-3xl md:text-4xl text-foreground mb-2">
          Welcome back, {profile?.first_name || 'Member'}
        </h1>
        <p className="text-muted-foreground text-lg">
          Here is a curated look at what's happening in your social circle today.
        </p>
      </div>

      {/* Upgrade Banner for Free Users */}
      {(!subscription?.subscribed || subscription?.tier === 'explorer') && !subscription?.is_trialing && (
        <UpgradePromptCard variant="compact" context="general" />
      )}

      {/* Main Stats Row */}
      <WidgetErrorBoundary title="Dashboard Stats">
        <DashboardStats />
      </WidgetErrorBoundary>

      {/* Upcoming Schedule */}
      <WidgetErrorBoundary title="Upcoming Schedule">
        <UpcomingSchedule />
      </WidgetErrorBoundary>

      {/* Profile Completion & Feature Unlocks */}
      {profile && completionPercentage < 100 && (
        <div className="grid gap-8 md:grid-cols-2">
          <WidgetErrorBoundary title="Profile Progress">
            <ProfileCompletionIndicator profile={profile} />
          </WidgetErrorBoundary>

          <WidgetErrorBoundary title="Feature Status">
            <FeatureUnlockCard
              completionPercentage={completionPercentage}
              isProfileComplete={isProfileComplete}
            />
          </WidgetErrorBoundary>
        </div>
      )}

      {/* Relationship Health Section - Only for matchmaking users */}
      {canAccessMatchmaking && user && (
        <RelationshipHealthSection userId={user.id} />
      )}

      {/* Badges - Show if any owned */}
      {earnedBadges.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-xl font-semibold mb-4">Your Achievements</h3>
          <WidgetErrorBoundary title="Your Badges">
            <BadgeDisplay earnedBadges={earnedBadges} showAll={false} compact />
          </WidgetErrorBoundary>
        </div>
      )}

      {/* Submit Review */}
      <SubmitReview />
    </div>
  );
}
