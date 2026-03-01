import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { SubmitReview } from '@/components/portal/SubmitReview';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { FeatureUnlockCard } from '@/components/portal/FeatureUnlockCard';
import { OnboardingWizard } from '@/components/portal/OnboardingWizard';
import { BadgeUnlockModal } from '@/components/portal/BadgeUnlockModal';
import { UpgradePromptCard } from '@/components/portal/UpgradePromptCard';
import { EmailVerificationBanner } from '@/components/portal/EmailVerificationBanner';
import { WidgetErrorBoundary } from '@/components/ui/widget-error-boundary';
import { RelationshipHealthSection } from '@/components/portal/RelationshipHealthSection';
import { DashboardStats } from '@/components/portal/dashboard/DashboardStats';
import { UpcomingSchedule } from '@/components/portal/dashboard/UpcomingSchedule';
import { QuickActions } from '@/components/portal/dashboard/QuickActions';
import { BadgeDisplay } from '@/components/portal/BadgeDisplay';
import { format } from 'date-fns';

export default function PortalDashboard() {
  const { user, profile, refreshProfile, canAccessMatchmaking } = useAuth();
  const { subscription } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<{ badge_type: string; earned_at: string }[]>([]);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string; description: string; features?: string[] } | null>(null);

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

  useEffect(() => {
    if (user) {
      supabase
        .from('member_badges')
        .select('badge_type, earned_at')
        .eq('user_id', user.id)
        .then(({ data }) => { if (data) setEarnedBadges(data); });
    }
  }, [user]);

  useEffect(() => {
    if (profile && !profile.onboarding_completed && completionPercentage < 50) {
      setShowOnboarding(true);
    }
  }, [profile, completionPercentage]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await refreshProfile();
  };

  const today = format(new Date(), 'EEEE, MMMM do yyyy');

  return (
    <div className="space-y-6">
      <EmailVerificationBanner />

      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

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

      {/* Welcome header — left-aligned, clean */}
      <div>
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-foreground">
          Welcome back, <span className="text-[hsl(var(--accent-gold))]">{profile?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Upgrade Banner */}
      {(!subscription?.subscribed || subscription?.tier === 'patron') && !subscription?.is_trialing && (
        <UpgradePromptCard variant="compact" context="general" />
      )}

      {/* Stats Row */}
      <WidgetErrorBoundary title="Dashboard Stats">
        <DashboardStats />
      </WidgetErrorBoundary>

      {/* Two-column layout: Schedule + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <WidgetErrorBoundary title="Upcoming Schedule">
            <UpcomingSchedule />
          </WidgetErrorBoundary>
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </div>

      {/* Profile Completion */}
      {profile && completionPercentage < 100 && (
        <div className="grid gap-6 md:grid-cols-2">
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

      {/* Relationship Health */}
      {canAccessMatchmaking && user && (
        <RelationshipHealthSection userId={user.id} />
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Your Achievements</h3>
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
