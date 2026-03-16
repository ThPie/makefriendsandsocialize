import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Handshake, Clock, CheckCircle2, XCircle, User, Pause, Play, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BlurredMatchCard } from '@/components/dating/BlurredMatchCard';
import { MatchRevealModal } from '@/components/dating/MatchRevealModal';
import { ReactivationModal } from '@/components/dating/ReactivationModal';
import { DatingNotificationPreferences } from '@/components/portal/DatingNotificationPreferences';
import { UpgradePromptCard } from '@/components/portal/UpgradePromptCard';
import { useMatchReveal } from '@/hooks/useMatchReveal';
import { useSubscription } from '@/hooks/useSubscription';

interface DatingProfile {
  id: string;
  display_name: string;
  photo_url: string | null;
  bio: string | null;
  status: string;
  age: number;
  gender: string;
  location: string | null;
  created_at: string;
  is_active: boolean | null;
  paused_reason: string | null;
  paused_at: string | null;
}

interface Match {
  id: string;
  compatibility_score: number;
  match_reason: string;
  match_dimensions?: {
    communication?: number;
    values?: number;
    goals?: number;
    lifestyle?: number;
  } | null;
  status: string;
  meeting_status: string;
  meeting_date: string | null;
  meeting_time: string | null;
  user_a_response: string;
  user_b_response: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  matched_profile?: {
    id: string;
    display_name: string;
    photo_url: string | null;
    age: number;
    gender: string;
    location: string | null;
    occupation: string | null;
    bio: string | null;
  };
}

export default function PortalSlowDating() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [selectedMatchForReveal, setSelectedMatchForReveal] = useState<{ id: string; score: number } | null>(null);

  const { availableReveals, hasUnlimitedReveals, canReveal } = useMatchReveal();
  const { subscription } = useSubscription();

  // Fetch user's dating profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-dating-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as DatingProfile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch user's matches
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['my-dating-matches', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get matches where user is either user_a or user_b — single query
      const { data: allMatches, error } = await supabase
        .from('dating_matches')
        .select('id, compatibility_score, match_reason, match_dimensions, status, meeting_status, meeting_date, meeting_time, user_a_response, user_b_response, user_a_id, user_b_id, created_at')
        .or(`user_a_id.eq.${profile.id},user_b_id.eq.${profile.id}`);

      if (error) throw error;
      if (!allMatches || allMatches.length === 0) return [];

      // Batch fetch all matched profile IDs in a single query (fixes N+1 problem)
      const profileIds = allMatches.map(m =>
        m.user_a_id === profile.id ? m.user_b_id : m.user_a_id
      );

      // Single query for all profiles instead of N queries
      const { data: profiles, error: profilesError } = await supabase
        .from('dating_profiles')
        .select('id, display_name, photo_url, age, gender, location, occupation, bio')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      // Create lookup map for O(1) access
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Enrich matches with profile data from map
      const enrichedMatches = allMatches.map(match => ({
        ...match,
        matched_profile: profileMap.get(
          match.user_a_id === profile.id ? match.user_b_id : match.user_a_id
        ),
      }));

      return enrichedMatches as Match[];
    },
    enabled: !!profile?.id,
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'vetted':
        return {
          label: 'Vetted',
          icon: CheckCircle2,
          className: 'bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] border-[hsl(var(--accent-gold))]/20',
          description: 'Your profile is approved and our matchmakers are finding your ideal connections.',
        };
      case 'pending':
      case 'new':
        return {
          label: 'Under Review',
          icon: Clock,
          className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          description: 'Our team is carefully reviewing your profile. This typically takes 2-3 business days.',
        };
      case 'rejected':
        return {
          label: 'Not Approved',
          icon: XCircle,
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          description: 'Unfortunately, your profile was not approved at this time.',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          className: 'bg-muted text-muted-foreground',
          description: '',
        };
    }
  };

  const isWoman = profile?.gender?.toLowerCase() === 'female' || profile?.gender?.toLowerCase() === 'woman';
  const isPaused = profile?.is_active === false && profile?.paused_reason === 'matched';

  // Categorize matches
  const activeMatches = matches?.filter(m => m.status !== 'declined' && m.status !== 'mutual_yes') || [];
  const revealedMatches = matches?.filter(m => m.status === 'mutual_yes') || [];
  const endedMatches = matches?.filter(m => m.status === 'declined') || [];

  const handleRevealClick = (match: { id: string; compatibility_score: number }) => {
    setSelectedMatchForReveal({ id: match.id, score: match.compatibility_score });
    setRevealModalOpen(true);
  };

  const handleRevealSuccess = () => {
    setRevealModalOpen(false);
    setSelectedMatchForReveal(null);
  };

  if (profileLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  // No profile - show CTA to apply
  if (!profile) {
    return (
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-display font-light text-foreground mb-2">Slow Dating</h1>
          <p className="text-muted-foreground">Handpicked matchmaking for meaningful connections</p>
        </div>

        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-light text-foreground mb-4">
              Join Our Slow Dating Community
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Experience a more intentional approach to dating. Our matchmakers carefully review each profile
              to create meaningful introductions based on shared values and genuine compatibility.
            </p>
            <Button asChild size="lg">
              <TransitionLink to="/dating/apply">
                <Heart className="mr-2 h-5 w-5" />
                Apply Now
              </TransitionLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(profile.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-12">
      {/* Match Reveal Modal */}
      <MatchRevealModal
        isOpen={revealModalOpen}
        onClose={() => setRevealModalOpen(false)}
        matchId={selectedMatchForReveal?.id || ''}
        compatibilityScore={selectedMatchForReveal?.score || 0}
        onRevealSuccess={handleRevealSuccess}
      />

      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Slow Dating</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personalized matchmaking journey</p>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {(!subscription?.subscribed || subscription?.tier === 'patron') && !subscription?.is_trialing && (
        <UpgradePromptCard variant="compact" context="dating" />
      )}

      {/* Paused Banner */}
      {isPaused && (
        <Card className="border-[hsl(var(--accent-gold))]/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Pause className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Your profile is paused</h3>
                  <p className="text-sm text-muted-foreground">
                    Congratulations on your connection! Your profile is hidden from new matches while you explore this connection.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowReactivationModal(true)}
                variant="outline"
                className="shrink-0"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Dating
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Status Card */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Your Dating Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={profile.photo_url || undefined} alt={profile.display_name} />
              <AvatarFallback className="bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))] text-xl">
                {profile.display_name?.[0] || 'M'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-display text-foreground">{profile.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile.age} years old{profile.location && ` • ${profile.location}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={statusConfig.className}>
                  <StatusIcon className="h-3.5 w-3.5 mr-1" />
                  {statusConfig.label}
                </Badge>
                {isPaused && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Pause className="h-3.5 w-3.5 mr-1" />
                    Paused
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {isPaused
                  ? "Your profile is currently hidden from matching. Resume when you're ready to explore new connections."
                  : statusConfig.description}
              </p>
            </div>

            <Button variant="outline" asChild>
              <TransitionLink to="/dating/apply">
                Edit Profile
              </TransitionLink>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revealed Matches Section */}
      {revealedMatches.length > 0 && (
        <div>
          <h2 className="text-xl font-display font-light text-foreground mb-6 flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Your Connections
            <Badge variant="secondary" className="ml-2 bg-[hsl(var(--accent-gold))]/10 text-[hsl(var(--accent-gold))]">
              {revealedMatches.length}
            </Badge>
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {revealedMatches.map((match) => (
              <BlurredMatchCard
                key={match.id}
                match={match}
                currentProfileId={profile.id}
                isWoman={isWoman}
                onSchedule={() => navigate(`/portal/match/${match.id}`)}
                onViewDetails={() => navigate(`/portal/match/${match.id}`)}
                availableReveals={availableReveals}
                hasUnlimitedReveals={hasUnlimitedReveals}
                canReveal={canReveal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Matches Section */}
      <div>
        <h2 className="text-xl font-display font-light text-foreground mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Active Matches
          {activeMatches.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeMatches.length}
            </Badge>
          )}
        </h2>

        {matchesLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : activeMatches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {activeMatches.map((match) => (
              <BlurredMatchCard
                key={match.id}
                match={match}
                currentProfileId={profile.id}
                isWoman={isWoman}
                onSchedule={() => navigate(`/portal/match/${match.id}`)}
                onViewDetails={() => navigate(`/portal/match/${match.id}`)}
                onReveal={() => handleRevealClick(match)}
                availableReveals={availableReveals}
                hasUnlimitedReveals={hasUnlimitedReveals}
                canReveal={canReveal}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="py-16 text-center">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Active Matches Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {isPaused
                  ? "Your profile is paused. Resume dating to receive new matches."
                  : profile.status === 'vetted'
                    ? "Our matchmakers are carefully reviewing profiles to find your ideal connections. We'll notify you when we find a match!"
                    : "Once your profile is approved, our matchmakers will begin finding compatible matches for you."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ended Matches Section */}
      {endedMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-muted-foreground mb-6">
            Past Matches
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {endedMatches.map((match) => (
              <BlurredMatchCard
                key={match.id}
                match={match}
                currentProfileId={profile.id}
                isWoman={isWoman}
                onSchedule={() => { }}
                onViewDetails={() => navigate(`/portal/match/${match.id}`)}
                availableReveals={availableReveals}
                hasUnlimitedReveals={hasUnlimitedReveals}
                canReveal={canReveal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      <div>
        <h2 className="text-xl font-display font-light text-foreground mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Settings
        </h2>
        <DatingNotificationPreferences />
      </div>

      {/* Reactivation Modal */}
      {profile && (
        <ReactivationModal
          open={showReactivationModal}
          onOpenChange={setShowReactivationModal}
          profileId={profile.id}
        />
      )}
    </div>
  );
}