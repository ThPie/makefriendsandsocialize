import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';
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
import { DiscoverForYou } from '@/components/portal/dashboard/DiscoverForYou';
import { BadgeDisplay } from '@/components/portal/BadgeDisplay';
import { SwipeDismiss } from '@/components/ui/swipe-dismiss';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useIsMobile } from '@/hooks/use-mobile';
import { haptic } from '@/lib/haptics';
import { format } from 'date-fns';

export default function PortalDashboard() {
  const { user, profile, refreshProfile, canAccessMatchmaking } = useAuth();
  const { subscription } = useSubscription();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<{ badge_type: string; earned_at: string }[]>([]);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string; description: string; features?: string[] } | null>(null);
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  const dismissCard = useCallback((id: string) => {
    haptic('selection');
    setDismissedCards(prev => new Set(prev).add(id));
  }, []);

  const handleRefresh = useCallback(async () => {
    haptic('medium');
    await Promise.all([
      refreshProfile(),
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard-schedule'] }),
      queryClient.invalidateQueries({ queryKey: ['recommended-events'] }),
    ]);
    haptic('success');
  }, [refreshProfile, queryClient]);

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
  const showUpgrade = (!subscription?.subscribed || subscription?.tier === 'patron') && !subscription?.is_trialing;

  const dashboardContent = (
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

      {/* Welcome header — sticky on mobile */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 md:static md:mx-0 md:px-0 md:py-0 bg-background/95 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-foreground">
          Welcome back, <span className="text-[hsl(var(--accent-gold))]">{profile?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Upgrade Banner — swipe to dismiss on mobile */}
      {showUpgrade && !dismissedCards.has('upgrade') && (
        <SwipeDismiss onDismiss={() => dismissCard('upgrade')}>
          <UpgradePromptCard variant="compact" context="general" />
        </SwipeDismiss>
      )}

      {/* Stats */}
      <div>
        <h2 className="sticky top-16 z-10 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-2 bg-background/95 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none mb-3">
          Overview
        </h2>
        <WidgetErrorBoundary title="Dashboard Stats">
          <DashboardStats />
        </WidgetErrorBoundary>
      </div>

      {/* Schedule + Discover */}
      <div>
        <h2 className="sticky top-16 z-10 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-2 bg-background/95 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none mb-3">
          Activity
        </h2>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <WidgetErrorBoundary title="Upcoming Schedule">
              <UpcomingSchedule />
            </WidgetErrorBoundary>
          </div>
          <div className="lg:col-span-2">
            <DiscoverForYou />
          </div>
        </div>
      </div>

      {/* Profile Completion — swipe to dismiss */}
      {profile && completionPercentage < 100 && !dismissedCards.has('profile') && (
        <div>
          <h2 className="sticky top-16 z-10 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-2 bg-background/95 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none mb-3">
            Complete Your Profile
          </h2>
          <SwipeDismiss onDismiss={() => dismissCard('profile')}>
            <div className="grid gap-4 md:grid-cols-2">
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
          </SwipeDismiss>
        </div>
      )}

      {/* Relationship Health */}
      {canAccessMatchmaking && user && (
        <div>
          <h2 className="sticky top-16 z-10 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-2 bg-background/95 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none mb-3">
            Relationship Health
          </h2>
          <RelationshipHealthSection userId={user.id} />
        </div>
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h2 className="sticky top-16 z-10 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 py-2 bg-background/95 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none mb-3">
            Your Achievements
          </h2>
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <WidgetErrorBoundary title="Your Badges">
              <BadgeDisplay earnedBadges={earnedBadges} showAll={false} compact />
            </WidgetErrorBoundary>
          </div>
        </div>
      )}

      {/* Submit Review */}
      {!dismissedCards.has('review') && (
        <SwipeDismiss onDismiss={() => dismissCard('review')}>
          <SubmitReview />
        </SwipeDismiss>
      )}
    </div>
  );

  // Wrap with pull-to-refresh on mobile
  if (isMobile) {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        {dashboardContent}
      </PullToRefresh>
    );
  }

  return dashboardContent;
}
