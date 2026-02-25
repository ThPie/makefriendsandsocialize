import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MatchDetailLoadingSkeleton } from '@/components/ui/page-skeleton';
import { DateScheduler } from '@/components/dating/DateScheduler';
import { MatchDecision } from '@/components/dating/MatchDecision';
import { CompatibilityBreakdown } from '@/components/dating/CompatibilityBreakdown';
import { MatchInsightsCard } from '@/components/dating/MatchInsightsCard';
import { CompatibilityTimeline } from '@/components/dating/CompatibilityTimeline';
import { MeetingFeedbackForm } from '@/components/dating/MeetingFeedbackForm';
import { MeetingModeUI } from '@/components/dating/MeetingModeUI';
import { MatchRevealMoment } from '@/components/dating/MatchRevealMoment';
import {
  ArrowLeft,
  Heart,
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  PartyPopper,
  Lock,
  Sparkles,
  Zap,
  Video
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fireCelebration } from '@/hooks/useConfetti';

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  photo_url: string | null;
  age: number;
  gender: string;
  location: string | null;
  occupation: string | null;
  bio: string | null;
  core_values_ranked: string[] | null;
  communication_style: string | null;
  stress_response: string | null;
  repair_attempt_response: string | null;
  vibe_clip_url?: string | null;
  vibe_clip_status?: string | null;
  avatar_urls?: string[];
}

interface MatchDimensions {
  communication?: number;
  values?: number;
  goals?: number;
  lifestyle?: number;
  red_flags?: number;
  gottman_score?: number;
}

interface Match {
  id: string;
  compatibility_score: number;
  match_reason: string;
  match_dimensions: MatchDimensions | null;
  status: string;
  meeting_status: string;
  meeting_date: string | null;
  meeting_time: string | null;
  user_a_response: string;
  user_b_response: string;
  user_a_id: string;
  user_b_id: string;
  origin_story?: string | null;
}

interface Proposal {
  id: string;
  proposed_date: string;
  proposed_time: string;
  status: string;
  proposed_by: string;
}

export default function PortalMatchDetail() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confettiFiredRef = useRef(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showDecision, setShowDecision] = useState(false);

  // Fetch user's dating profile
  const { data: myProfile } = useQuery({
    queryKey: ['my-dating-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as DatingProfile | null;
    },
    enabled: !!user?.id,
  });

  // Fetch the match
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dating_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      return data as unknown as Match;
    },
    enabled: !!matchId,
  });

  // Fetch matched profile
  const { data: matchedProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['matched-profile', match?.user_a_id, match?.user_b_id, myProfile?.id],
    queryFn: async () => {
      if (!match || !myProfile) return null;
      const matchedProfileId = match.user_a_id === myProfile.id ? match.user_b_id : match.user_a_id;

      const { data, error } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('id', matchedProfileId)
        .single();

      if (error) throw error;
      return data as unknown as DatingProfile;
    },
    enabled: !!match && !!myProfile,
  });

  // Fetch meeting proposals
  const { data: proposals = [] } = useQuery({
    queryKey: ['meeting-proposals', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_proposals')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Proposal[];
    },
    enabled: !!matchId,
  });

  const acceptedProposal = proposals.find(p => p.status === 'accepted');

  const isUserA = match?.user_a_id === myProfile?.id;
  const isWoman = myProfile?.gender.toLowerCase() === 'female' || myProfile?.gender.toLowerCase() === 'woman';
  const isRevealed = match?.status === 'mutual_yes';
  const isDeclined = match?.status === 'declined';
  const awaitingDecision = match?.meeting_status === 'met';
  const isScheduled = match?.meeting_status === 'scheduled';

  // Fetch scheduled concierge slot details if applicable
  // Note: The 'concierge_availability' table needs to be created.
  // For now, we use sample data as a placeholder.
  const scheduledSlot = acceptedProposal ? {
    id: 'sample-slot',
    location_name: 'The Grand Hotel Lounge',
    location_address: '123 Luxury Ave',
  } : null;

  // Fetch recommendation rationale
  const { data: recommendation } = useQuery({
    queryKey: ['venue-recommendation', matchId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('recommend-meeting-venue', {
        body: { matchId },
      });
      if (error) throw error;
      return data as { recommended_slot_id: string; rationale: string };
    },
    enabled: !!matchId && isScheduled,
  });

  if (matchLoading || profileLoading) {
    return <MatchDetailLoadingSkeleton />;
  }

  if (!match || !matchedProfile || !myProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Match not found</p>
        <Button variant="outline" onClick={() => navigate('/portal/slow-dating')} className="mt-4">
          Back to Slow Dating
        </Button>
      </div>
    );
  }

  const currentResponse = isUserA ? match?.user_a_response : match?.user_b_response;
  const otherResponse = isUserA ? match?.user_b_response : match?.user_a_response;

  const [showReveal, setShowReveal] = useState(false);
  const userProfile = myProfile;

  // Check for mutual yes to trigger reveal
  useEffect(() => {
    if (match?.meeting_status === 'feedback_positive' && !match.origin_story) {
      // Trigger origin story generation
      supabase.functions.invoke('generate-origin-story', {
        body: { matchId },
      }).then(() => {
        setShowReveal(true);
      });
    } else if (match?.meeting_status === 'feedback_positive' && match.origin_story) {
      const shown = localStorage.getItem(`reveal_shown_${matchId}`);
      if (!shown) {
        setShowReveal(true);
        localStorage.setItem(`reveal_shown_${matchId}`, 'true');
      }
    }
  }, [match?.meeting_status, match?.origin_story, matchId]);

  // Fire confetti when viewing a mutual match for the first time
  useEffect(() => {
    if (isRevealed && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      // Delay slightly so the page renders first
      setTimeout(() => {
        fireCelebration();
        setTimeout(() => fireCelebration(), 400);
      }, 300);
    }
  }, [isRevealed]);

  const getTimeLabel = (timeValue: string) => {
    const labels: Record<string, string> = {
      morning: 'Morning (10 AM - 12 PM)',
      afternoon: 'Afternoon (2 PM - 5 PM)',
      evening: 'Evening (6 PM - 9 PM)',
    };
    return labels[timeValue] || timeValue;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/portal/slow-dating')}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      {showReveal && matchedProfile && (
        <MatchRevealMoment
          matchId={matchId!}
          profileA={userProfile}
          profileB={matchedProfile}
          originStory={match?.origin_story}
          onClose={() => setShowReveal(false)}
        />
      )}

      {/* Revealed Banner */}
      {isRevealed && (
        <div className="bg-gradient-to-r from-dating-forest to-dating-forest/80 text-white rounded-lg p-6 flex items-center justify-center gap-3">
          <PartyPopper className="h-6 w-6" />
          <span className="text-xl font-display">It's a Connection!</span>
          <Heart className="h-6 w-6" />
        </div>
      )}

      {/* Declined Banner */}
      {isDeclined && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">This match has ended gracefully.</p>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card className={cn(
        "overflow-hidden",
        isRevealed ? "border-dating-forest" : "border-dating-cream"
      )}>
        <CardContent className="p-0">
          <div className="md:flex">
            {/* Photo - Heavy blur before reveal */}
            <div className="md:w-1/3 min-h-[300px] relative bg-dating-cream/30">
              {matchedProfile.photo_url ? (
                <img
                  src={matchedProfile.photo_url}
                  alt={isRevealed ? matchedProfile.display_name : 'Your Match'}
                  width={300}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "w-full h-full object-cover",
                    !isRevealed && "blur-3xl scale-125"
                  )}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-24 w-24 text-dating-forest/30" />
                </div>
              )}

              {!isRevealed && (
                <div className="absolute inset-0 bg-dating-cream/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-dating-forest/20 flex items-center justify-center mx-auto mb-3">
                      <Lock className="h-10 w-10 text-dating-forest" />
                    </div>
                    <p className="text-sm text-dating-forest font-medium">
                      Profile reveals after mutual connection
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Vibe Clip Overlay (Always subtlely visible if revealed) */}
            {isRevealed && (matchedProfile as any).vibe_clip_url && (matchedProfile as any).vibe_clip_status === 'verified' && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                  <Video className="h-2.5 w-2.5" />
                  VIBE CLIP READY
                </div>
              </div>
            )}

            {/* Info - Show age always, hide name/location/occupation before reveal */}
            <div className="md:w-2/3 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  {isRevealed ? (
                    <>
                      <h1 className="text-2xl font-display text-foreground">
                        {matchedProfile.display_name}
                      </h1>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span>{matchedProfile.age} years old</span>
                        {matchedProfile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {matchedProfile.location}
                          </span>
                        )}
                        {matchedProfile.occupation && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {matchedProfile.occupation}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-display text-foreground">Your Match</h1>
                      <p className="text-muted-foreground mt-1">
                        {matchedProfile.age} years old
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Complete the journey to reveal full profile
                      </p>
                    </>
                  )}
                </div>
                <Badge className="text-lg px-3 py-1 bg-dating-terracotta/10 text-dating-terracotta border-dating-terracotta/20">
                  {match.compatibility_score}%
                </Badge>
              </div>

              {/* Compatibility Breakdown - Always visible */}
              <CompatibilityBreakdown
                compatibilityScore={match.compatibility_score}
                matchReason={match.match_reason}
                matchDimensions={match.match_dimensions}
                myValues={myProfile.core_values_ranked}
                theirValues={matchedProfile.core_values_ranked}
                myCommunicationStyle={myProfile.communication_style}
                theirCommunicationStyle={matchedProfile.communication_style}
                myStressResponse={myProfile.stress_response}
                theirStressResponse={matchedProfile.stress_response}
                myRepairResponse={myProfile.repair_attempt_response}
                theirRepairResponse={matchedProfile.repair_attempt_response}
                className="mt-4"
              />

              {/* Bio - Only when revealed */}
              {isRevealed && matchedProfile.bio && (
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">About</h3>
                  <p className="text-foreground">{matchedProfile.bio}</p>
                </div>
              )}

              {/* Vibe Clip Player */}
              {isRevealed && (matchedProfile as any).vibe_clip_url && (
                <div className="mt-4">
                  <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Vibe Clip
                  </h3>
                  <div className="rounded-xl overflow-hidden bg-black aspect-video border border-dating-cream">
                    <video
                      src={(matchedProfile as any).vibe_clip_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                </div>
              )}

              {/* Meeting Info */}
              {isScheduled && match.meeting_date && (
                <div className="bg-dating-cream/30 rounded-lg p-4 border border-dating-cream">
                  <h3 className="text-sm uppercase tracking-wide text-dating-forest mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduled Meeting
                  </h3>
                  <p className="font-medium text-foreground">
                    {format(new Date(match.meeting_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  {match.meeting_time && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {getTimeLabel(match.meeting_time)}
                    </p>
                  )}
                  {scheduledSlot && (
                    <div className="mt-3 border-t border-dating-cream pt-3">
                      <div className="flex items-start gap-2 text-sm text-dating-forest font-medium">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <div>
                          <p>{scheduledSlot.location_name}</p>
                          <p className="text-xs text-muted-foreground font-normal">{scheduledSlot.location_address}</p>
                        </div>
                      </div>
                      {recommendation && recommendation.recommended_slot_id === scheduledSlot.id && (
                        <div className="mt-3 bg-primary/10 p-3 rounded-lg border border-[hsl(var(--accent-gold))]/20">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">AI Date Concierge</span>
                          </div>
                          <p className="text-xs text-foreground italic leading-relaxed">
                            "{recommendation.rationale}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* In-Person Meeting Boosters */}
              {isScheduled && matchId && (
                <div className="mt-6">
                  <MeetingModeUI matchId={matchId} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Match Insights - Only for revealed matches */}
      {isRevealed && (
        <div className="grid gap-6 md:grid-cols-2">
          <MatchInsightsCard
            matchExplanation={match.match_reason}
            compatibilityScore={match.compatibility_score}
            sharedValues={matchedProfile.core_values_ranked?.filter((v) =>
              myProfile.core_values_ranked?.includes(v)
            ) || []}
            conversationStarters={[
              `Ask about their ${matchedProfile.occupation || 'work'}`,
              `Share your thoughts on ${matchedProfile.core_values_ranked?.[0] || 'what matters most'}`,
              matchedProfile.location ? `Discuss favorite spots in ${matchedProfile.location}` : 'Share your favorite local spots',
            ]}
            compatibilityFactors={[
              {
                name: 'Values Alignment',
                score: match.match_dimensions?.values || 85,
                icon: Heart,
                description: 'Shared core values and priorities',
                color: 'text-rose-500',
              },
              {
                name: 'Communication',
                score: match.match_dimensions?.communication || 80,
                icon: User,
                description: 'Compatible communication styles',
                color: 'text-blue-500',
              },
              {
                name: 'Life Goals',
                score: match.match_dimensions?.goals || 75,
                icon: Briefcase,
                description: 'Aligned vision for the future',
                color: 'text-emerald-500',
              },
              {
                name: 'Lifestyle',
                score: match.match_dimensions?.lifestyle || 70,
                icon: Calendar,
                description: 'Similar daily routines',
                color: 'text-amber-500',
              },
            ]}
          />
          <CompatibilityTimeline />
        </div>
      )}

      {/* Scheduler or Decision UI */}
      {showScheduler && (
        <DateScheduler
          matchId={match.id}
          currentProfileId={myProfile.id}
          isWoman={isWoman}
          meetingStatus={match.meeting_status}
          proposals={proposals}
          onClose={() => setShowScheduler(false)}
        />
      )}

      {showDecision && (
        <MatchDecision
          matchId={match.id}
          currentProfileId={myProfile.id}
          isUserA={isUserA}
          currentResponse={currentResponse}
          otherResponse={otherResponse}
          onClose={() => setShowDecision(false)}
        />
      )}

      {/* Meeting Feedback UI */}
      {awaitingDecision && (
        <MeetingFeedbackForm
          matchId={match.id}
          userId={user?.id || ''}
          onSuccess={() => {
            // Success logic if needed
          }}
        />
      )}

      {/* Action Cards */}
      {!showScheduler && !showDecision && !isDeclined && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Scheduling Card */}
          {(match.meeting_status === 'pending_woman' || match.meeting_status === 'pending_man') && (
            <Card className="border-dating-forest/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-dating-forest" />
                  Schedule Your Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isWoman && match.meeting_status === 'pending_woman'
                    ? "Propose dates that work for you. Your match will then confirm."
                    : !isWoman && match.meeting_status === 'pending_man'
                      ? "Review the proposed dates and accept one that works for you."
                      : "Waiting for the other person to take action."}
                </p>
                <Button
                  onClick={() => setShowScheduler(true)}
                  className="w-full bg-dating-forest hover:bg-dating-forest/90"
                  disabled={
                    (isWoman && match.meeting_status !== 'pending_woman') ||
                    (!isWoman && match.meeting_status !== 'pending_man')
                  }
                >
                  {isWoman ? 'Propose Dates' : 'Review Proposals'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}