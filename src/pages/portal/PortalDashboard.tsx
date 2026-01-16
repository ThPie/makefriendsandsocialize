import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Calendar, Heart, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { SubmitReview } from '@/components/portal/SubmitReview';
import { ProfileCompletionIndicator } from '@/components/portal/ProfileCompletionIndicator';
import { BadgeDisplay } from '@/components/portal/BadgeDisplay';
import { FeatureUnlockCard } from '@/components/portal/FeatureUnlockCard';
import { OnboardingWizard } from '@/components/portal/OnboardingWizard';
import { BadgeUnlockModal } from '@/components/portal/BadgeUnlockModal';
import { VerificationBadge } from '@/components/portal/VerificationBadge';
import { UpgradePromptCard } from '@/components/portal/UpgradePromptCard';

export default function PortalDashboard() {
  const { user, profile, membership, canAccessMatchmaking, refreshProfile } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<{ badge_type: string; earned_at: string }[]>([]);
  const [newBadge, setNewBadge] = useState<{ name: string; icon: string; description: string; features?: string[] } | null>(null);

  // Calculate completion percentage
  const calculateCompletion = () => {
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
  };

  const completionPercentage = calculateCompletion();
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

  const quickActions = [
    {
      title: 'Complete Your Profile',
      description: 'Add photos and details about yourself',
      icon: User,
      href: '/portal/profile',
      show: true,
    },
    {
      title: 'Browse The Network',
      description: canAccessMatchmaking 
        ? 'Discover like-minded members'
        : 'Upgrade to Fellow to access introductions',
      icon: Users,
      href: '/portal/network',
      show: true,
      locked: !canAccessMatchmaking,
    },
    {
      title: 'Your Connections',
      description: canAccessMatchmaking 
        ? 'View your introduction requests'
        : 'Upgrade to unlock member introductions',
      icon: Heart,
      href: '/portal/connections',
      show: canAccessMatchmaking,
      locked: !canAccessMatchmaking,
    },
    {
      title: 'Upcoming Events',
      description: 'RSVP to exclusive gatherings',
      icon: Calendar,
      href: '/portal/events',
      show: true,
    },
  ];

  return (
    <div className="space-y-12">
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
        <h1 className="font-display font-light text-3xl md:text-4xl text-foreground mb-2 flex items-center gap-2">
          Welcome back, {profile?.first_name || 'Member'}
          <VerificationBadge 
            isVerified={profile?.is_security_verified || false} 
            verifiedAt={profile?.verified_at}
            size="lg"
          />
        </h1>
        <p className="text-muted-foreground">
          Your exclusive access to Make Friends and Socialize
        </p>
      </div>

      {/* Upgrade Banner for Free Users */}
      {(!subscription?.subscribed || subscription?.tier === 'explorer') && !subscription?.is_trialing && (
        <UpgradePromptCard variant="compact" context="general" />
      )}

      {/* Upgrade Banner for Explorer users */}
      {membership?.tier === 'patron' && (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">Unlock The Network</h3>
                <p className="text-muted-foreground text-sm">
                  Upgrade to Member or Fellow to access curated introductions and exclusive events
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/membership">
                Upgrade Membership
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion & Feature Unlocks */}
      {profile && completionPercentage < 100 && (
        <div className="grid gap-8 md:grid-cols-2">
          <ProfileCompletionIndicator profile={profile} />
          <FeatureUnlockCard 
            completionPercentage={completionPercentage} 
            isProfileComplete={isProfileComplete} 
          />
        </div>
      )}

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <BadgeDisplay earnedBadges={earnedBadges} showAll={false} compact />
      )}

      {/* Quick Actions */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.filter(a => a.show).map((action) => (
          <Card 
            key={action.title}
            className={`group hover-lift ${
              action.locked ? 'opacity-75' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${
                  action.locked ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  <action.icon className={`h-6 w-6 ${
                    action.locked ? 'text-muted-foreground' : 'text-primary'
                  }`} />
                </div>
                {action.locked && (
                  <Crown className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="font-display font-light text-xl">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-6">
                {action.description}
              </p>
              <Button 
                asChild 
                variant={action.locked ? 'outline' : 'default'}
                className="w-full"
              >
                <Link to={action.locked ? '/membership' : action.href}>
                  {action.locked ? 'Upgrade to Access' : 'View'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Review */}
      <SubmitReview />
    </div>
  );
}
