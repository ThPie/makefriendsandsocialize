import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { ProfileCompletionCard } from '@/components/portal/dashboard/ProfileCompletionCard';
import { BadgeScroller } from '@/components/portal/dashboard/BadgeScroller';
import { ConciergeGrid } from '@/components/portal/dashboard/ConciergeGrid';
import { OnboardingWizard } from '@/components/portal/OnboardingWizard';
import { BadgeUnlockModal } from '@/components/portal/BadgeUnlockModal';
import { EmailVerificationBanner } from '@/components/portal/EmailVerificationBanner';
import { WidgetErrorBoundary } from '@/components/ui/widget-error-boundary';
import { UpcomingSchedule } from '@/components/portal/dashboard/UpcomingSchedule';
import { Bell } from 'lucide-react';
import { useSiteStats } from '@/hooks/useSiteStats';

export default function PortalDashboard() {
  const { user, profile, refreshProfile } = useAuth();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-md mx-auto pb-24">
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

      {/* Header section moved to Layout in desktop, but we might want a greeting here for mobile/dashboard context */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {getGreeting()}
          </p>
          <h1 className="font-display text-2xl font-medium text-white">
            {profile?.first_name || 'Member'} {profile?.last_name}
          </h1>
        </div>
        <div className="relative">
          {/* Notification icon could go here if not in top bar */}
        </div>
      </div>

      {/* Profile Completion Card (Hero) */}
      <WidgetErrorBoundary title="Profile Status">
        <ProfileCompletionCard
          completionPercentage={completionPercentage}
          profileFn={profile?.first_name || ''}
          profileLn={profile?.last_name || ''}
          tier={subscription?.tier || 'Member'}
        />
      </WidgetErrorBoundary>

      {/* Badges Scroller */}
      <WidgetErrorBoundary title="Badges">
        <BadgeScroller earnedBadges={earnedBadges} />
      </WidgetErrorBoundary>

      {/* Quick Actions (Concierge) */}
      <WidgetErrorBoundary title="Concierge">
        <ConciergeGrid />
      </WidgetErrorBoundary>

      {/* Upcoming Schedule (Existing component, styled to fit?) */}
      <WidgetErrorBoundary title="Upcoming Schedule">
        <UpcomingSchedule />
      </WidgetErrorBoundary>

    </div>
  );
}
